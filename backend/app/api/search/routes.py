from flask import Blueprint, request, jsonify
from datetime import date, datetime
import json
from ...services.aggregators.flights import FlightAggregator
from ...services.aggregators.buses import BusAggregator
from ...services.aggregators.hotels import HotelAggregator
from ...services.search_service import SearchService

search_bp = Blueprint('search', __name__)
flight_agg = FlightAggregator()
bus_agg = BusAggregator()
hotel_agg = HotelAggregator()
search_service = SearchService()


@search_bp.route('/flights', methods=['POST'])
def search_flights():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request body'}), 400
    try:
        params = {
            'origin': data.get('origin', 'DEL'),
            'destination': data.get('destination', 'BOM'),
            'departure_date': date.fromisoformat(data.get('departure_date', str(date.today()))),
            'passengers': data.get('passengers', 1),
        }
        results = flight_agg.search(params)
        results = search_service.deduplicate(results)
        return jsonify({'results': results, 'count': len(results), 'search_type': 'FLIGHT'})
    except Exception as e:
        return jsonify({'error': str(e), 'results': [], 'count': 0}), 200


@search_bp.route('/buses', methods=['POST'])
def search_buses():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request body'}), 400
    try:
        params = {
            'origin': data.get('origin', 'Delhi'),
            'destination': data.get('destination', 'Jaipur'),
            'departure_date': date.fromisoformat(data.get('departure_date', str(date.today()))),
        }
        results = bus_agg.search(params)
        results = search_service.deduplicate(results)
        return jsonify({'results': results, 'count': len(results), 'search_type': 'BUS'})
    except Exception as e:
        return jsonify({'error': str(e), 'results': [], 'count': 0}), 200


@search_bp.route('/hotels', methods=['POST'])
def search_hotels():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request body'}), 400
    try:
        params = {
            'destination': data.get('destination', 'Mumbai'),
            'check_in_date': date.fromisoformat(data.get('check_in_date', str(date.today()))),
            'check_out_date': date.fromisoformat(data.get('check_out_date', str(date.today()))),
        }
        results = hotel_agg.search(params)
        results = search_service.deduplicate(results)
        return jsonify({'results': results, 'count': len(results), 'search_type': 'HOTEL'})
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
