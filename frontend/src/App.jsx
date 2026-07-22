import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LandingPage from "./components/LandingPage";
import AuthView from "./components/AuthView";
import ChatLayout from "./components/ChatLayout";

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <ChatLayout onGoHome={() => {}} />;
  }

  if (showAuth) {
    return <AuthView onSuccess={() => setShowAuth(false)} />;
  }

  return <LandingPage onStartChat={() => setShowAuth(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
