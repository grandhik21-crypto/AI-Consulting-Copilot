"use client";

import { useState } from "react";
import GenreSelector from "@/components/GenreSelector";
import SwipeView from "@/components/SwipeView";
import Recommendation from "@/components/Recommendation";
import Header from "@/components/Header";

type AppPhase = "genre" | "swiping" | "recommendation";

interface Genre {
  id: number;
  name: string;
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
  reviews: { author: string; content: string; rating: number | null }[];
}

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("genre");
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<MovieData | null>(null);
  const [totalLiked, setTotalLiked] = useState(0);

  const handleGenreSelect = async (genre: Genre) => {
    setSelectedGenre(genre);

    // Create a session
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genreId: genre.id, genreName: genre.name }),
      });
      const data = await res.json();
      setSessionId(data.session.id);
    } catch {
      // Generate a local session ID as fallback
      setSessionId(crypto.randomUUID());
    }

    setPhase("swiping");
  };

  const handleSwipingComplete = (rec: MovieData | null, liked: number) => {
    setRecommendation(rec);
    setTotalLiked(liked);
    setPhase("recommendation");
  };

  const handleStartOver = () => {
    setPhase("genre");
    setSelectedGenre(null);
    setSessionId(null);
    setRecommendation(null);
    setTotalLiked(0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLogoClick={handleStartOver} />

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        {phase === "genre" && (
          <GenreSelector onSelect={handleGenreSelect} />
        )}

        {phase === "swiping" && selectedGenre && sessionId && (
          <SwipeView
            genre={selectedGenre}
            sessionId={sessionId}
            onComplete={handleSwipingComplete}
          />
        )}

        {phase === "recommendation" && (
          <Recommendation
            movie={recommendation}
            totalLiked={totalLiked}
            genreName={selectedGenre?.name || ""}
            onStartOver={handleStartOver}
          />
        )}
      </main>
    </div>
  );
}
