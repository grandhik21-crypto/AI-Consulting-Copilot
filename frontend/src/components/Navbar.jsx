import { useState } from "react";
import ConnectionStatus from "./ConnectionStatus";

const navLinks = ["Features", "Pricing", "Docs"];

export default function Navbar({ onStartChat }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">
            CC
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Consulting Copilot
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {link}
            </a>
          ))}
          <ConnectionStatus />
          <button
            onClick={onStartChat}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-indigo-500"
          >
            Open Chat
          </button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-zinc-400 md:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-800 px-6 pb-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="block py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {link}
            </a>
          ))}
          <div className="py-2">
            <ConnectionStatus />
          </div>
          <button
            onClick={onStartChat}
            className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-indigo-500"
          >
            Open Chat
          </button>
        </div>
      )}
    </nav>
  );
}
