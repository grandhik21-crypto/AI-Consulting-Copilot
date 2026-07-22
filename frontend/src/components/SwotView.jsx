import { useState } from "react";
import { generateSwot, uploadPdf, uploadExcel } from "../lib/api";

const SOURCE_OPTIONS = [
  { value: "chat", label: "Chat Context", desc: "Use the current conversation" },
  { value: "pdf", label: "PDF Document", desc: "Upload a PDF for analysis" },
  { value: "excel", label: "Spreadsheet", desc: "Upload an Excel/CSV file" },
];

function SourceSelector({ value, onChange, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {SOURCE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={`rounded-xl border p-4 text-left transition-colors ${
            value === opt.value
              ? "border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500"
              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
          } disabled:opacity-40`}
        >
          <div className="text-sm font-medium text-zinc-200">{opt.label}</div>
          <div className="mt-1 text-xs text-zinc-500">{opt.desc}</div>
        </button>
      ))}
    </div>
  );
}

function SwotCard({ title, items, colorClass, icon }) {
  const colors = {
    green: { border: "border-emerald-800/50", bg: "bg-emerald-950/20", badge: "bg-emerald-600" },
    red: { border: "border-red-800/50", bg: "bg-red-950/20", badge: "bg-red-600" },
    blue: { border: "border-blue-800/50", bg: "bg-blue-950/20", badge: "bg-blue-600" },
    amber: { border: "border-amber-800/50", bg: "bg-amber-950/20", badge: "bg-amber-600" },
  };
  const c = colors[colorClass] || colors.green;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5`}>
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${c.badge}`}>
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-zinc-300">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const ICONS = {
  strengths: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  weaknesses: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  opportunities: "M13 10V3L4 14h7v7l9-11h-7z",
  threats: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
};

export default function SwotView({ chatMessages }) {
  const [sourceType, setSourceType] = useState("chat");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [fileLabel, setFileLabel] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (sourceType === "chat") {
        if (!chatMessages || chatMessages.length === 0) {
          throw new Error("No chat messages available. Start a conversation first.");
        }
        const history = chatMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const data = await generateSwot("chat", { chatHistory: history });
        setResult(data);
      } else if (sourceType === "pdf") {
        if (!uploadingFile) {
          throw new Error("Please upload a PDF file first.");
        }
        const uploadResult = await uploadPdf(uploadingFile);
        const data = await generateSwot("pdf", { sourceId: uploadResult.document_id });
        setResult(data);
      } else if (sourceType === "excel") {
        if (!uploadingFile) {
          throw new Error("Please upload a spreadsheet first.");
        }
        const uploadResult = await uploadExcel(uploadingFile);
        const data = await generateSwot("excel", { sourceId: uploadResult.spreadsheet_id });
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingFile(file);
      setFileLabel(file.name);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      "=== SWOT ANALYSIS ===",
      "",
      "STRENGTHS",
      ...result.strengths.map((s) => `• ${s}`),
      "",
      "WEAKNESSES",
      ...result.weaknesses.map((w) => `• ${w}`),
      "",
      "OPPORTUNITIES",
      ...result.opportunities.map((o) => `• ${o}`),
      "",
      "THREATS",
      ...result.threats.map((t) => `• ${t}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setUploadingFile(null);
    setFileLabel("");
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">SWOT Analysis</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Generate a professional SWOT analysis from a document, spreadsheet, or
            your current conversation.
          </p>
        </div>

        {!result && (
          <div className="space-y-6">
            <SourceSelector
              value={sourceType}
              onChange={(v) => {
                setSourceType(v);
                setUploadingFile(null);
                setFileLabel("");
                setError(null);
              }}
              disabled={loading}
            />

            {sourceType === "pdf" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Upload PDF
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Choose file
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {fileLabel && (
                    <span className="text-sm text-zinc-500">{fileLabel}</span>
                  )}
                </div>
              </div>
            )}

            {sourceType === "excel" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Upload Spreadsheet
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Choose file
                    <input
                      type="file"
                      accept=".xlsx,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {fileLabel && (
                    <span className="text-sm text-zinc-500">{fileLabel}</span>
                  )}
                </div>
              </div>
            )}

            {sourceType === "chat" && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20">
                    <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-300">
                      {chatMessages && chatMessages.length > 0
                        ? `Using ${chatMessages.length} message(s) from the current conversation.`
                        : "No messages yet. Start chatting first."}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-600">
                      The last 20 messages will be analyzed.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={
                loading ||
                (sourceType !== "chat" && !uploadingFile) ||
                (sourceType === "chat" && (!chatMessages || chatMessages.length === 0))
              }
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
            >
              {loading ? "Generating SWOT Analysis..." : "Generate SWOT Analysis"}
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Analyzing data and generating SWOT...</p>
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100">SWOT Analysis Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                >
                  {copied ? (
                    <>Copied</>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
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
                  New Analysis
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SwotCard
                title="Strengths"
                items={result.strengths}
                colorClass="green"
                icon={ICONS.strengths}
              />
              <SwotCard
                title="Weaknesses"
                items={result.weaknesses}
                colorClass="red"
                icon={ICONS.weaknesses}
              />
              <SwotCard
                title="Opportunities"
                items={result.opportunities}
                colorClass="blue"
                icon={ICONS.opportunities}
              />
              <SwotCard
                title="Threats"
                items={result.threats}
                colorClass="amber"
                icon={ICONS.threats}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
