from flask import Blueprint, request, jsonify
from datetime import date
from ...extensions import db
from ...models.package import Package
from ...models.package_segment import PackageSegment
from ...services.package_engine import PackageEngine
from ...api.auth.routes import get_current_user

packages_bp = Blueprint('packages', __name__)
engine = PackageEngine()


@packages_bp.route('/', methods=['POST'])
def create_package():
    data = request.get_json()
    if not data or not data.get('segments'):
        return jsonify({'error': 'Missing segments'}), 400

    segments = data['segments']
    result = engine.build_package(segments)

    if not result['validation']['valid']:
        return jsonify({
            'error': 'Package has compatibility conflicts',
            'conflicts': result['validation']['conflicts'],
            'suggestions': 'Try adjusting segment times to avoid overlaps'
        }), 422

    pricing = result['pricing']
    score = result['compatibility_score']

    # Get actual user ID from JWT token, allow anonymous if not logged in
    user_id = get_current_user() or data.get('user_id')

    # If no valid user, save without foreign key constraint
    if not user_id:
        return jsonify({
            'package': {
                'segments': segments,
                'total_price': pricing['total_price'],
                'individual_price_sum': pricing['individual_price_sum'],
                'savings_amount': pricing['savings_amount'],
                'savings_percentage': pricing['savings_percentage'],
                'compatibility_score': score,
            }
        }), 201

    # Save package to DB
    package = Package(
        user_id=user_id,
        name=data.get('name', 'My Travel Package'),
        status='SAVED',
        origin_city=data.get('origin_city', segments[0].get('origin', 'Origin')),
        destination_city=data.get('destination_city', segments[-1].get('destination', 'Destination')),
        start_date=date.today(),
        end_date=date.today(),
        passengers=data.get('passengers', 1),
        total_price=pricing['total_price'],
        individual_price_sum=pricing['individual_price_sum'],
        savings_amount=pricing['savings_amount'],
        savings_percentage=pricing['savings_percentage'],
        compatibility_score=score,
    )
    db.session.add(package)
    db.session.flush()

    # Save each segment to DB
    for idx, seg in enumerate(segments):
        segment = PackageSegment(
            package_id=package.id,
            segment_type=seg.get('segment_type', 'FLIGHT'),
            segment_ref_id=seg.get('id', ''),
            position=idx,
            start_datetime=seg.get('start_datetime', '2025-01-01T00:00:00'),
            end_datetime=seg.get('end_datetime', '2025-01-01T00:00:00'),
            price_amount=seg.get('price_amount', 0),
            price_currency='INR',
            provider=seg.get('provider', ''),
            summary=seg.get('summary', ''),
        )
        db.session.add(segment)

    db.session.commit()

    return jsonify({
        'package': {
            'id': package.id,
            'segments': segments,
            'total_price': pricing['total_price'],
            'individual_price_sum': pricing['individual_price_sum'],
            'savings_amount': pricing['savings_amount'],
            'savings_percentage': pricing['savings_percentage'],
            'compatibility_score': score,
        }
    }), 201


@packages_bp.route('/', methods=['GET'])
def list_packages():
    user_id = request.args.get('user_id')
    query = Package.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    packages = query.order_by(Package.created_at.desc()).all()
    return jsonify({'packages': [{
        'id': p.id, 'name': p.name, 'status': p.status,
        'total_price': p.total_price, 'savings_amount': p.savings_amount,
        'savings_percentage': p.savings_percentage,
        'compatibility_score': p.compatibility_score,
    } for p in packages]})


@packages_bp.route('/validate', methods=['POST'])
def validate_package():
    data = request.get_json()
    if not data or not data.get('segments'):
        return jsonify({'error': 'Missing segments'}), 400
    result = engine.validate_compatibility(data['segments'])
    return jsonify(result)
