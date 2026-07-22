import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

function Input({ label, type, value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-500"
      />
    </div>
  );
}

export default function AuthView({ onSuccess }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ email: "", username: "", name: "", password: "" });

  const update = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await signup(form.email, form.username, form.name, form.password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-bold text-white">
            CC
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Consulting Copilot</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <div className="mb-6 flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          <button
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "login" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode("signup"); setError(null); }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "signup" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Input label="Email" type="email" value={form.email} onChange={update("email")} placeholder="you@company.com" autoComplete="email" />
              <Input label="Full Name" type="text" value={form.name} onChange={update("name")} placeholder="Jane Doe" autoComplete="name" />
            </>
          )}
          <Input label="Username" type="text" value={form.username} onChange={update("username")} placeholder="jane.doe" autoComplete="username" />
          <Input label="Password" type="password" value={form.password} onChange={update("password")} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />

          {mode === "signup" && (
            <p className="text-xs text-zinc-600">At least 6 characters</p>
          )}

          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
