"use client";

interface HeaderProps {
  onLogoClick: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-dark-800/80 backdrop-blur-md border-b border-dark-600/50 sticky top-0 z-50">
      <button
        onClick={onLogoClick}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-neon to-brand-600 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
          🎬
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-white">Swipe</span>
          <span className="text-neon">Flix</span>
        </h1>
      </button>

      <p className="text-sm text-gray-400 hidden sm:block">
        Discover your next favorite movie
      </p>
    </header>
  );
}
