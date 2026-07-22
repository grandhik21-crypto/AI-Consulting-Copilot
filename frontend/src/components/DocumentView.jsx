import { useState, useRef, useEffect } from "react";
import PdfUploadZone from "./PdfUploadZone";
import { uploadPdf, sendChatMessage } from "../lib/api";

function DocumentQa({ documentId, filename }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(text, documentId);
      const assistantMsg = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        role: "assistant",
        content: `Error: ${err.message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-zinc-300">
        Ask about {filename}
      </h3>
      <p className="mb-4 text-xs text-zinc-500">
        Questions are answered using only the content of this document.
      </p>

      <div className="mb-4 max-h-72 space-y-3 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-zinc-600">
            Ask a question to get started.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed ${
              msg.role === "user"
                ? "text-right text-zinc-200"
                : "text-zinc-400"
            }`}
          >
            <span
              className={
                msg.role === "user"
                  ? "inline-block rounded-xl bg-indigo-600 px-3 py-2 text-white"
                  : "inline-block"
              }
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
            Analyzing document...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask a question about this document..."
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DocumentView() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await uploadPdf(file);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">Documents</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload a PDF to extract, preview, and ask questions about its content.
          </p>
        </div>

        {!result && !loading && <PdfUploadZone onUpload={handleUpload} />}

        {loading && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Processing PDF...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Upload another PDF
            </button>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                <div className="text-2xl font-bold text-indigo-400">{result.pages}</div>
                <div className="mt-1 text-xs text-zinc-500">Pages</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                <div className="text-2xl font-bold text-indigo-400">
                  {result.word_count.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-zinc-500">Words</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                <div className="truncate text-sm font-medium text-zinc-200">
                  {result.filename}
                </div>
                <div className="mt-1 text-xs text-zinc-500">Filename</div>
              </div>
            </div>

            {result.preview && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-zinc-300">Preview</h3>
                <div className="max-h-80 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
                    {result.preview}
                    {result.word_count > 160 && (
                      <span className="text-zinc-600"> ...</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-zinc-800 pt-6">
              <DocumentQa
                documentId={result.document_id}
                filename={result.filename}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
