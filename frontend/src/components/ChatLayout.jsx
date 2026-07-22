import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import DocumentView from "./DocumentView";
import ExcelView from "./ExcelView";
import SwotView from "./SwotView";
import SlidesView from "./SlidesView";
import EmailView from "./EmailView";
import DashboardView from "./DashboardView";
import useChat from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";

export default function ChatLayout({ onGoHome }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("chat");
  const { messages, isTyping, error, sendMessage, clearChat } = useChat();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar
        onNewChat={() => {
          clearChat();
          setActiveView("chat");
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setSidebarOpen(false);
        }}
        user={user}
        onLogout={logout}
      />

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button onClick={onGoHome} className="flex items-center gap-2 md:ml-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
              CC
            </div>
            <span className="text-sm font-semibold text-zinc-200">
              Consulting Copilot
            </span>
          </button>

          {activeView === "chat" && (
            <button
              onClick={clearChat}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              title="New conversation"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-zinc-600 sm:block">{user?.name}</span>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              title="Logout"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>
        </header>

        {activeView === "chat" ? (
          <>
            <ChatWindow messages={messages} isTyping={isTyping} error={error} />
            <ChatInput onSend={sendMessage} disabled={isTyping} />
          </>
        ) : activeView === "documents" ? (
          <DocumentView />
        ) : activeView === "spreadsheets" ? (
          <ExcelView />
        ) : activeView === "swot" ? (
          <SwotView chatMessages={messages} />
        ) : activeView === "slides" ? (
          <SlidesView />
        ) : activeView === "email" ? (
          <EmailView />
        ) : (
          <DashboardView />
        )}
      </div>
    </div>
  );
}
