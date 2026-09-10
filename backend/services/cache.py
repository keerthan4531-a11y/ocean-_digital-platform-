"""
AquaTwin 3D - Backend In-Memory TTL Cache
Caches third-party public API responses for 5 to 10 minutes to respect provider rate limits.
"""

import time
from typing import Any, Optional, Dict

class SimpleTTLCache:
    def __init__(self, default_ttl_seconds: int = 600):
        self.default_ttl = default_ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        entry = self._cache.get(key)
        if not entry:
            return None
        if time.time() > entry["expires_at"]:
            del self._cache[key]
            return None
        return entry["data"]

    def set(self, key: str, data: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        self._cache[key] = {
            "data": data,
            "expires_at": time.time() + ttl
        }

    def clear(self) -> None:
        self._cache.clear()

# Singleton cache instance (10 minutes TTL)
api_cache = SimpleTTLCache(default_ttl_seconds=600)
