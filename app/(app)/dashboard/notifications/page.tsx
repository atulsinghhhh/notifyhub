"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  channel: string;
  status: string;
  subject: string | null;
  body: string;
  priority: string;
  recipientId: string | null;
  createdAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
};

const STATUSES = ["", "PENDING", "QUEUED", "PROCESSING", "SENT", "DELIVERED", "FAILED", "CANCELLED"];
const CHANNELS = ["", "EMAIL", "SMS", "PUSH"];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400",
    QUEUED: "bg-amber-500/10 text-amber-400",
    PROCESSING: "bg-cyan-500/10 text-cyan-400",
    SENT: "bg-emerald-500/10 text-emerald-400",
    DELIVERED: "bg-emerald-500/10 text-emerald-400",
    FAILED: "bg-red-500/10 text-red-400",
    CANCELLED: "bg-gray-500/15 text-gray-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.7rem] font-medium font-mono uppercase tracking-wider ${styles[status] || "bg-gray-500/10 text-gray-400"}`}>
      {status}
    </span>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [channel, setChannel] = useState("");
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.set("status", status);
      if (channel) params.set("channel", channel);
      const res = await fetch(`/api/notifications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, status, channel]);

  useEffect(() => { load(); }, [load]);

  const fmtDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)]">Track and manage all notification deliveries</p>
        </div>
        <Link
          href="/dashboard/notifications/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors no-underline"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Send Notification
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
        {/* Filters */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] flex-wrap">
          <select
            className="h-[34px] px-3 pr-7 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md text-[var(--text-secondary)] text-sm outline-none focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22%236b7280%22%3E%3Cpath%20d%3D%22M2.22%204.22a.75.75%200%20011.06%200L6%206.94l2.72-2.72a.75.75%200%20111.06%201.06l-3.25%203.25a.75.75%200%2001-1.06%200L2.22%205.28a.75.75%200%20010-1.06z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center]"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="h-[34px] px-3 pr-7 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md text-[var(--text-secondary)] text-sm outline-none focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22%236b7280%22%3E%3Cpath%20d%3D%22M2.22%204.22a.75.75%200%20011.06%200L6%206.94l2.72-2.72a.75.75%200%20111.06%201.06l-3.25%203.25a.75.75%200%2001-1.06%200L2.22%205.28a.75.75%200%20010-1.06z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center]"
            value={channel}
            onChange={(e) => { setChannel(e.target.value); setPage(1); }}
          >
            <option value="">All Channels</option>
            {CHANNELS.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="w-6 h-6 border-3 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-12 h-12 text-[var(--text-muted)] opacity-40 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="font-semibold text-base mb-1">No notifications found</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-xs mb-5">Send your first notification to see it appear here.</p>
            <Link href="/dashboard/notifications/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors no-underline">
              Send Notification
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {["ID", "Channel", "Status", "Subject", "Priority", "Created", "Delivered", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)] border-b border-[var(--border-default)] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n) => (
                    <tr key={n.id} className="group hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs max-w-[100px] overflow-hidden text-ellipsis text-[var(--text-secondary)]">
                        {n.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.7rem] font-medium font-mono uppercase bg-blue-500/15 text-blue-400">
                          {n.channel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                        <StatusBadge status={n.status} />
                      </td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-medium text-[var(--text-primary)] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {n.subject || n.body.slice(0, 40)}
                      </td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)]">
                        {n.priority}
                      </td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)]">
                        {fmtDate(n.createdAt)}
                      </td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)]">
                        {fmtDate(n.deliveredAt)}
                      </td>
                      <td className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                        <Link
                          href={`/dashboard/notifications/${n.id}`}
                          className="h-7 px-2.5 rounded-md text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] inline-flex items-center transition-colors no-underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
              <span className="font-mono">Page {page} — {notifications.length} results</span>
              <div className="flex gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-7 px-2.5 rounded-md border border-[var(--border-default)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Prev
                </button>
                <button
                  disabled={notifications.length < limit}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-7 px-2.5 rounded-md border border-[var(--border-default)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
