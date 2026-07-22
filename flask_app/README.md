# SwipeFlix 🎬

A Tinder-style movie discovery app built with Flask and the TMDB API.

## Features

- 🎭 Browse movies by genre
- 👆 Swipe right (like) or left (nope) on movie cards
- ⭐ See ratings and user reviews on each card
- 🎯 Get a personalized recommendation based on your swipes
- 💾 In-memory caching to reduce API calls

## Project Structure

```
flask_app/
├── app.py              # Flask application
├── tmdb_client.py      # TMDB API client module
├── config.py           # Configuration management
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── templates/          # Jinja2 HTML templates
│   ├── base.html
│   ├── index.html      # Genre selection
│   ├── swipe.html      # Swipe interface
│   ├── recommendation.html
│   ├── 404.html
│   └── 500.html
└── static/
    ├── css/
    │   └── style.css   # All styles
    └── js/
        └── swipe.js    # Swipe interface logic
```

## Setup

### 1. Create a virtual environment

```bash
cd flask_app
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` and add your TMDB API key:

```
TMDB_API_KEY=your_api_key_here
```

Get a free API key at: https://www.themoviedb.org/settings/api

### 4. Run the app

```bash
python app.py
```

Or with Flask CLI:

```bash
flask run
```

The app will be available at: http://127.0.0.1:5000

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/genres` | GET | List all movie genres |
| `/api/movies?genre_id=28&count=15` | GET | Get movies for a genre |
| `/api/movie/<id>` | GET | Get movie details |
| `/api/reviews/<id>` | GET | Get movie reviews |

## tmdb_client.py Functions

### Main Functions

```python
from tmdb_client import get_genres, get_swipe_deck, get_movie_details

# Get all genres
genres = get_genres()
# Returns: [{"id": 28, "name": "Action"}, ...]

# Get a ready-to-use swipe deck
movies = get_swipe_deck(genre_id=28, count=20)
# Returns: [{"id": 123, "title": "...", "poster_url": "...", "reviews": [...]}]

# Get details for a specific movie
movie = get_movie_details(movie_id=123)
```

### Caching

Movies are cached in-memory by genre to reduce API calls:

```python
from tmdb_client import clear_movies_cache, clear_genre_cache

# Clear all cached movies
clear_movies_cache()

# Clear cache for a specific genre
clear_genre_cache(genre_id=28)
```

### Error Handling

```python
from tmdb_client import get_swipe_deck, TMDBError, TMDBAuthError

try:
    movies = get_swipe_deck(genre_id=28)
except TMDBAuthError:
    print("Invalid API key!")
except TMDBError as e:
    print(f"TMDB error: {e}")
```

## Testing the TMDB Client

Run the module directly to test:

```bash
python tmdb_client.py
```

This runs a quick test of all main functions.

## Configuration

Edit `config.py` to adjust settings:

```python
# Swipe deck size
DEFAULT_SWIPE_DECK_SIZE = 20

# Max reviews per movie
MAX_REVIEWS_PER_MOVIE = 3

# Review truncation length
REVIEW_TRUNCATE_LENGTH = 150
```

## License

MIT
