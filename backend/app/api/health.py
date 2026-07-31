"""Health check and admin endpoints."""
from flask import Blueprint, jsonify
from ..extensions import db, redis_client
from ..models.search_session import SearchSession
from ..models.user import User
from ..models.booking import Booking
from ..models.package import Package
from sqlalchemy import func

health_bp = Blueprint('health', __name__)


@health_bp.route('/health', methods=['GET'])
def health_check():
    """System health check — DB, Redis, API status."""
    status = {'status': 'healthy', 'services': {}}

    # Check DB
    try:
        db.session.execute(db.text('SELECT 1'))
        status['services']['database'] = 'connected'
    except Exception as e:
        status['services']['database'] = f'error: {str(e)}'
        status['status'] = 'degraded'

    # Check Redis
    try:
        redis_client.ping()
        status['services']['redis'] = 'connected'
    except Exception:
        status['services']['redis'] = 'disconnected'
        status['status'] = 'degraded'

    return jsonify(status), 200 if status['status'] == 'healthy' else 503


@health_bp.route('/admin/stats', methods=['GET'])
def admin_stats():
    """Admin analytics dashboard data."""
    try:
        total_users = User.query.count()
        total_searches = SearchSession.query.count()
        total_bookings = Booking.query.count()
        total_packages = Package.query.count()

        # Most searched routes
        top_routes = db.session.query(
            SearchSession.origin, SearchSession.destination,
            func.count(SearchSession.id).label('count')
        ).group_by(SearchSession.origin, SearchSession.destination)\
         .order_by(func.count(SearchSession.id).desc()).limit(10).all()

        # Search type distribution
        type_dist = db.session.query(
            SearchSession.search_type, func.count(SearchSession.id).label('count')
        ).group_by(SearchSession.search_type).all()

        return jsonify({
            'totals': {
                'users': total_users,
                'searches': total_searches,
                'bookings': total_bookings,
                'packages': total_packages,
            },
            'top_routes': [{'origin': r[0], 'destination': r[1], 'count': r[2]} for r in top_routes],
            'search_types': [{'type': t[0], 'count': t[1]} for t in type_dist],
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@health_bp.route('/admin/search-history', methods=['GET'])
def search_history():
    """Recent search sessions for analytics."""
    from flask import request
    user_id = request.args.get('user_id')
    limit = int(request.args.get('limit', 20))

    query = SearchSession.query.order_by(SearchSession.created_at.desc())
    if user_id:
        query = query.filter_by(user_id=user_id)

    sessions = query.limit(limit).all()
    return jsonify({'history': [{
        'id': s.id,
        'search_type': s.search_type,
        'origin': s.origin,
        'destination': s.destination,
        'departure_date': str(s.departure_date),
        'results_count': s.results_count,
        'created_at': s.created_at.isoformat() if s.created_at else None,
    } for s in sessions]})
