"use client";

import { useEffect, useState } from "react";

interface Genre {
  id: number;
  name: string;
}

interface GenreSelectorProps {
  onSelect: (genre: Genre) => void;
}

const GENRE_EMOJIS: Record<string, string> = {
  Action: "💥",
  Adventure: "🗺️",
  Animation: "🎨",
  Comedy: "😂",
  Crime: "🔪",
  Documentary: "📹",
  Drama: "🎭",
  Family: "👨‍👩‍👧‍👦",
  Fantasy: "🧙",
  History: "📜",
  Horror: "👻",
  Music: "🎵",
  Mystery: "🔍",
  Romance: "💕",
  "Science Fiction": "🚀",
  "TV Movie": "📺",
  Thriller: "😱",
  War: "⚔️",
  Western: "🤠",
};

export default function GenreSelector({ onSelect }: GenreSelectorProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => {
        setGenres(data.genres || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="h-10 w-80 mx-auto shimmer rounded-lg mb-4" />
          <div className="h-5 w-64 mx-auto shimmer rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          What are you in the mood for?
        </h2>
        <p className="text-gray-400 text-lg">
          Pick a genre to start discovering movies
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelect(genre)}
            className="group relative bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-neon/50 rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-neon/10 flex flex-col items-center gap-2"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
              {GENRE_EMOJIS[genre.name] || "🎬"}
            </span>
            <span className="font-semibold text-sm text-gray-200 group-hover:text-white transition-colors">
              {genre.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
