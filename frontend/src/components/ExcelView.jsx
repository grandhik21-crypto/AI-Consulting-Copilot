import { useState, useRef, useEffect } from "react";
import ExcelUploadZone from "./ExcelUploadZone";
import { uploadExcel, askExcel, generateChart, chartUrl, summarizeExcel } from "../lib/api";

function ExcelQa({ spreadsheetId, filename }) {
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
      const data = await askExcel(spreadsheetId, text);
      const assistantMsg = {
        role: "assistant",
        content: data.answer,
        calculation: data.calculation,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
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
        Questions are answered by computing against the actual data.
      </p>

      <div className="mb-4 max-h-72 space-y-3 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-zinc-600">
            Ask a question to get started.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="space-y-1">
            <div
              className={`text-sm leading-relaxed ${
                msg.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={
                  msg.role === "user"
                    ? "inline-block rounded-xl bg-indigo-600 px-3 py-2 text-white"
                    : "inline-block text-zinc-300"
                }
              >
                {msg.content}
              </span>
            </div>
            {msg.calculation && (
              <div className="text-left text-xs text-indigo-400">
                {msg.calculation}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
            Computing...
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
          placeholder="e.g. What was the highest revenue?"
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

function ExcelCharts({ spreadsheetId, columnNames }) {
  const [chartType, setChartType] = useState("bar");
  const [xColumn, setXColumn] = useState(columnNames[0] || "");
  const [yColumn, setYColumn] = useState("");
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const numericCols = columnNames.filter((c) => c !== xColumn);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setChart(null);
    try {
      const data = await generateChart(
        spreadsheetId,
        chartType,
        xColumn,
        chartType === "histogram" || chartType === "pie" ? null : yColumn || null
      );
      setChart(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!chart) return;
    const link = document.createElement("a");
    link.href = chartUrl(chart.filename);
    link.download = chart.filename;
    link.click();
  };

  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-zinc-300">Charts</h3>
      <p className="mb-4 text-xs text-zinc-500">
        Generate bar, pie, line, or histogram charts from your data.
      </p>

      <div className="mb-4 grid grid-cols-4 gap-3">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none"
        >
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
          <option value="line">Line</option>
          <option value="histogram">Histogram</option>
        </select>

        <select
          value={xColumn}
          onChange={(e) => setXColumn(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none"
        >
          {columnNames.map((c) => (
            <option key={c} value={c}>{c} (X)</option>
          ))}
        </select>

        {chartType !== "histogram" && chartType !== "pie" && (
          <select
            value={yColumn}
            onChange={(e) => setYColumn(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none"
          >
            <option value="">-- None --</option>
            {numericCols.map((c) => (
              <option key={c} value={c}>{c} (Y)</option>
            ))}
          </select>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !xColumn}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {chart && (
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2">
            <img
              src={chartUrl(chart.filename)}
              alt={`${chartType} chart`}
              className="w-full rounded-lg"
            />
          </div>
          <button
            onClick={handleDownload}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
}

function ExecutiveSummary({ spreadsheetId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await summarizeExcel(spreadsheetId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!data) return;
    const text = [
      `Executive Summary\n${data.executive_summary}`,
      `\nKey Findings\n${data.key_findings.map((f) => `• ${f}`).join("\n")}`,
      `\nRisks\n${data.risks.map((r) => `• ${r}`).join("\n")}`,
      `\nRecommendations\n${data.recommendations.map((r) => `• ${r}`).join("\n")}`,
      `\nNext Steps\n${data.next_steps.map((s) => `• ${s}`).join("\n")}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-300">
            Executive Summary
          </h3>
          <p className="text-xs text-zinc-500">
            Generate a professional consulting-quality report.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
        >
          {loading ? "Generating..." : "Generate Executive Summary"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex justify-end">
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
          </div>

          <Section title="Executive Summary" icon="summary">
            <p className="text-sm leading-relaxed text-zinc-300">
              {data.executive_summary}
            </p>
          </Section>

          <Section title="Key Findings" icon="findings">
            <ul className="list-disc space-y-1 pl-5">
              {data.key_findings.map((item, i) => (
                <li key={i} className="text-sm text-zinc-300">{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Risks" icon="risks">
            <ul className="list-disc space-y-1 pl-5">
              {data.risks.map((item, i) => (
                <li key={i} className="text-sm text-amber-300">{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Recommendations" icon="recommendations">
            <ul className="list-disc space-y-1 pl-5">
              {data.recommendations.map((item, i) => (
                <li key={i} className="text-sm text-emerald-300">{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Next Steps" icon="next">
            <ol className="list-decimal space-y-1 pl-5">
              {data.next_steps.map((item, i) => (
                <li key={i} className="text-sm text-zinc-300">{item}</li>
              ))}
            </ol>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, children }) {
  const icons = {
    summary: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    findings: "M13 10V3L4 14h7v7l9-11h-7z",
    risks: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
    recommendations: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    next: "M5 13l4 4L19 7",
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[icon]} />
        </svg>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

export default function ExcelView() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await uploadExcel(file);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">Spreadsheets</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload an Excel file or CSV to inspect columns, data types, ask
            questions, and generate charts.
          </p>
        </div>

        {!result && !loading && <ExcelUploadZone onUpload={handleUpload} />}

        {loading && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Processing file...</p>
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
              onClick={() => { setResult(null); setError(null); }}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Upload another file
            </button>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                <div className="text-2xl font-bold text-indigo-400">{result.rows}</div>
                <div className="mt-1 text-xs text-zinc-500">Rows</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                <div className="text-2xl font-bold text-indigo-400">{result.columns}</div>
                <div className="mt-1 text-xs text-zinc-500">Columns</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                <div className="text-sm font-medium text-zinc-200 truncate">{result.filename}</div>
                <div className="mt-1 text-xs text-zinc-500">Filename</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                <div className="text-sm font-medium text-zinc-200">{result.preview.length}</div>
                <div className="mt-1 text-xs text-zinc-500">Preview rows</div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-300">Schema</h3>
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900">
                      <th className="px-4 py-2.5 font-medium text-zinc-400">Column</th>
                      <th className="px-4 py-2.5 font-medium text-zinc-400">Type</th>
                      <th className="px-4 py-2.5 font-medium text-zinc-400">Missing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.column_names.map((col) => (
                      <tr key={col} className="border-b border-zinc-800 last:border-0">
                        <td className="px-4 py-2 text-zinc-200">{col}</td>
                        <td className="px-4 py-2 text-zinc-500">{result.data_types[col]}</td>
                        <td className="px-4 py-2 text-zinc-500">{result.missing_values[col] ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-300">
                Preview (first {result.preview.length} rows)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900">
                      {result.column_names.map((col) => (
                        <th key={col} className="whitespace-nowrap px-4 py-2.5 font-medium text-zinc-400">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.preview.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-800 last:border-0">
                        {result.column_names.map((col) => (
                          <td key={col} className="max-w-xs truncate px-4 py-2 text-zinc-300">
                            {String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <ExecutiveSummary spreadsheetId={result.spreadsheet_id} />
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <ExcelCharts
                spreadsheetId={result.spreadsheet_id}
                columnNames={result.column_names}
              />
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <ExcelQa
                spreadsheetId={result.spreadsheet_id}
                filename={result.filename}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
