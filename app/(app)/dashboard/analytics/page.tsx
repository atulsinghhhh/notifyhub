"use client";

import { useEffect, useState } from "react";

type Summary = {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalBounced: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: string;
  failureRate: string;
};

type ChannelData = {
  channel: string;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalBounced: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: string;
};

type TimelinePoint = {
  date: string;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalBounced: number;
  totalOpened: number;
  totalClicked: number;
};

type TemplateUsage = {
  id: string;
  name: string;
  channel: string;
  usageCount: number;
  lastUsed: string | null;
};

/* ── Stat Card ── */
function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  const accents: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: "bg-blue-500/8", border: "border-blue-500/20", text: "text-blue-400" },
    green: { bg: "bg-emerald-500/8", border: "border-emerald-500/20", text: "text-emerald-400" },
    red: { bg: "bg-red-500/8", border: "border-red-500/20", text: "text-red-400" },
    amber: { bg: "bg-amber-500/8", border: "border-amber-500/20", text: "text-amber-400" },
    cyan: { bg: "bg-cyan-500/8", border: "border-cyan-500/20", text: "text-cyan-400" },
    purple: { bg: "bg-purple-500/8", border: "border-purple-500/20", text: "text-purple-400" },
  };
  const a = accents[accent] || accents.blue;

  return (
    <div className={`relative rounded-xl border ${a.border} ${a.bg} p-5 overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent" />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${a.bg} border ${a.border} flex items-center justify-center ${a.text}`}>
          {icon}
        </div>
      </div>
      <div className="font-mono text-2xl font-semibold text-[var(--text-primary)] leading-none tracking-tight">
        {value}
      </div>
      <div className="text-[0.7rem] font-medium uppercase tracking-widest text-[var(--text-muted)] mt-2">{label}</div>
      {sub && <div className="text-[0.68rem] text-[var(--text-muted)] mt-1 opacity-70">{sub}</div>}
    </div>
  );
}

