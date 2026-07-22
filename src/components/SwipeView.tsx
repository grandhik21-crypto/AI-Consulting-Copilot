"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import MovieCard from "./MovieCard";

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

interface SwipeViewProps {
  genre: { id: number; name: string };
  sessionId: string;
  onComplete: (recommendation: MovieData | null, totalLiked: number) => void;
}

const TOTAL_SWIPES = 12;

export default function SwipeView({
  genre,
  sessionId,
  onComplete,
}: SwipeViewProps) {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeClass, setSwipeClass] = useState("");
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [likedMovies, setLikedMovies] = useState<MovieData[]>([]);
  const [swipeCount, setSwipeCount] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const dragStartX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch movies
  useEffect(() => {
    setLoading(true);
    fetch(`/api/movies?genre_id=${genre.id}`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.movies || []);
        setIsDemo(data.demo || false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [genre.id]);

  const recordSwipe = useCallback(
    async (movie: MovieData, liked: boolean) => {
      try {
        await fetch("/api/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            movieId: movie.id,
            movieTitle: movie.title,
            liked,
            movieData: movie,
          }),
        });
      } catch {
        // Swipe recording is best-effort
      }
    },
    [sessionId]
  );

  const handleSwipe = useCallback(
    async (liked: boolean) => {
      if (currentIndex >= movies.length) return;

      const movie = movies[currentIndex];

      // Show swipe animation
      setSwipeClass(liked ? "swipe-right" : "swipe-left");

      // Record the swipe
      recordSwipe(movie, liked);

      if (liked) {
        setLikedMovies((prev) => [...prev, movie]);
      }

      const newSwipeCount = swipeCount + 1;
      setSwipeCount(newSwipeCount);

      // After animation, move to next card or show recommendation
      setTimeout(() => {
        setSwipeClass("");
        setDragOffset(0);

        if (newSwipeCount >= TOTAL_SWIPES || currentIndex >= movies.length - 1) {
          // Done swiping — get recommendation
          const allLiked = liked ? [...likedMovies, movie] : likedMovies;
          fetchRecommendation(allLiked, newSwipeCount);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 500);
    },
    [currentIndex, movies, swipeCount, likedMovies, recordSwipe]
  );

  const fetchRecommendation = async (
    allLiked: MovieData[],
    totalSwiped: number
  ) => {
    try {
      const res = await fetch(`/api/recommend?session_id=${sessionId}`);
      const data = await res.json();
      onComplete(data.recommendation || allLiked[0] || null, allLiked.length);
    } catch {
      // Fallback: pick best liked movie locally
      if (allLiked.length > 0) {
        const best = allLiked.reduce((a, b) =>
          a.rating * Math.log10(Math.max(a.voteCount, 1)) >
          b.rating * Math.log10(Math.max(b.voteCount, 1))
            ? a
            : b
        );
        onComplete(best, allLiked.length);
      } else {
        onComplete(null, 0);
      }
    }
  };

  // Touch/mouse drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - dragStartX.current;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset > 80) {
      handleSwipe(true);
    } else if (dragOffset < -80) {
      handleSwipe(false);
    } else {
      setDragOffset(0);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleSwipe(true);
      if (e.key === "ArrowLeft") handleSwipe(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSwipe]);

  if (loading) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <div className="h-6 w-48 mx-auto shimmer rounded-lg mb-2" />
          <div className="h-4 w-32 mx-auto shimmer rounded-lg" />
        </div>
        <div className="aspect-[3/4] shimmer rounded-3xl" />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center fade-in">
        <span className="text-6xl mb-4 block">😕</span>
        <h3 className="text-xl font-bold mb-2">No movies found</h3>
        <p className="text-gray-400">
          Try a different genre or check back later.
        </p>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];
  const progress = (swipeCount / TOTAL_SWIPES) * 100;
  const remaining = TOTAL_SWIPES - swipeCount;

  return (
    <div className="w-full max-w-sm mx-auto fade-in">
      {/* Header info */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-200">
          {genre.name} Movies
          {isDemo && (
            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
              Demo Mode
            </span>
          )}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {remaining} swipe{remaining !== 1 ? "s" : ""} remaining
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-dark-700 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon to-brand-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card area */}
      <div
        ref={cardRef}
        className="relative aspect-[3/4] w-full select-none touch-none"
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => {
          if (isDragging) handleDragEnd();
        }}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        {currentMovie && (
          <MovieCard
            movie={currentMovie}
            swipeClass={swipeClass}
            dragOffset={dragOffset}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={() => handleSwipe(false)}
          className="w-16 h-16 rounded-full bg-dark-700 border-2 border-neon/50 hover:border-neon hover:bg-neon/10 transition-all duration-200 flex items-center justify-center text-2xl hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Not interested"
        >
          ✕
        </button>

        <div className="text-xs text-gray-600 flex flex-col items-center gap-1">
          <span>← →</span>
          <span>or drag</span>
        </div>

        <button
          onClick={() => handleSwipe(true)}
          className="w-16 h-16 rounded-full bg-dark-700 border-2 border-neon-green/50 hover:border-neon-green hover:bg-neon-green/10 transition-all duration-200 flex items-center justify-center text-2xl hover:scale-110 active:scale-95 shadow-lg"
          aria-label="Interested"
        >
          ♥
        </button>
      </div>

      {/* Swipe stats */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <span>❤️ {likedMovies.length} liked</span>
        <span>•</span>
        <span>{swipeCount} / {TOTAL_SWIPES} swiped</span>
      </div>
    </div>
  );
}
