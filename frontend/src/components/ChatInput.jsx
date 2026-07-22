import { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Copilot anything..."
            rows={1}
            disabled={disabled}
            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 pr-12 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500 disabled:opacity-50"
            style={{ minHeight: "44px", maxHeight: "160px" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19V5m0 0l-7 7m7-7l7 7"
            />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-zinc-600">
        Copilot may produce inaccurate information. Verify important facts.
      </p>
    </div>
  );
}
