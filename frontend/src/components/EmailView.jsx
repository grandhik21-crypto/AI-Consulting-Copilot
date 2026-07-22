import { useState } from "react";
import { generateEmail } from "../lib/api";

const EMAIL_OPTIONS = [
  { value: "meeting_follow_up", label: "Meeting Follow-up", desc: "Send a recap after a client or internal meeting" },
  { value: "status_update", label: "Status Update", desc: "Provide a progress update on a project or task" },
  { value: "client_proposal", label: "Client Proposal", desc: "Draft a proposal or pitch for a client" },
  { value: "thank_you", label: "Thank You", desc: "Send a professional thank-you note" },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
];

function TypeCard({ option, selected, onClick, disabled }) {
  return (
    <button
      onClick={() => onClick(option.value)}
      disabled={disabled}
      className={`rounded-xl border p-4 text-left transition-colors ${
        selected
          ? "border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500"
          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
      } disabled:opacity-40`}
    >
      <div className="text-sm font-medium text-zinc-200">{option.label}</div>
      <div className="mt-1 text-xs text-zinc-500">{option.desc}</div>
    </button>
  );
}

function ToneBadge({ option, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(option.value)}
      className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
        selected
          ? "border-indigo-500 bg-indigo-950/30 text-indigo-300"
          : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
      }`}
    >
      {option.label}
    </button>
  );
}

export default function EmailView() {
  const [emailType, setEmailType] = useState("meeting_follow_up");
  const [tone, setTone] = useState("professional");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateEmail(emailType, tone, context);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = () => {
    if (!result) return;
    copyToClipboard(`Subject: ${result.subject}\n\n${result.body}`, "all");
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">
            Business Emails
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Generate professional emails for meetings, updates, proposals, and
            thank-you notes.
          </p>
        </div>

        {!result && (
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-300">
                Email Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {EMAIL_OPTIONS.map((opt) => (
                  <TypeCard
                    key={opt.value}
                    option={opt}
                    selected={emailType === opt.value}
                    onClick={setEmailType}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-300">
                Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((opt) => (
                  <ToneBadge
                    key={opt.value}
                    option={opt}
                    selected={tone === opt.value}
                    onClick={setTone}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Context (optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Add specific details, names, project references, or key points to include..."
                rows={5}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
            >
              {loading ? "Generating Email..." : "Generate Email"}
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Composing your email...</p>
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-100">
                  {EMAIL_OPTIONS.find((o) => o.value === result.email_type)?.label || "Email"}
                </h2>
                <p className="text-sm capitalize text-zinc-500">
                  Tone: {tone}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                >
                  {copiedField === "all" ? (
                    <>Copied</>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy All
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="border-b border-zinc-800 px-6 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Subject
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.subject, "subject")}
                    className="text-xs text-zinc-600 hover:text-zinc-400"
                  >
                    {copiedField === "subject" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100">
                  {result.subject}
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Body
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.body, "body")}
                    className="text-xs text-zinc-600 hover:text-zinc-400"
                  >
                    {copiedField === "body" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="whitespace-pre-wrap rounded-lg bg-zinc-900 px-4 py-3 text-sm leading-relaxed text-zinc-300">
                  {result.body}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
