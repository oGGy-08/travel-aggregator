from flask import Blueprint, request, jsonify
from datetime import date, datetime
import json
from ...services.aggregators.flights import FlightAggregator
from ...services.aggregators.buses import BusAggregator
from ...services.aggregators.hotels import HotelAggregator
from ...services.search_service import SearchService
from ...services.cache import get_cached_results, set_cached_results
from ...extensions import db
from ...models.search_session import SearchSession

search_bp = Blueprint('search', __name__)
flight_agg = FlightAggregator()
bus_agg = BusAggregator()
hotel_agg = HotelAggregator()
search_service = SearchService()

# Simple in-memory rate limit tracker
_rate_limits = {}


def _check_rate_limit(ip, limit=30):
    """Basic rate limiting: max `limit` requests per minute per IP."""
    import time
    now = time.time()
    key = f"rl:{ip}"
    if key not in _rate_limits:
        _rate_limits[key] = []
    # Remove entries older than 60 seconds
    _rate_limits[key] = [t for t in _rate_limits[key] if now - t < 60]
    if len(_rate_limits[key]) >= limit:
        return False
    _rate_limits[key].append(now)
    return True


def _save_search_session(search_type, origin, destination, dep_date, results_count, user_id=None):
    """Persist search session to DB for analytics."""
    try:
        session = SearchSession(
            user_id=user_id,
            search_type=search_type,
            origin=origin,
            destination=destination,
            departure_date=dep_date,
            results_count=results_count,
        )
        db.session.add(session)
        db.session.commit()
    except Exception:
        db.session.rollback()


@search_bp.route('/flights', methods=['POST'])
def search_flights():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request body'}), 400

    # Rate limiting
    if not _check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Rate limit exceeded. Try again in 60 seconds.'}), 429

    try:
        params = {
            'origin': data.get('origin', 'DEL'),
            'destination': data.get('destination', 'BOM'),
            'departure_date': date.fromisoformat(data.get('departure_date', str(date.today()))),
            'passengers': data.get('passengers', 1),
        }

        # Check cache first
        cached = get_cached_results('FLIGHT', params)
        if cached:
            return jsonify({'results': cached, 'count': len(cached), 'search_type': 'FLIGHT', 'cached': True})

        results = flight_agg.search(params)
        results = search_service.deduplicate(results)

        # Cache results
        set_cached_results('FLIGHT', params, results)

        # Save to DB for analytics
        _save_search_session('FLIGHT', params['origin'], params['destination'],
                             params['departure_date'], len(results))

        return jsonify({'results': results, 'count': len(results), 'search_type': 'FLIGHT', 'cached': False})
    except Exception as e:
        return jsonify({'error': str(e), 'results': [], 'count': 0}), 200


@search_bp.route('/buses', methods=['POST'])
def search_buses():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request body'}), 400

    if not _check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Rate limit exceeded. Try again in 60 seconds.'}), 429

    try:
        params = {
            'origin': data.get('origin', 'Delhi'),
            'destination': data.get('destination', 'Jaipur'),
            'departure_date': date.fromisoformat(data.get('departure_date', str(date.today()))),
        }

        cached = get_cached_results('BUS', params)
        if cached:
            return jsonify({'results': cached, 'count': len(cached), 'search_type': 'BUS', 'cached': True})

        results = bus_agg.search(params)
        results = search_service.deduplicate(results)

        set_cached_results('BUS', params, results)
        _save_search_session('BUS', params['origin'], params['destination'],
                             params['departure_date'], len(results))

        return jsonify({'results': results, 'count': len(results), 'search_type': 'BUS', 'cached': False})
    except Exception as e:
        return jsonify({'error': str(e), 'results': [], 'count': 0}), 200


