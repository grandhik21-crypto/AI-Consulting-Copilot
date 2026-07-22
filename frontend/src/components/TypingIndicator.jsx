export default function TypingIndicator() {
  return (
    <div className="flex justify-start px-4">
      <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
          <div className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
          </div>
          <span className="text-xs text-zinc-500">Copilot is thinking...</span>
        </div>
      </div>
    </div>
  );
}
