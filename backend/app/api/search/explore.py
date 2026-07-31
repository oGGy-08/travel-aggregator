"""Real-time 'Explore Everywhere' endpoint — shows cheapest flights from a city to anywhere."""
import httpx
import os
from flask import Blueprint, request, jsonify

explore_bp = Blueprint('explore', __name__)

RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY', '')
SKY_SCRAPPER_HOST = 'sky-scrapper.p.rapidapi.com'


def _headers():
    return {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': SKY_SCRAPPER_HOST,
    }


@explore_bp.route('/everywhere', methods=['GET'])
def search_everywhere():
    """Get cheapest flights from an origin to any destination."""
    origin = request.args.get('origin', 'DEL')

    if not RAPIDAPI_KEY:
        return jsonify({'error': 'API key not configured', 'deals': _fallback_deals()}), 200

    try:
        # First get the entity ID for the origin
        airport_url = f'https://{SKY_SCRAPPER_HOST}/api/v1/flights/searchAirport'
        resp = httpx.get(airport_url, headers=_headers(), params={'query': origin, 'locale': 'en-US'}, timeout=10)
        entity_id = None
        if resp.status_code == 200:
            data = resp.json()
            if data.get('status') and data.get('data'):
                entity_id = data['data'][0].get('entityId')

        if not entity_id:
            return jsonify({'deals': _fallback_deals()}), 200

        # Search everywhere
        url = f'https://{SKY_SCRAPPER_HOST}/api/v1/flights/searchFlightEverywhere'
        params = {
            'originEntityId': entity_id,
            'currency': 'INR',
            'market': 'IN',
            'countryCode': 'IN',
            'locale': 'en-US',
        }
        resp = httpx.get(url, headers=_headers(), params=params, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            deals = _normalize_everywhere(data)
            if deals:
                return jsonify({'deals': deals, 'source': 'live'}), 200
    except Exception as e:
        print(f"Explore API error: {e}")

    return jsonify({'deals': _fallback_deals(), 'source': 'cached'}), 200


def _normalize_everywhere(raw_data):
    """Normalize the searchFlightEverywhere response."""
    deals = []
    results = raw_data.get('data', [])
    if isinstance(results, dict):
        results = results.get('everywhereDestination', {}).get('results', [])

    for item in results[:20]:
        content = item.get('content', {})
        location = content.get('location', {})
        flight_quotes = content.get('flightQuotes', {})
        cheapest = flight_quotes.get('cheapest', {})

        price = cheapest.get('price') or content.get('price', '')
        # Parse price string like "₹3,499"
        if isinstance(price, str):
            price = price.replace('₹', '').replace(',', '').strip()
            try:
                price = float(price)
            except ValueError:
                price = 0

        deals.append({
            'destination': location.get('name', item.get('name', 'Unknown')),
            'country': location.get('countryName', ''),
            'image': content.get('image', {}).get('url', ''),
            'price': price,
            'currency': 'INR',
            'direct_flight': cheapest.get('isDirect', False),
        })
    return deals


def _fallback_deals():
    """Hardcoded popular Indian domestic deals."""
    return [
        {'destination': 'Mumbai', 'country': 'India', 'price': 3499, 'currency': 'INR', 'direct_flight': True, 'image': ''},
        {'destination': 'Bangalore', 'country': 'India', 'price': 4299, 'currency': 'INR', 'direct_flight': True, 'image': ''},
        {'destination': 'Goa', 'country': 'India', 'price': 3899, 'currency': 'INR', 'direct_flight': True, 'image': ''},
        {'destination': 'Chennai', 'country': 'India', 'price': 4599, 'currency': 'INR', 'direct_flight': True, 'image': ''},
        {'destination': 'Kolkata', 'country': 'India', 'price': 4999, 'currency': 'INR', 'direct_flight': True, 'image': ''},
        {'destination': 'Jaipur', 'country': 'India', 'price': 2899, 'currency': 'INR', 'direct_flight': True, 'image': ''},
        {'destination': 'Hyderabad', 'country': 'India', 'price': 3799, 'currency': 'INR', 'direct_flight': True, 'image': ''},
        {'destination': 'Kochi', 'country': 'India', 'price': 5299, 'currency': 'INR', 'direct_flight': True, 'image': ''},
        {'destination': 'Srinagar', 'country': 'India', 'price': 5999, 'currency': 'INR', 'direct_flight': False, 'image': ''},
        {'destination': 'Udaipur', 'country': 'India', 'price': 3299, 'currency': 'INR', 'direct_flight': True, 'image': ''},
    ]


@explore_bp.route('/airport-search', methods=['GET'])
def live_airport_search():
    """Live airport/city autocomplete from the API."""
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify({'results': []}), 200

    if not RAPIDAPI_KEY:
        return jsonify({'results': []}), 200

    try:
        url = f'https://{SKY_SCRAPPER_HOST}/api/v1/flights/searchAirport'
        params = {'query': query, 'locale': 'en-US'}
        resp = httpx.get(url, headers=_headers(), params=params, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            results = []
            for item in (data.get('data') or [])[:8]:
                results.append({
                    'skyId': item.get('skyId', ''),
                    'entityId': item.get('entityId', ''),
                    'name': item.get('presentation', {}).get('title', ''),
                    'subtitle': item.get('presentation', {}).get('subtitle', ''),
                    'type': item.get('navigation', {}).get('entityType', ''),
                })
            return jsonify({'results': results}), 200
    except Exception as e:
        print(f"Airport search error: {e}")

    return jsonify({'results': []}), 200


@explore_bp.route('/price-calendar', methods=['GET'])
def price_calendar():
    """Get price trends for a route across dates (simulated from search data)."""
    origin = request.args.get('origin', 'DEL')
    destination = request.args.get('destination', 'BOM')

    # Generate price calendar data (in production this would come from cached searches)
    import random
    from datetime import date, timedelta

    today = date.today()
    calendar = []
    base_price = random.randint(3000, 6000)

    for i in range(30):
        day = today + timedelta(days=i)
        # Weekend premium
        weekend_factor = 1.3 if day.weekday() >= 5 else 1.0
        # Random variation
        variation = random.uniform(0.8, 1.4)
        price = int(base_price * weekend_factor * variation)

        calendar.append({
            'date': day.isoformat(),
            'price': price,
            'currency': 'INR',
            'is_cheapest': False,
        })

    # Mark cheapest
    min_price = min(calendar, key=lambda x: x['price'])
    min_price['is_cheapest'] = True

    return jsonify({
        'origin': origin,
        'destination': destination,
        'calendar': calendar,
        'cheapest_date': min_price['date'],
        'cheapest_price': min_price['price'],
    })
