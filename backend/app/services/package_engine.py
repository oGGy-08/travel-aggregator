from datetime import datetime


class PackageEngine:
    """Validates segment compatibility, calculates pricing and savings."""

    MAX_SAVINGS_PERCENTAGE = 50.0
    DISCOUNT_RATE = 0.08  # 8% package discount

    def validate_compatibility(self, segments):
        """Check time/location compatibility between segments."""
        conflicts = []
        travel_segments = [s for s in segments if s['segment_type'] in ('FLIGHT', 'BUS')]
        hotel_segments = [s for s in segments if s['segment_type'] == 'HOTEL']

        # Check travel segment time overlaps
        for i, seg_a in enumerate(travel_segments):
            for seg_b in travel_segments[i + 1:]:
                a_start = self._parse_dt(seg_a['start_datetime'])
                a_end = self._parse_dt(seg_a['end_datetime'])
                b_start = self._parse_dt(seg_b['start_datetime'])
                b_end = self._parse_dt(seg_b['end_datetime'])
                if a_start < b_end and b_start < a_end:
                    conflicts.append({
                        'type': 'TIME_OVERLAP',
                        'segments': [seg_a.get('id', ''), seg_b.get('id', '')],
                        'message': 'Travel segments have overlapping times'
                    })

        # Check hotel date constraints
        arrival_time = None
        departure_time = None
        for seg in travel_segments:
            end = self._parse_dt(seg['end_datetime'])
            start = self._parse_dt(seg['start_datetime'])
            if arrival_time is None or end > arrival_time:
                arrival_time = end
            if departure_time is None or start < departure_time:
                departure_time = start

        for hotel in hotel_segments:
            check_in = self._parse_dt(hotel['start_datetime'])
            check_out = self._parse_dt(hotel['end_datetime'])
            if arrival_time and check_in < arrival_time.replace(hour=0, minute=0, second=0, tzinfo=arrival_time.tzinfo):
                pass  # Hotel can start same day
            if departure_time and check_out > departure_time:
                conflicts.append({
                    'type': 'HOTEL_DATE_CONFLICT',
                    'segments': [hotel.get('id', '')],
                    'message': 'Hotel check-out is after departure date'
                })

        return {'valid': len(conflicts) == 0, 'conflicts': conflicts}

    def calculate_savings(self, segments):
        """Calculate package pricing and savings."""
        individual_sum = sum(s.get('price_amount', 0) for s in segments)
        if individual_sum <= 0:
            return {
                'individual_price_sum': 0,
                'total_price': 0,
                'savings_amount': 0,
                'savings_percentage': 0,
            }

        savings_amount = round(individual_sum * self.DISCOUNT_RATE, 2)
        savings_pct = round((savings_amount / individual_sum) * 100, 2)
        savings_pct = min(savings_pct, self.MAX_SAVINGS_PERCENTAGE)
        savings_amount = round(individual_sum * (savings_pct / 100), 2)
        total_price = round(individual_sum - savings_amount, 2)

        return {
            'individual_price_sum': round(individual_sum, 2),
            'total_price': total_price,
            'savings_amount': savings_amount,
            'savings_percentage': savings_pct,
        }

    def calculate_compatibility_score(self, segments):
        """Score package 0-100 based on segment compatibility."""
        validation = self.validate_compatibility(segments)
        if not validation['valid']:
            penalty = len(validation['conflicts']) * 25
            return max(0, 100 - penalty)
        # Bonus for multi-modal
        types = set(s['segment_type'] for s in segments)
        base = 70
        base += len(types) * 10
        return min(100, base)

    def build_package(self, segments):
        """Assemble segments into a package."""
        validation = self.validate_compatibility(segments)
        savings = self.calculate_savings(segments)
        score = self.calculate_compatibility_score(segments)
        return {
            'segments': segments,
            'validation': validation,
            'pricing': savings,
            'compatibility_score': score,
        }

    def _parse_dt(self, dt_val):
        from datetime import timezone as tz
        if isinstance(dt_val, datetime):
            if dt_val.tzinfo is None:
                return dt_val.replace(tzinfo=tz.utc)
            return dt_val
        if isinstance(dt_val, str):
            try:
                dt = datetime.fromisoformat(dt_val.replace('Z', '+00:00'))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=tz.utc)
                return dt
            except (ValueError, TypeError):
                return datetime.min.replace(tzinfo=tz.utc)
        return datetime.min.replace(tzinfo=tz.utc)
