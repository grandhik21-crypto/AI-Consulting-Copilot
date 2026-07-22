"use client";

interface Review {
  author: string;
  content: string;
  rating: number | null;
}

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    year: string;
    overview: string;
    poster: string;
    backdrop: string;
    rating: number;
    voteCount: number;
    reviews: Review[];
  };
  swipeClass: string;
  dragOffset: number;
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating / 2);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= stars ? "star-filled" : "star-empty"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-300 ml-1">{rating}/10</span>
    </div>
  );
}

export default function MovieCard({ movie, swipeClass, dragOffset }: MovieCardProps) {
  const rotation = dragOffset * 0.1;
  const likeOpacity = Math.max(0, Math.min(1, dragOffset / 100));
  const nopOpacity = Math.max(0, Math.min(1, -dragOffset / 100));

  return (
    <div
      className={`absolute inset-0 ${swipeClass}`}
      style={
        swipeClass
          ? undefined
          : {
              transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
              transition: dragOffset === 0 ? "transform 0.3s ease" : "none",
            }
      }
    >
      <div className="w-full h-full bg-dark-700 rounded-3xl overflow-hidden shadow-2xl border border-dark-600 flex flex-col">
        {/* Poster / Image area */}
        <div className="relative h-[55%] min-h-[200px] overflow-hidden bg-dark-800">
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
              <span className="text-8xl opacity-30">🎬</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-700 via-transparent to-transparent" />

          {/* LIKE stamp */}
          <div
            className="absolute top-6 left-6 border-4 border-neon-green text-neon-green font-extrabold text-3xl px-4 py-1 rounded-lg rotate-[-20deg] tracking-wider"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </div>

          {/* NOPE stamp */}
          <div
            className="absolute top-6 right-6 border-4 border-neon text-neon font-extrabold text-3xl px-4 py-1 rounded-lg rotate-[20deg] tracking-wider"
            style={{ opacity: nopOpacity }}
          >
            NOPE
          </div>
        </div>

        {/* Info area */}
        <div className="flex-1 p-5 flex flex-col overflow-y-auto">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-xl font-bold leading-tight flex-1">
              {movie.title}
            </h3>
            <span className="text-sm text-gray-400 whitespace-nowrap bg-dark-800 px-2 py-1 rounded-lg">
              {movie.year}
            </span>
          </div>

          <StarRating rating={movie.rating} />

          <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">
            {movie.overview}
          </p>

          {/* Reviews */}
          {movie.reviews.length > 0 && (
            <div className="mt-3 space-y-2">
              {movie.reviews.map((review, i) => (
                <div
                  key={i}
                  className="bg-dark-800/80 rounded-xl px-3 py-2 border border-dark-600/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-neon">
                      @{review.author}
                    </span>
                    {review.rating && (
                      <span className="text-xs text-yellow-400">
                        ★ {review.rating}/10
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    &ldquo;{review.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
