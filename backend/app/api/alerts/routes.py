from flask import Blueprint, request, jsonify
from ...extensions import db
from ...models.price_alert import PriceAlert

alerts_bp = Blueprint('alerts', __name__)


@alerts_bp.route('/', methods=['POST'])
def create_alert():
    data = request.get_json()
    if not data or not data.get('search_params') or not data.get('target_price'):
        return jsonify({'error': 'Missing required fields'}), 400

    alert = PriceAlert(
        user_id=data.get('user_id', 'anonymous'),
        search_type=data.get('search_type', 'FLIGHT'),
        search_params=data['search_params'],
        target_price=data['target_price'],
        current_price=data.get('current_price'),
        notification_method=data.get('notification_method', 'EMAIL'),
    )
    db.session.add(alert)
    db.session.commit()

    return jsonify({
        'id': alert.id,
        'search_type': alert.search_type,
        'search_params': alert.search_params,
        'target_price': alert.target_price,
        'is_active': alert.is_active,
        'notification_method': alert.notification_method,
    }), 201


@alerts_bp.route('/', methods=['GET'])
def list_alerts():
    user_id = request.args.get('user_id')
    query = PriceAlert.query.filter_by(is_active=True)
    if user_id:
        query = query.filter_by(user_id=user_id)
    alerts = query.all()
    return jsonify({'alerts': [{
        'id': a.id, 'search_type': a.search_type,
        'search_params': a.search_params, 'target_price': a.target_price,
        'current_price': a.current_price, 'is_active': a.is_active,
    } for a in alerts]})


@alerts_bp.route('/<alert_id>', methods=['GET'])
def get_alert(alert_id):
    alert = PriceAlert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    return jsonify({
        'id': alert.id, 'search_type': alert.search_type,
        'search_params': alert.search_params, 'target_price': alert.target_price,
        'current_price': alert.current_price, 'is_active': alert.is_active,
        'notification_method': alert.notification_method,
    })


@alerts_bp.route('/<alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    alert = PriceAlert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    alert.is_active = False
    db.session.commit()
    return jsonify({'message': 'Alert deactivated'}), 200
