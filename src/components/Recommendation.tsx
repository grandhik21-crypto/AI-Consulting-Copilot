"use client";

interface Review {
  author: string;
  content: string;
  rating: number | null;
}

interface MovieData {
  id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
  backdrop: string;
  rating: number;
  voteCount: number;
  reviews: Review[];
}

interface RecommendationProps {
  movie: MovieData | null;
  totalLiked: number;
  genreName: string;
  onStartOver: () => void;
}

export default function Recommendation({
  movie,
  totalLiked,
  genreName,
  onStartOver,
}: RecommendationProps) {
  if (!movie) {
    return (
      <div className="text-center fade-in max-w-md mx-auto">
        <span className="text-7xl mb-6 block">🤔</span>
        <h2 className="text-2xl font-bold mb-3">No Match Found</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          You didn&apos;t like any movies this round. Try a different genre or
          swipe right on some movies you find interesting!
        </p>
        <button
          onClick={onStartOver}
          className="bg-gradient-to-r from-neon to-brand-600 text-white font-semibold px-8 py-3 rounded-2xl hover:opacity-90 transition-opacity shadow-lg"
        >
          Try Another Genre
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto fade-in">
      {/* Celebration header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          Your Perfect Match!
        </h2>
        <p className="text-gray-400">
          Based on your {totalLiked} like{totalLiked !== 1 ? "s" : ""} in{" "}
          <span className="text-neon font-semibold">{genreName}</span>
        </p>
      </div>

      {/* Movie card */}
      <div className="bg-dark-700 rounded-3xl overflow-hidden shadow-2xl border border-dark-600 pulse-glow">
        {/* Poster */}
        <div className="relative h-72 sm:h-80 overflow-hidden">
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon/20 to-brand-700/20">
              <span className="text-9xl opacity-40">🎬</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-700 via-transparent to-transparent" />

          {/* Rating badge */}
          <div className="absolute top-4 right-4 bg-dark-900/80 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="font-bold text-sm">{movie.rating}/10</span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-lg">
              {movie.title}
            </h3>
            <span className="text-sm text-gray-300 mt-1 inline-block bg-dark-900/60 px-2 py-0.5 rounded">
              {movie.year}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5">
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {movie.overview}
          </p>

          {/* Reviews */}
          {movie.reviews.length > 0 && (
            <div className="space-y-3 mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                What people say
              </h4>
              {movie.reviews.map((review, i) => (
                <div
                  key={i}
                  className="bg-dark-800/60 rounded-xl px-4 py-3 border border-dark-600/30"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-neon">
                      @{review.author}
                    </span>
                    {review.rating && (
                      <span className="text-xs text-yellow-400">
                        ★ {review.rating}/10
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    &ldquo;{review.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Vote count */}
          <div className="text-xs text-gray-500 mb-5">
            {movie.voteCount.toLocaleString()} votes on TMDB
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onStartOver}
              className="flex-1 bg-dark-600 hover:bg-dark-800 border border-dark-600 text-white font-semibold py-3 rounded-2xl transition-colors"
            >
              Try Again
            </button>
            <a
              href={`https://www.themoviedb.org/movie/${movie.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-neon to-brand-600 text-white font-semibold py-3 rounded-2xl hover:opacity-90 transition-opacity text-center shadow-lg"
            >
              View on TMDB →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
