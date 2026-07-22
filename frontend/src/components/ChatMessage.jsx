export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-4`}>
      <div
        className={`max-w-[85%] space-y-1 sm:max-w-[75%] lg:max-w-[65%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-indigo-600 text-white"
              : "border border-zinc-800 bg-zinc-900 text-zinc-200"
          }`}
        >
          {message.content}
        </div>
        <div
          className={`flex items-center gap-2 px-1 text-[11px] text-zinc-600 ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span>{isUser ? "You" : "Copilot"}</span>
          <span>&middot;</span>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
