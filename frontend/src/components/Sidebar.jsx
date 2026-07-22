import { useState } from "react";

const conversations = [
  { id: "1", title: "Q4 Strategy Review", date: "Today" },
  { id: "2", title: "Market Analysis", date: "Yesterday" },
  { id: "3", title: "Financial Projections", date: "2 days ago" },
  { id: "4", title: "Org Structure", date: "3 days ago" },
  { id: "5", title: "Competitive Analysis", date: "Last week" },
  { id: "6", title: "Implementation Plan", date: "Last week" },
  { id: "7", title: "SWOT Workshop", date: "2 weeks ago" },
];

export default function Sidebar({ onNewChat, isOpen, onClose, activeView, onViewChange, user, onLogout }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-200
          md:relative md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="border-b border-zinc-800 p-4">
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New conversation
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <div className="mb-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
            Conversations
          </div>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                activeId === conv.id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300"
              }`}
            >
              <div className="truncate font-medium">{conv.title}</div>
              <div className="mt-0.5 text-xs text-zinc-600">{conv.date}</div>
            </button>
          ))}
        </nav>

        <div className="border-t border-zinc-800 p-2">
          <button
            onClick={() => onViewChange("dashboard")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              activeView === "dashboard"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300"
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => onViewChange("documents")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              activeView === "documents"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300"
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documents
          </button>

          <button
            onClick={() => onViewChange("spreadsheets")}
            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              activeView === "spreadsheets"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300"
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Spreadsheets
          </button>

          <button
            onClick={() => onViewChange("swot")}
            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              activeView === "swot"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300"
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            SWOT Analysis
          </button>

          <button
            onClick={() => onViewChange("slides")}
            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              activeView === "slides"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300"
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Slides
          </button>

          <button
            onClick={() => onViewChange("email")}
            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              activeView === "email"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300"
            }`}
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>

          <div className="mt-2 border-t border-zinc-800 pt-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-zinc-300">{user?.name || "User"}</div>
                <div className="truncate text-xs text-zinc-600">{user?.email || ""}</div>
              </div>
              <button
                onClick={onLogout}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                title="Logout"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