@search_bp.route('/hotels', methods=['POST'])
def search_hotels():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request body'}), 400

    if not _check_rate_limit(request.remote_addr):
        return jsonify({'error': 'Rate limit exceeded. Try again in 60 seconds.'}), 429

    try:
        params = {
            'destination': data.get('destination', 'Mumbai'),
            'check_in_date': date.fromisoformat(data.get('check_in_date', str(date.today()))),
            'check_out_date': date.fromisoformat(data.get('check_out_date', str(date.today()))),
        }

        cached = get_cached_results('HOTEL', params)
        if cached:
            return jsonify({'results': cached, 'count': len(cached), 'search_type': 'HOTEL', 'cached': True})

        results = hotel_agg.search(params)
        results = search_service.deduplicate(results)

        set_cached_results('HOTEL', params, results)
        _save_search_session('HOTEL', '', params['destination'],
                             params['check_in_date'], len(results))

        return jsonify({'results': results, 'count': len(results), 'search_type': 'HOTEL', 'cached': False})
    except Exception as e:
        return jsonify({'error': str(e), 'results': [], 'count': 0}), 200


@search_bp.route('/filter', methods=['POST'])
def filter_results():
    data = request.get_json()
    results = data.get('results', [])
    filters = data.get('filters', {})
    filtered = search_service.apply_filters(results, filters)
    return jsonify({'results': filtered, 'count': len(filtered)})


@search_bp.route('/sort', methods=['POST'])
def sort_results():
    data = request.get_json()
    results = data.get('results', [])
    sort_by = data.get('sort_by', 'price_amount')
    order = data.get('order', 'asc')
    sorted_results = search_service.apply_sort(results, sort_by, order)
    return jsonify({'results': sorted_results, 'count': len(sorted_results)})


@search_bp.route('/cities', methods=['GET'])
def search_cities():
    """Return matching cities for autocomplete."""
    query = request.args.get('q', '').lower()
    cities = [
        {'code': 'DEL', 'name': 'New Delhi', 'airport': 'Indira Gandhi International'},
        {'code': 'BOM', 'name': 'Mumbai', 'airport': 'Chhatrapati Shivaji Maharaj'},
        {'code': 'BLR', 'name': 'Bangalore', 'airport': 'Kempegowda International'},
        {'code': 'MAA', 'name': 'Chennai', 'airport': 'Chennai International'},
        {'code': 'CCU', 'name': 'Kolkata', 'airport': 'Netaji Subhas Chandra Bose'},
        {'code': 'HYD', 'name': 'Hyderabad', 'airport': 'Rajiv Gandhi International'},
        {'code': 'AMD', 'name': 'Ahmedabad', 'airport': 'Sardar Vallabhbhai Patel'},
        {'code': 'PNQ', 'name': 'Pune', 'airport': 'Pune Airport'},
        {'code': 'GOI', 'name': 'Goa', 'airport': 'Manohar International'},
        {'code': 'JAI', 'name': 'Jaipur', 'airport': 'Jaipur International'},
        {'code': 'LKO', 'name': 'Lucknow', 'airport': 'Chaudhary Charan Singh'},
        {'code': 'COK', 'name': 'Kochi', 'airport': 'Cochin International'},
        {'code': 'GAU', 'name': 'Guwahati', 'airport': 'Lokpriya Gopinath Bordoloi'},
        {'code': 'VNS', 'name': 'Varanasi', 'airport': 'Lal Bahadur Shastri'},
        {'code': 'IXC', 'name': 'Chandigarh', 'airport': 'Chandigarh Airport'},
        {'code': 'PAT', 'name': 'Patna', 'airport': 'Jay Prakash Narayan'},
        {'code': 'AGR', 'name': 'Agra', 'airport': 'Agra Airport'},
        {'code': 'UDR', 'name': 'Udaipur', 'airport': 'Maharana Pratap'},
        {'code': 'SXR', 'name': 'Srinagar', 'airport': 'Sheikh ul-Alam'},
        {'code': 'DED', 'name': 'Dehradun', 'airport': 'Jolly Grant Airport'},
    ]
    if not query:
        return jsonify({'cities': cities[:10]})
    matches = [c for c in cities if query in c['name'].lower() or query in c['code'].lower()]
    return jsonify({'cities': matches[:8]})
