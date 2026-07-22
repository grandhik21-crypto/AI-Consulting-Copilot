import { useState } from "react";
import { generateSlides, slidesPptxUrl } from "../lib/api";

function SlideCard({ slide, index, total }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <span className="text-xs font-medium text-zinc-500">
          Slide {index} of {total}
        </span>
        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
          {index === 1 ? "Title" : "Content"}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-bold text-zinc-100">{slide.slide_title}</h3>
        </div>

        <div>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Key Points
          </h4>
          <ul className="space-y-1">
            {slide.bullet_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {slide.chart_to_include && (
          <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Chart Recommendation
            </div>
            <p className="mt-1 text-sm text-amber-300">{slide.chart_to_include}</p>
          </div>
        )}

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Speaker Notes
          </div>
          <p className="mt-1 text-sm italic text-zinc-400">{slide.speaker_notes}</p>
        </div>
      </div>
    </div>
  );
}

export default function SlidesView() {
  const [summary, setSummary] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!summary.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateSlides(summary);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const lines = [`Slide Deck: ${result.title}`, ""];
    result.slides.forEach((s, i) => {
      lines.push(`--- Slide ${i + 1}: ${s.slide_title} ---`);
      lines.push("");
      s.bullet_points.forEach((b) => lines.push(`• ${b}`));
      lines.push("");
      if (s.chart_to_include) {
        lines.push(`Chart: ${s.chart_to_include}`);
        lines.push("");
      }
      lines.push(`Speaker Notes: ${s.speaker_notes}`);
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Consulting Slide Outlines
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Paste an executive summary or report to generate a professional slide
            deck outline with speaker notes and chart recommendations.
          </p>
        </div>

        {!result && (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Executive Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Paste your executive summary here..."
                rows={10}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-500"
              />
              <p className="mt-1.5 text-xs text-zinc-600">
                Include key findings, data points, and strategic recommendations
                for the best results.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !summary.trim()}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
            >
              {loading ? "Generating Slide Outlines..." : "Generate Slide Outlines"}
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">
              Generating slide outlines and building PowerPoint...
            </p>
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
                  {result.title}
                </h2>
                <p className="text-sm text-zinc-500">
                  {result.slides.length} slides generated
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
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
                <a
                  href={slidesPptxUrl(result.filename)}
                  download={result.filename}
                  className="flex items-center gap-1.5 rounded-md border border-indigo-700 bg-indigo-600/10 px-3 py-1.5 text-xs text-indigo-400 transition-colors hover:bg-indigo-600/20"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PowerPoint
                </a>
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

            <div className="space-y-4">
              {result.slides.map((slide, i) => (
                <SlideCard
                  key={i}
                  slide={slide}
                  index={i + 1}
                  total={result.slides.length}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