/* ── Channel Badge ── */
function ChannelBadge({ channel }: { channel: string }) {
  const styles: Record<string, string> = {
    EMAIL: "bg-blue-500/12 text-blue-400 border-blue-500/20",
    SMS: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
    PUSH: "bg-purple-500/12 text-purple-400 border-purple-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.68rem] font-semibold tracking-wide border ${styles[channel] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
      {channel === "EMAIL" && (
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>
      )}
      {channel === "SMS" && (
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" /></svg>
      )}
      {channel === "PUSH" && (
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M4.214 3.227a.75.75 0 00-1.156-.956 8.97 8.97 0 00-1.856 3.826.75.75 0 001.466.316 7.47 7.47 0 011.546-3.186zM16.942 2.271a.75.75 0 00-1.157.956 7.47 7.47 0 011.547 3.186.75.75 0 001.466-.316 8.971 8.971 0 00-1.856-3.826zM10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.67 1.085h3.104a3.5 3.5 0 006.966 0h3.104a.75.75 0 00.67-1.085A12.29 12.29 0 0116 8a6 6 0 00-6-6zm0 14.5a2 2 0 01-1.732-1h3.464A2 2 0 0110 16.5z" /></svg>
      )}
      {channel}
    </span>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [templateUsage, setTemplateUsage] = useState<TemplateUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sumRes, chRes, tlRes, tplRes] = await Promise.all([
          fetch(`/api/analytics/summary?days=${days}`),
          fetch(`/api/analytics/channels?days=${days}`),
          fetch(`/api/analytics/timeline?days=${days}`),
          fetch(`/api/analytics/templates?days=${days}`),
        ]);
        if (sumRes.ok) setSummary(await sumRes.json());
        if (chRes.ok) {
          const d = await chRes.json();
          setChannels(d.channels || []);
        }
        if (tlRes.ok) {
          const d = await tlRes.json();
          setTimeline(d.timeline || []);
        }
        if (tplRes.ok) {
          const d = await tplRes.json();
          setTemplateUsage(d.templates || []);
        }
      } catch (err) {
        console.error("Analytics load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

  const maxTimelineSent = Math.max(...timeline.map((t) => t.totalSent), 1);
  const maxTemplateUsage = Math.max(...templateUsage.map((t) => t.usageCount), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
          <span className="text-xs text-[var(--text-muted)] tracking-wider uppercase">Loading analytics</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)]">Delivery performance across all channels</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`h-7 px-3.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                days === d
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/25"
                  : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Sent"
          value={summary?.totalSent?.toLocaleString() ?? "0"}
          sub={`Last ${days} days`}
          accent="blue"
          icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.114A28.897 28.897 0 003.105 2.289z" /></svg>}
        />
        <StatCard
          label="Delivered"
          value={summary?.totalDelivered?.toLocaleString() ?? "0"}
          sub={`${summary?.deliveryRate ?? "0%"} rate`}
          accent="green"
          icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          label="Failed"
          value={summary?.totalFailed?.toLocaleString() ?? "0"}
          sub={`${summary?.failureRate ?? "0%"} rate`}
          accent="red"
          icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          label="Bounced"
          value={summary?.totalBounced?.toLocaleString() ?? "0"}
          accent="amber"
          icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          label="Opened"
          value={summary?.totalOpened?.toLocaleString() ?? "0"}
          accent="cyan"
          icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          label="Clicked"
          value={summary?.totalClicked?.toLocaleString() ?? "0"}
          accent="purple"
          icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Timeline chart - takes 2/3 */}
        <div className="xl:col-span-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <div>
              <span className="font-semibold text-sm">Delivery Timeline</span>
              <p className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">Daily notification volume over time</p>
            </div>
            <span className="font-mono text-[0.65rem] text-[var(--text-muted)] px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)]">{days}D</span>
          </div>
          <div className="p-5">
            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm text-[var(--text-muted)]">No timeline data yet</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">Send notifications to see delivery trends</p>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-[2px] h-[200px] pt-4">
                  {timeline.map((point, i) => {
                    const sentH = (point.totalSent / maxTimelineSent) * 100;
                    const delivH = (point.totalDelivered / maxTimelineSent) * 100;
                    const failH = (point.totalFailed / maxTimelineSent) * 100;
                    const isHovered = hoveredBar === i;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex items-end gap-px h-full relative"
                        onMouseEnter={() => setHoveredBar(i)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {isHovered && (
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-10 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-xl text-[0.65rem] whitespace-nowrap pointer-events-none">
                            <div className="font-medium text-[var(--text-primary)] mb-1">{point.date}</div>
                            <div className="flex gap-3">
                              <span className="text-blue-400">{point.totalSent} sent</span>
                              <span className="text-emerald-400">{point.totalDelivered} ok</span>
                              <span className="text-red-400">{point.totalFailed} fail</span>
                            </div>
                          </div>
                        )}
                        <div
                          className={`flex-1 min-w-[3px] rounded-t bg-blue-500 transition-all duration-300 cursor-pointer ${isHovered ? "opacity-100 brightness-110" : "opacity-80 hover:opacity-100"}`}
                          style={{ height: `${Math.max(sentH, 3)}%` }}
                        />
                        <div
                          className={`flex-1 min-w-[3px] rounded-t bg-emerald-500 transition-all duration-300 cursor-pointer ${isHovered ? "opacity-100 brightness-110" : "opacity-70 hover:opacity-100"}`}
                          style={{ height: `${Math.max(delivH, 3)}%` }}
                        />
                        <div
                          className={`flex-1 min-w-[3px] rounded-t bg-red-500 transition-all duration-300 cursor-pointer ${isHovered ? "opacity-100 brightness-110" : "opacity-70 hover:opacity-100"}`}
                          style={{ height: `${Math.max(failH, 3)}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-5 pt-4 border-t border-[var(--border-subtle)] mt-4">
                  <div className="flex items-center gap-2 text-[0.7rem] text-[var(--text-muted)]">
                    <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Sent
                  </div>
                  <div className="flex items-center gap-2 text-[0.7rem] text-[var(--text-muted)]">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Delivered
                  </div>
                  <div className="flex items-center gap-2 text-[0.7rem] text-[var(--text-muted)]">
                    <div className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Failed
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Template usage - takes 1/3 */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <div>
              <span className="font-semibold text-sm">Template Usage</span>
              <p className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">Most used notification templates</p>
            </div>
          </div>
          <div className="p-4">
            {templateUsage.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-8 h-8 text-[var(--text-muted)] mb-2 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs text-[var(--text-muted)]">No templates used yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templateUsage.map((tpl, i) => (
                  <div key={tpl.id} className="group p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.65rem] font-mono text-[var(--text-muted)] opacity-50">#{i + 1}</span>
                          <span className="text-sm font-medium text-[var(--text-primary)] truncate">{tpl.name}</span>
                        </div>
                      </div>
                      <ChannelBadge channel={tpl.channel} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${Math.max((tpl.usageCount / maxTemplateUsage) * 100, 4)}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-medium text-[var(--text-primary)] tabular-nums min-w-[3ch] text-right">
                        {tpl.usageCount}
                      </span>
                    </div>
                    {tpl.lastUsed && (
                      <div className="text-[0.62rem] text-[var(--text-muted)] mt-1.5 opacity-60">
                        Last used {new Date(tpl.lastUsed).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel performance */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div>
            <span className="font-semibold text-sm">Channel Performance</span>
            <p className="text-[0.68rem] text-[var(--text-muted)] mt-0.5">Per-channel delivery breakdown</p>
          </div>
        </div>
        <div className="p-5">
          {channels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <svg className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm text-[var(--text-muted)]">No channel data yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">Send notifications to see channel breakdown</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {channels.map((ch) => {
                const total = ch.totalSent || 1;
                const delivPct = ((ch.totalDelivered / total) * 100).toFixed(1);
                const failPct = ((ch.totalFailed / total) * 100).toFixed(1);
                return (
                  <div key={ch.channel} className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <ChannelBadge channel={ch.channel} />
                      <span className="font-mono text-lg font-semibold text-[var(--text-primary)]">{ch.totalSent.toLocaleString()}</span>
                    </div>

                    {/* Stacked bar */}
                    <div className="h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden flex mb-3">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${delivPct}%` }} />
                      <div className="h-full bg-red-500 transition-all" style={{ width: `${failPct}%` }} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="font-mono text-sm font-medium text-emerald-400">{ch.totalDelivered}</div>
                        <div className="text-[0.6rem] text-[var(--text-muted)] uppercase tracking-wider">Delivered</div>
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-red-400">{ch.totalFailed}</div>
                        <div className="text-[0.6rem] text-[var(--text-muted)] uppercase tracking-wider">Failed</div>
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-amber-400">{ch.totalBounced}</div>
                        <div className="text-[0.6rem] text-[var(--text-muted)] uppercase tracking-wider">Bounced</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <span className="text-[0.65rem] text-[var(--text-muted)] uppercase tracking-wider">Delivery Rate</span>
                      <span className="font-mono text-xs font-medium text-[var(--text-primary)]">{ch.deliveryRate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
