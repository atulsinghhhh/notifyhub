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

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  const borderColors: Record<string, string> = {
    blue: "border-t-blue-500",
    green: "border-t-emerald-500",
    red: "border-t-red-500",
    amber: "border-t-amber-500",
    cyan: "border-t-cyan-500",
  };
  return (
    <div className={`rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-5 overflow-hidden border-t-2 ${borderColors[color]}`}>
      <div className="text-[0.7rem] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
      <div className="font-mono text-3xl font-medium text-[var(--text-primary)] leading-none">{value}</div>
      {sub && <div className="text-xs text-[var(--text-muted)] mt-1.5">{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sumRes, chRes, tlRes] = await Promise.all([
          fetch(`/api/analytics/summary?days=${days}`),
          fetch(`/api/analytics/channels?days=${days}`),
          fetch(`/api/analytics/timeline?days=${days}`),
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
      } catch (err) {
        console.error("Analytics load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

  const maxTimelineSent = Math.max(...timeline.map((t) => t.totalSent), 1);
  const maxChannelSent = Math.max(...channels.map((c) => c.totalSent), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-6 h-6 border-3 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Analytics</h1>
          <p className="text-sm text-[var(--text-muted)]">Delivery performance across all channels</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                days === d
                  ? "bg-blue-500 text-white border border-blue-500"
                  : "bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Sent" value={summary?.totalSent?.toLocaleString() ?? "0"} sub={`Last ${days} days`} color="blue" />
        <StatCard label="Delivered" value={summary?.totalDelivered?.toLocaleString() ?? "0"} sub={`${summary?.deliveryRate ?? "0%"} rate`} color="green" />
        <StatCard label="Failed" value={summary?.totalFailed?.toLocaleString() ?? "0"} sub={`${summary?.failureRate ?? "0%"} rate`} color="red" />
        <StatCard label="Bounced" value={summary?.totalBounced?.toLocaleString() ?? "0"} color="amber" />
        <StatCard label="Opened" value={summary?.totalOpened?.toLocaleString() ?? "0"} color="cyan" />
        <StatCard label="Clicked" value={summary?.totalClicked?.toLocaleString() ?? "0"} color="blue" />
      </div>

      {/* Timeline chart */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <span className="font-semibold text-sm">Delivery Timeline</span>
          <span className="font-mono text-[0.7rem] text-[var(--text-muted)]">{days} DAYS</span>
        </div>
        <div className="p-5">
          {timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-[var(--text-muted)]">No timeline data available yet.</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-[3px] h-[180px] pt-4">
                {timeline.map((point, i) => {
                  const sentH = (point.totalSent / maxTimelineSent) * 100;
                  const delivH = (point.totalDelivered / maxTimelineSent) * 100;
                  const failH = (point.totalFailed / maxTimelineSent) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex items-end gap-px h-full"
                      title={`${point.date}\nSent: ${point.totalSent} | Delivered: ${point.totalDelivered} | Failed: ${point.totalFailed}`}
                    >
                      <div className="flex-1 min-w-1 rounded-t bg-blue-500 transition-all duration-400 cursor-pointer hover:opacity-80" style={{ height: `${Math.max(sentH, 2)}%` }} />
                      <div className="flex-1 min-w-1 rounded-t bg-emerald-500 transition-all duration-400 cursor-pointer hover:opacity-80" style={{ height: `${Math.max(delivH, 2)}%` }} />
                      <div className="flex-1 min-w-1 rounded-t bg-red-500 transition-all duration-400 cursor-pointer hover:opacity-80" style={{ height: `${Math.max(failH, 2)}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-5 pt-3">
                <div className="flex items-center gap-1.5 text-[0.72rem] text-[var(--text-muted)]">
                  <div className="w-2 h-2 rounded-sm bg-blue-500" /> Sent
                </div>
                <div className="flex items-center gap-1.5 text-[0.72rem] text-[var(--text-muted)]">
                  <div className="w-2 h-2 rounded-sm bg-emerald-500" /> Delivered
                </div>
                <div className="flex items-center gap-1.5 text-[0.72rem] text-[var(--text-muted)]">
                  <div className="w-2 h-2 rounded-sm bg-red-500" /> Failed
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Channel performance table */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <span className="font-semibold text-sm">Channel Performance</span>
        </div>
        <div className="p-5">
          {channels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-[var(--text-muted)]">No channel data — send notifications to see breakdown.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {["Channel", "Sent", "Delivered", "Failed", "Bounced", "Opened", "Clicked", "Rate", "Distribution"].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)] border-b border-[var(--border-default)] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {channels.map((ch) => (
                    <tr key={ch.channel} className="group hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.7rem] font-medium font-mono uppercase tracking-wide bg-blue-500/15 text-blue-400">
                          {ch.channel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{ch.totalSent.toLocaleString()}</td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{ch.totalDelivered.toLocaleString()}</td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{ch.totalFailed.toLocaleString()}</td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{ch.totalBounced.toLocaleString()}</td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{ch.totalOpened.toLocaleString()}</td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{ch.totalClicked.toLocaleString()}</td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{ch.deliveryRate}</td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] w-[30%]">
                        <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${(ch.totalSent / maxChannelSent) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
