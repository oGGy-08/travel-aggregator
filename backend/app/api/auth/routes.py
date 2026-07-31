from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import datetime
from ...extensions import db
from ...models.user import User
from ...config import BaseConfig

auth_bp = Blueprint('auth', __name__)


def generate_tokens(user_id):
    now = datetime.datetime.now(datetime.timezone.utc)
    access_token = jwt.encode(
        {'user_id': user_id, 'exp': now + datetime.timedelta(seconds=BaseConfig.JWT_ACCESS_TOKEN_EXPIRES)},
        BaseConfig.SECRET_KEY, algorithm='HS256'
    )
    refresh_token = jwt.encode(
        {'user_id': user_id, 'exp': now + datetime.timedelta(seconds=BaseConfig.JWT_REFRESH_TOKEN_EXPIRES),
         'type': 'refresh'},
        BaseConfig.SECRET_KEY, algorithm='HS256'
    )
    return access_token, refresh_token


def get_current_user():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, BaseConfig.SECRET_KEY, algorithms=['HS256'])
        return payload.get('user_id')
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('full_name'):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(email=data['email'], password_hash=password_hash, full_name=data['full_name'],
                phone=data.get('phone'))
    db.session.add(user)
    db.session.commit()

    access_token, refresh_token = generate_tokens(user.id)
    return jsonify({'access_token': access_token, 'refresh_token': refresh_token,
                    'user': {'id': user.id, 'email': user.email, 'full_name': user.full_name}}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token, refresh_token = generate_tokens(user.id)
    return jsonify({'access_token': access_token, 'refresh_token': refresh_token,
                    'user': {'id': user.id, 'email': user.email, 'full_name': user.full_name}})


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    data = request.get_json()
    if not data or not data.get('refresh_token'):
        return jsonify({'error': 'Missing refresh token'}), 400
    try:
        payload = jwt.decode(data['refresh_token'], BaseConfig.SECRET_KEY, algorithms=['HS256'])
        if payload.get('type') != 'refresh':
            return jsonify({'error': 'Invalid token type'}), 401
        access_token, refresh_token = generate_tokens(payload['user_id'])
        return jsonify({'access_token': access_token, 'refresh_token': refresh_token})
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({'error': 'Invalid or expired refresh token'}), 401


@auth_bp.route('/me', methods=['GET'])
def me():
    user_id = get_current_user()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'id': user.id, 'email': user.email, 'full_name': user.full_name,
                    'preferred_currency': user.preferred_currency})
