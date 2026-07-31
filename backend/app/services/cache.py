"""Redis-based search result caching with 15-minute TTL."""
import json
import hashlib
from ..extensions import redis_client

SEARCH_CACHE_TTL = 900  # 15 minutes


def _cache_key(search_type, params):
    """Generate a deterministic cache key from search params."""
    raw = f"{search_type}:{json.dumps(params, sort_keys=True, default=str)}"
    return f"search:{hashlib.md5(raw.encode()).hexdigest()}"


def get_cached_results(search_type, params):
    """Get cached search results. Returns None if not found."""
    try:
        key = _cache_key(search_type, params)
        cached = redis_client.get(key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass
    return None


def set_cached_results(search_type, params, results):
    """Cache search results with TTL."""
    try:
        key = _cache_key(search_type, params)
        redis_client.setex(key, SEARCH_CACHE_TTL, json.dumps(results, default=str))
    except Exception:
        pass


def get_cache_stats():
    """Get basic cache statistics."""
    try:
        info = redis_client.info('memory')
        keys = redis_client.dbsize()
        return {
            'keys': keys,
            'memory_used': info.get('used_memory_human', 'N/A'),
        }
    except Exception:
        return {'keys': 0, 'memory_used': 'N/A'}
