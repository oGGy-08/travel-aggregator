import uuid
import random
from datetime import datetime, timedelta, timezone
from .base import BaseAggregator

OPERATORS = [
    'KSRTC', 'APSRTC', 'TSRTC', 'VRL Travels', 'SRS Travels',
    'Neeta Travels', 'Paulo Travels', 'Orange Tours', 'Jabbar Travels',
    'KPN Travels', 'SRM Travels', 'Parveen Travels', 'IntrCity SmartBus',
    'Zingbus', 'RedBus Primo', 'AbhiBus Select',
]

BUS_TYPES = ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Volvo Multi-Axle',
             'Mercedes Benz', 'Scania Multi-Axle', 'Semi-Sleeper', 'Ordinary']

ROUTES = {
    ('Delhi', 'Jaipur'): {'min_dur': 240, 'max_dur': 360, 'min_price': 400, 'max_price': 1800},
    ('Mumbai', 'Pune'): {'min_dur': 180, 'max_dur': 300, 'min_price': 300, 'max_price': 1200},
    ('Bangalore', 'Chennai'): {'min_dur': 300, 'max_dur': 420, 'min_price': 500, 'max_price': 2000},
    ('Hyderabad', 'Bangalore'): {'min_dur': 480, 'max_dur': 660, 'min_price': 700, 'max_price': 2500},
    ('Delhi', 'Agra'): {'min_dur': 180, 'max_dur': 270, 'min_price': 300, 'max_price': 1000},
    ('Mumbai', 'Goa'): {'min_dur': 540, 'max_dur': 720, 'min_price': 800, 'max_price': 3000},
    ('Chennai', 'Pondicherry'): {'min_dur': 120, 'max_dur': 180, 'min_price': 200, 'max_price': 800},
    ('Kolkata', 'Digha'): {'min_dur': 180, 'max_dur': 270, 'min_price': 250, 'max_price': 700},
}

DEFAULT_ROUTE = {'min_dur': 180, 'max_dur': 600, 'min_price': 300, 'max_price': 2500}


class BusAggregator(BaseAggregator):
    """Provides Indian bus travel data with realistic pricing in INR."""

    def search(self, params):
        origin = params.get('origin', 'Delhi')
        destination = params.get('destination', 'Jaipur')
        departure_date = params.get('departure_date')

        route_key = (origin, destination)
        route_config = ROUTES.get(route_key, DEFAULT_ROUTE)
        results = []

        for _ in range(random.randint(10, 20)):
            operator = random.choice(OPERATORS)
            bus_type = random.choice(BUS_TYPES)
            dep_hour = random.randint(5, 23)
            duration = random.randint(route_config['min_dur'], route_config['max_dur'])
            price = random.randint(route_config['min_price'], route_config['max_price'])

            # Premium pricing for AC/Volvo
            if 'Volvo' in bus_type or 'Mercedes' in bus_type or 'Scania' in bus_type:
                price = int(price * 1.5)
            elif 'Non-AC' in bus_type or 'Ordinary' in bus_type:
                price = int(price * 0.6)

            dep_time = datetime(departure_date.year, departure_date.month,
                                departure_date.day, dep_hour, random.choice([0, 15, 30, 45]),
                                tzinfo=timezone.utc)
            arr_time = dep_time + timedelta(minutes=duration)

            results.append({
                'id': str(uuid.uuid4()),
                'provider': random.choice(['redbus', 'abhibus', 'makemytrip']),
                'provider_ref': f"bus_{uuid.uuid4().hex[:8]}",
                'operator_name': operator,
                'bus_type': bus_type,
                'origin_station': f"{origin} ISBT" if 'Delhi' in origin else f"{origin} Bus Stand",
                'destination_station': f"{destination} Bus Stand",
                'departure_time': dep_time.isoformat(),
                'arrival_time': arr_time.isoformat(),
                'duration_minutes': duration,
                'stops': random.randint(0, 4),
                'amenities': random.sample(['wifi', 'ac', 'charging', 'blanket',
                                            'water_bottle', 'snacks', 'toilet',
                                            'entertainment', 'reading_light'], k=random.randint(3, 6)),
                'price_amount': price,
                'price_currency': 'INR',
                'seats_available': random.randint(1, 35),
                'rating': round(random.uniform(3.2, 4.9), 1),
                'booking_url': f"https://www.redbus.in/book/{uuid.uuid4().hex[:8]}",
                'fetched_at': datetime.now(timezone.utc).isoformat(),
            })

        # Sort by departure time
        results.sort(key=lambda x: x['departure_time'])
        return results

    def get_details(self, provider_ref):
        return {'provider_ref': provider_ref, 'status': 'available'}

    def check_availability(self, provider_ref):
        return {'available': True, 'price_changed': False,
                'current_price': random.randint(300, 2500)}
