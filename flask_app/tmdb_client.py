"""
TMDB API Client Module for SwipeFlix.

Provides functions to fetch movie data from The Movie Database API:
- Genre list
- Movies by genre (Discover endpoint)
- Movie details
- Movie reviews

Includes in-memory caching and error handling.
"""

import os
import requests
from typing import Optional
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

# =============================================================================
# Configuration
# =============================================================================

TMDB_API_KEY = os.environ.get("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

# Default settings
DEFAULT_POSTER_SIZE = "w500"
DEFAULT_BACKDROP_SIZE = "w780"
MAX_REVIEWS = 3
REVIEW_TRUNCATE_LENGTH = 150

# In-memory cache for movie lists by genre
# Key: genre_id, Value: list of movie dicts
_genre_movies_cache: dict[int, list[dict]] = {}


# =============================================================================
# Exceptions
# =============================================================================

class TMDBError(Exception):
    """Base exception for TMDB API errors."""
    pass


class TMDBAuthError(TMDBError):
    """Authentication error (invalid API key)."""
    pass


class TMDBNotFoundError(TMDBError):
    """Resource not found."""
    pass


class TMDBRateLimitError(TMDBError):
    """Rate limit exceeded."""
    pass


# =============================================================================
# Helper Functions
# =============================================================================

def _get_api_key() -> str:
    """Get TMDB API key or raise error if not configured."""
    if not TMDB_API_KEY:
        raise TMDBError(
            "TMDB_API_KEY not configured. "
            "Set it in your environment or .env file."
        )
    return TMDB_API_KEY


def _make_request(endpoint: str, params: Optional[dict] = None) -> dict:
    """
    Make a GET request to the TMDB API.
    
    Args:
        endpoint: API endpoint path (e.g., "/genre/movie/list")
        params: Optional query parameters
        
    Returns:
        JSON response as dict
        
    Raises:
        TMDBError: On API errors
    """
    url = f"{TMDB_BASE_URL}{endpoint}"
    
    # Add API key to params
    request_params = {"api_key": _get_api_key(), "language": "en-US"}
    if params:
        request_params.update(params)
    
    try:
        response = requests.get(url, params=request_params, timeout=10)
        
        # Handle HTTP errors
        if response.status_code == 401:
            raise TMDBAuthError("Invalid TMDB API key")
        elif response.status_code == 404:
            raise TMDBNotFoundError(f"Resource not found: {endpoint}")
        elif response.status_code == 429:
            raise TMDBRateLimitError("TMDB rate limit exceeded. Try again later.")
        elif response.status_code >= 400:
            raise TMDBError(f"TMDB API error: {response.status_code} - {response.text}")
        
        return response.json()
        
    except requests.exceptions.Timeout:
        raise TMDBError("TMDB API request timed out")
    except requests.exceptions.ConnectionError:
        raise TMDBError("Failed to connect to TMDB API")
    except requests.exceptions.RequestException as e:
        raise TMDBError(f"TMDB API request failed: {str(e)}")


def build_poster_url(poster_path: Optional[str], size: str = DEFAULT_POSTER_SIZE) -> str:
    """
    Build full poster image URL.
    
    Args:
        poster_path: Poster path from TMDB (e.g., "/abc123.jpg")
        size: Image size (w92, w154, w185, w342, w500, w780, original)
        
    Returns:
        Full URL or empty string if no poster
    """
    if not poster_path:
        return ""
    return f"{TMDB_IMAGE_BASE_URL}/{size}{poster_path}"


def build_backdrop_url(backdrop_path: Optional[str], size: str = DEFAULT_BACKDROP_SIZE) -> str:
    """Build full backdrop image URL."""
    if not backdrop_path:
        return ""
    return f"{TMDB_IMAGE_BASE_URL}/{size}{backdrop_path}"


def truncate_text(text: str, max_length: int = REVIEW_TRUNCATE_LENGTH) -> str:
    """Truncate text to max length, adding ellipsis if needed."""
    if not text:
        return ""
    if len(text) <= max_length:
        return text
    return text[:max_length].rsplit(" ", 1)[0] + "..."


# =============================================================================
# Genre Functions
# =============================================================================

@lru_cache(maxsize=1)
def get_genres() -> list[dict]:
    """
    Fetch list of movie genres from TMDB.
    
    Returns:
        List of dicts with 'id' and 'name' keys.
        Example: [{"id": 28, "name": "Action"}, {"id": 35, "name": "Comedy"}]
        
    Note:
        Results are cached (genres rarely change).
    """
    try:
        data = _make_request("/genre/movie/list")
        return data.get("genres", [])
    except TMDBError:
        # Return fallback genres on error
        return _get_fallback_genres()


def get_genre_name(genre_id: int) -> str:
    """Get genre name by ID."""
    genres = get_genres()
    for genre in genres:
        if genre["id"] == genre_id:
            return genre["name"]
    return "Unknown"


def _get_fallback_genres() -> list[dict]:
    """Fallback genre list if API is unavailable."""
    return [
        {"id": 28, "name": "Action"},
        {"id": 12, "name": "Adventure"},
        {"id": 16, "name": "Animation"},
        {"id": 35, "name": "Comedy"},
        {"id": 80, "name": "Crime"},
        {"id": 99, "name": "Documentary"},
        {"id": 18, "name": "Drama"},
        {"id": 10751, "name": "Family"},
        {"id": 14, "name": "Fantasy"},
        {"id": 36, "name": "History"},
        {"id": 27, "name": "Horror"},
        {"id": 10402, "name": "Music"},
        {"id": 9648, "name": "Mystery"},
        {"id": 10749, "name": "Romance"},
        {"id": 878, "name": "Science Fiction"},
        {"id": 53, "name": "Thriller"},
        {"id": 10752, "name": "War"},
        {"id": 37, "name": "Western"},
    ]


# =============================================================================
# Movie Discovery Functions
# =============================================================================

def get_movies_by_genre(
    genre_id: int,
    page: int = 1,
    sort_by: str = "popularity.desc",
    min_vote_count: int = 100,
    use_cache: bool = True
) -> list[dict]:
    """
    Fetch popular/top-rated movies filtered by genre.
    
    Uses TMDB's Discover endpoint.
    
    Args:
        genre_id: TMDB genre ID
        page: Page number (1-500)
        sort_by: Sort order (popularity.desc, vote_average.desc, etc.)
        min_vote_count: Minimum votes to filter out obscure movies
        use_cache: Whether to use in-memory cache
        
    Returns:
        List of movie dicts from TMDB
    """
    cache_key = genre_id
    
    # Check cache first
    if use_cache and cache_key in _genre_movies_cache and page == 1:
        return _genre_movies_cache[cache_key]
    
    params = {
        "with_genres": genre_id,
        "sort_by": sort_by,
        "page": page,
        "vote_count.gte": min_vote_count,
        "include_adult": "false",
    }
    
    data = _make_request("/discover/movie", params)
    movies = data.get("results", [])
    
    # Cache first page results
    if use_cache and page == 1:
        _genre_movies_cache[cache_key] = movies
    
    return movies


def clear_movies_cache():
    """Clear the in-memory movies cache."""
    global _genre_movies_cache
    _genre_movies_cache = {}


def clear_genre_cache(genre_id: int):
    """Clear cache for a specific genre."""
    if genre_id in _genre_movies_cache:
        del _genre_movies_cache[genre_id]


# =============================================================================
# Movie Details Functions
# =============================================================================

def get_movie_details(movie_id: int) -> dict:
    """
    Fetch detailed information for a specific movie.
    
    Args:
        movie_id: TMDB movie ID
        
    Returns:
        Dict with movie details:
        {
            "id": 123,
            "title": "Movie Title",
            "poster_url": "https://...",
            "backdrop_url": "https://...",
            "year": "2024",
            "rating": 7.5,
            "vote_count": 1234,
            "overview": "Short description..."
        }
    """
    data = _make_request(f"/movie/{movie_id}")
    
    return {
        "id": data.get("id"),
        "title": data.get("title", "Unknown"),
        "poster_url": build_poster_url(data.get("poster_path")),
        "backdrop_url": build_backdrop_url(data.get("backdrop_path")),
        "year": _extract_year(data.get("release_date")),
        "rating": round(data.get("vote_average", 0), 1),
        "vote_count": data.get("vote_count", 0),
        "overview": data.get("overview", ""),
    }


def _extract_year(release_date: Optional[str]) -> str:
    """Extract year from TMDB date string (YYYY-MM-DD)."""
    if not release_date:
        return "N/A"
    try:
        return release_date.split("-")[0]
    except (AttributeError, IndexError):
        return "N/A"


# =============================================================================
# Reviews Functions
# =============================================================================

def get_movie_reviews(movie_id: int, max_reviews: int = MAX_REVIEWS) -> list[dict]:
    """
    Fetch user reviews for a movie.
    
    Args:
        movie_id: TMDB movie ID
        max_reviews: Maximum number of reviews to return
        
    Returns:
        List of review dicts:
        [
            {
                "author": "username",
                "content": "Truncated review text...",
                "rating": 8.0 or None
            }
        ]
    """
    try:
        data = _make_request(f"/movie/{movie_id}/reviews")
        reviews = data.get("results", [])[:max_reviews]
        
        return [
            {
                "author": review.get("author", "Anonymous"),
                "content": truncate_text(review.get("content", "")),
                "rating": _extract_review_rating(review),
            }
            for review in reviews
        ]
        
    except TMDBError:
        # Reviews are optional - return empty list on error
        return []


def _extract_review_rating(review: dict) -> Optional[float]:
    """Extract rating from review's author_details."""
    try:
        rating = review.get("author_details", {}).get("rating")
        return float(rating) if rating is not None else None
    except (TypeError, ValueError):
        return None


# =============================================================================
# Swipe Deck Function
# =============================================================================

def get_swipe_deck(genre_id: int, count: int = 20) -> list[dict]:
    """
    Get a ready-to-use list of movies for a swipe session.
    
    This is the main function to call from the Flask app.
    Returns fully formatted movie data including reviews.
    
    Args:
        genre_id: TMDB genre ID to filter by
        count: Number of movies to return (default 20)
        
    Returns:
        List of movie dicts ready for the swipe UI:
        [
            {
                "id": 123,
                "title": "Movie Title",
                "poster_url": "https://image.tmdb.org/t/p/w500/abc.jpg",
                "backdrop_url": "https://image.tmdb.org/t/p/w780/xyz.jpg",
                "year": "2024",
                "rating": 7.5,
                "vote_count": 1234,
                "overview": "A brief description...",
                "reviews": [
                    {"author": "user1", "content": "Great movie...", "rating": 8.0},
                    {"author": "user2", "content": "Loved it...", "rating": None}
                ]
            },
            ...
        ]
        
    Raises:
        TMDBError: If API request fails
    """
    # Fetch movies for this genre (uses cache if available)
    raw_movies = get_movies_by_genre(genre_id, page=1)
    
    # Limit to requested count
    raw_movies = raw_movies[:count]
    
    # Format each movie with reviews
    swipe_deck = []
    
    for movie in raw_movies:
        movie_id = movie.get("id")
        if not movie_id:
            continue
            
        # Build movie dict from discover results (avoid extra API call)
        movie_data = {
            "id": movie_id,
            "title": movie.get("title", "Unknown"),
            "poster_url": build_poster_url(movie.get("poster_path")),
            "backdrop_url": build_backdrop_url(movie.get("backdrop_path")),
            "year": _extract_year(movie.get("release_date")),
            "rating": round(movie.get("vote_average", 0), 1),
            "vote_count": movie.get("vote_count", 0),
            "overview": movie.get("overview", ""),
            "reviews": get_movie_reviews(movie_id),
        }
        
        swipe_deck.append(movie_data)
    
    return swipe_deck


# =============================================================================
# Testing / CLI
# =============================================================================

if __name__ == "__main__":
    """Quick test of the module."""
    print("Testing TMDB Client...")
    print("=" * 50)
    
    # Test genres
    print("\n1. Fetching genres...")
    try:
        genres = get_genres()
        print(f"   Found {len(genres)} genres")
        for g in genres[:5]:
            print(f"   - {g['id']}: {g['name']}")
    except TMDBError as e:
        print(f"   Error: {e}")
    
    # Test movie discovery
    print("\n2. Fetching Action movies (genre_id=28)...")
    try:
        movies = get_movies_by_genre(28)
        print(f"   Found {len(movies)} movies")
        if movies:
            print(f"   Top movie: {movies[0].get('title')}")
    except TMDBError as e:
        print(f"   Error: {e}")
    
    # Test swipe deck
    print("\n3. Building swipe deck (Comedy, 5 movies)...")
    try:
        deck = get_swipe_deck(genre_id=35, count=5)
        print(f"   Got {len(deck)} movies")
        for m in deck:
            reviews_count = len(m.get("reviews", []))
            print(f"   - {m['title']} ({m['year']}) - {m['rating']}/10 - {reviews_count} reviews")
    except TMDBError as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 50)
    print("Tests complete!")
