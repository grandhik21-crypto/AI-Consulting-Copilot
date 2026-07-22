import { useState, useEffect } from "react";
import { fetchDashboard, chartUrl, slidesPptxUrl } from "../lib/api";

function SectionCard({ icon, title, items, renderItem, emptyMsg }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600/20">
          <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
        {items.length > 0 && (
          <span className="ml-auto text-xs text-zinc-500">{items.length}</span>
        )}
      </div>
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-center text-sm text-zinc-600">{emptyMsg}</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={item.id || i} className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3 transition-colors hover:border-zinc-700">
                {renderItem(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimeBadge({ ts }) {
  if (!ts) return null;
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const label = mins < 1 ? "just now" : mins < 60 ? `${mins}m ago` : hrs < 24 ? `${hrs}h ago` : d.toLocaleDateString();
  return <span className="text-xs text-zinc-600">{label}</span>;
}

const ICONS = {
  uploads: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
  spreadsheets: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  chats: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  swot: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  slides: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  charts: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  emails: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  summaries: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
};

export default function DashboardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-zinc-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      key: "uploads",
      icon: ICONS.uploads,
      title: "Uploaded Documents",
      items: data?.uploads || [],
      emptyMsg: "No PDF documents uploaded yet.",
      renderItem: (item) => (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-zinc-200">{item.filename}</div>
            <div className="text-xs text-zinc-500">{item.pages} pages · {item.word_count} words</div>
          </div>
          <TimeBadge ts={item.timestamp} />
        </div>
      ),
    },
    {
      key: "spreadsheets",
      icon: ICONS.spreadsheets,
      title: "Uploaded Spreadsheets",
      items: data?.spreadsheets || [],
      emptyMsg: "No spreadsheets uploaded yet.",
      renderItem: (item) => (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-zinc-200">{item.filename}</div>
            <div className="text-xs text-zinc-500">{item.rows} rows · {item.columns} columns</div>
          </div>
          <TimeBadge ts={item.timestamp} />
        </div>
      ),
    },
    {
      key: "chats",
      icon: ICONS.chats,
      title: "Recent Chats",
      items: data?.chats || [],
      emptyMsg: "No chat messages yet.",
      renderItem: (item) => (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-zinc-200">{item.last_message}</div>
          </div>
          <TimeBadge ts={item.timestamp} />
        </div>
      ),
    },
    {
      key: "summaries",
      icon: ICONS.summaries,
      title: "Executive Summaries",
      items: data?.summaries || [],
      emptyMsg: "No executive summaries generated yet.",
      renderItem: (item) => (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-zinc-200">Executive summary generated</div>
          <TimeBadge ts={item.timestamp} />
        </div>
      ),
    },
    {
      key: "swot",
      icon: ICONS.swot,
      title: "SWOT Analyses",
      items: data?.swot || [],
      emptyMsg: "No SWOT analyses generated yet.",
      renderItem: (item) => (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium capitalize text-zinc-200">{item.source_type} SWOT</div>
            <div className="text-xs text-zinc-500">{item.strengths_count} strengths identified</div>
          </div>
          <TimeBadge ts={item.timestamp} />
        </div>
      ),
    },
    {
      key: "slides",
      icon: ICONS.slides,
      title: "Slide Decks",
      items: data?.slides || [],
      emptyMsg: "No slide decks generated yet.",
      renderItem: (item) => (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-zinc-200">{item.title}</div>
            <div className="text-xs text-zinc-500">{item.slide_count} slides</div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={slidesPptxUrl(item.filename)}
              download={item.filename}
              className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            >
              Download
            </a>
            <TimeBadge ts={item.timestamp} />
          </div>
        </div>
      ),
    },
    {
      key: "charts",
      icon: ICONS.charts,
      title: "Generated Charts",
      items: data?.charts || [],
      emptyMsg: "No charts generated yet.",
      renderItem: (item) => (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium capitalize text-zinc-200">{item.chart_type} chart</div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={chartUrl(item.filename)}
              download={item.filename}
              className="rounded-md border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            >
              View
            </a>
            <TimeBadge ts={item.timestamp} />
          </div>
        </div>
      ),
    },
    {
      key: "emails",
      icon: ICONS.emails,
      title: "Email Drafts",
      items: data?.emails || [],
      emptyMsg: "No emails generated yet.",
      renderItem: (item) => (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-zinc-200">{item.subject}</div>
            <div className="text-xs capitalize text-zinc-500">{item.email_type.replace(/_/g, " ")}</div>
          </div>
          <TimeBadge ts={item.timestamp} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Overview of your uploaded files, generated reports, and activity.
            </p>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <SectionCard
              key={section.key}
              icon={section.icon}
              title={section.title}
              items={data?.[section.key] || []}
              renderItem={section.renderItem}
              emptyMsg={section.emptyMsg}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
