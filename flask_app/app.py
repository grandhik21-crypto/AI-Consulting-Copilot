"""
SwipeFlix - Flask Application

A Tinder-style movie discovery app.
"""

import os
from flask import Flask, render_template, jsonify, request, session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our TMDB client
import tmdb_client
from tmdb_client import TMDBError

# =============================================================================
# App Factory
# =============================================================================

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
    app.config["TMDB_API_KEY"] = os.environ.get("TMDB_API_KEY")
    
    # Swipe session settings
    app.config["SWIPE_DECK_SIZE"] = 15
    app.config["SWIPES_PER_SESSION"] = 12
    
    # ==========================================================================
    # Routes
    # ==========================================================================
    
    @app.route("/")
    def index():
        """Home page - genre selection."""
        return render_template("index.html")
    
    @app.route("/swipe/<int:genre_id>")
    def swipe(genre_id):
        """Swipe page for a specific genre."""
        genre_name = tmdb_client.get_genre_name(genre_id)
        return render_template(
            "swipe.html",
            genre_id=genre_id,
            genre_name=genre_name,
            swipes_required=app.config["SWIPES_PER_SESSION"]
        )
    
    @app.route("/recommendation")
    def recommendation():
        """Recommendation results page."""
        return render_template("recommendation.html")
    
    # ==========================================================================
    # API Routes
    # ==========================================================================
    
    @app.route("/api/health")
    def health():
        """Health check endpoint."""
        return jsonify({"status": "ok", "app": "SwipeFlix"})
    
    @app.route("/api/genres")
    def api_genres():
        """Get list of movie genres."""
        try:
            genres = tmdb_client.get_genres()
            return jsonify({"success": True, "genres": genres})
        except TMDBError as e:
            return jsonify({"success": False, "error": str(e)}), 500
    
    @app.route("/api/movies")
    def api_movies():
        """
        Get movies for a genre.
        Query params:
            - genre_id: TMDB genre ID (required)
            - count: Number of movies (default: 15)
        """
        genre_id = request.args.get("genre_id", type=int)
        count = request.args.get("count", default=app.config["SWIPE_DECK_SIZE"], type=int)
        
        if not genre_id:
            return jsonify({"success": False, "error": "genre_id is required"}), 400
        
        try:
            movies = tmdb_client.get_swipe_deck(genre_id, count)
            return jsonify({"success": True, "movies": movies, "count": len(movies)})
        except TMDBError as e:
            return jsonify({"success": False, "error": str(e)}), 500
    
    @app.route("/api/movie/<int:movie_id>")
    def api_movie_details(movie_id):
        """Get details for a specific movie."""
        try:
            movie = tmdb_client.get_movie_details(movie_id)
            reviews = tmdb_client.get_movie_reviews(movie_id)
            movie["reviews"] = reviews
            return jsonify({"success": True, "movie": movie})
        except TMDBError as e:
            return jsonify({"success": False, "error": str(e)}), 500
    
    @app.route("/api/reviews/<int:movie_id>")
    def api_movie_reviews(movie_id):
        """Get reviews for a specific movie."""
        try:
            reviews = tmdb_client.get_movie_reviews(movie_id)
            return jsonify({"success": True, "reviews": reviews})
        except TMDBError as e:
            return jsonify({"success": False, "error": str(e)}), 500
    
    # ==========================================================================
    # Error Handlers
    # ==========================================================================
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors."""
        if request.path.startswith("/api/"):
            return jsonify({"success": False, "error": "Not found"}), 404
        return render_template("404.html"), 404
    
    @app.errorhandler(500)
    def server_error(error):
        """Handle 500 errors."""
        if request.path.startswith("/api/"):
            return jsonify({"success": False, "error": "Internal server error"}), 500
        return render_template("500.html"), 500
    
    return app


# =============================================================================
# Run
# =============================================================================

# Create app instance
app = create_app()

if __name__ == "__main__":
    print("=" * 50)
    print("🎬 SwipeFlix - Starting Flask App")
    print("=" * 50)
    
    # Check for API key
    if not os.environ.get("TMDB_API_KEY"):
        print("⚠️  WARNING: TMDB_API_KEY not set!")
        print("   Set it in your .env file or environment.")
        print("   Get a free key at: https://www.themoviedb.org/settings/api")
        print()
    
    print("🌐 Running at: http://127.0.0.1:5000")
    print("=" * 50)
    
    app.run(debug=True, host="0.0.0.0", port=5000)
