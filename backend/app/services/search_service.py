class SearchService:
    """Handles deduplication, filtering, and sorting of search results."""

    def deduplicate(self, results):
        seen = set()
        unique = []
        for r in results:
            key = (r.get('provider'), r.get('provider_ref'))
            if key not in seen:
                seen.add(key)
                unique.append(r)
        return unique

    def apply_filters(self, results, filters):
        filtered = results
        if 'min_price' in filters:
            filtered = [r for r in filtered if r.get('price_amount', 0) >= filters['min_price']]
        if 'max_price' in filters:
            filtered = [r for r in filtered if r.get('price_amount', 0) <= filters['max_price']]
        if 'max_duration' in filters:
            filtered = [r for r in filtered
                        if r.get('duration_minutes', 0) <= filters['max_duration']]
        if 'max_stops' in filters:
            filtered = [r for r in filtered if r.get('stops', 0) <= filters['max_stops']]
        if 'min_rating' in filters:
            filtered = [r for r in filtered
                        if r.get('rating', r.get('user_rating', 0)) >= filters['min_rating']]
        if 'providers' in filters:
            filtered = [r for r in filtered if r.get('provider') in filters['providers']]
        return filtered

    def apply_sort(self, results, sort_by='price_amount', order='asc'):
        reverse = order == 'desc'
        return sorted(results, key=lambda x: x.get(sort_by, 0), reverse=reverse)
