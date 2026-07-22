import { useState, useEffect } from "react";
import { checkHealth } from "../lib/api";

export default function ConnectionStatus() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    checkHealth()
      .then((data) => {
        if (!cancelled && data.status === "running") {
          setStatus("connected");
        } else if (!cancelled) {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-600" />
        Checking…
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Backend Disconnected
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-green-400">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      Backend Connected ✓
    </span>
  );
}
