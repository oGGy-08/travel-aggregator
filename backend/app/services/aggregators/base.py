from abc import ABC, abstractmethod


class BaseAggregator(ABC):
    """Base class for all travel provider aggregators."""

    @abstractmethod
    def search(self, params):
        """Search provider and return normalized results."""
        pass

    @abstractmethod
    def get_details(self, provider_ref):
        """Get detailed info for a specific result."""
        pass

    @abstractmethod
    def check_availability(self, provider_ref):
        """Check if item is still available at current price."""
        pass
