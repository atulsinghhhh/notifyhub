"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type NotificationDetail = {
  id: string;
  tenantId: string;
  recipientId: string | null;
  templateId: string | null;
  channel: string;
  status: string;
  priority: string;
  subject: string | null;
  body: string;
  metadata: Record<string, unknown> | null;
  idempotencyKey: string | null;
  scheduledAt: string | null;
  queuedAt: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  retryCount: number;
  maxRetries: number;
  providerId: string | null;
  createdAt: string;
  updatedAt: string;
};

type LogEntry = {
  id: string;
  eventType: string;
  provider: string | null;
  statusCode: number | null;
  response: string | null;
  timestamp: string;
};

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
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-medium font-mono uppercase tracking-wider ${styles[status] || "bg-gray-500/10 text-gray-400"}`}>
      {status}
    </span>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-[var(--border-subtle)] last:border-b-0">
      <span className="text-xs text-[var(--text-muted)] shrink-0 min-w-[120px]">{label}</span>
      <span className={`text-sm text-[var(--text-primary)] text-right break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [notification, setNotification] = useState<NotificationDetail | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"details" | "logs">("details");

  useEffect(() => {
    async function load() {
      try {
        const [nRes, lRes] = await Promise.all([
          fetch(`/api/notifications/${id}`),
          fetch(`/api/notifications/${id}/logs`),
        ]);
        if (nRes.ok) setNotification(await nRes.json());
        if (lRes.ok) {
          const d = await lRes.json();
          setLogs(d.logs || []);
        }
      } catch (err) {
        console.error("Failed to load notification:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const fmtDate = (d: string | null) => {
    if (!d) return "\u2014";
    return new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  const dotColors: Record<string, string> = {
    QUEUED: "bg-amber-500",
    SENT: "bg-blue-500",
    DELIVERED: "bg-emerald-500",
    FAILED: "bg-red-500",
    BOUNCED: "bg-red-500",
    OPENED: "bg-cyan-500",
    CLICKED: "bg-purple-500",
    RETRIED: "bg-amber-500",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-6 h-6 border-3 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h3 className="text-base font-semibold mb-1">Notification not found</h3>
        <p className="text-sm text-[var(--text-muted)] mb-5">This notification may have been deleted or does not exist.</p>
        <Link href="/dashboard/notifications" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-3">
            Notification <StatusBadge status={notification.status} />
          </h1>
          <p className="font-mono text-xs text-[var(--text-muted)]">{notification.id}</p>
        </div>
        <Link href="/dashboard/notifications" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
          Back to list
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border-default)] mb-6">
        <button
          onClick={() => setTab("details")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            tab === "details" ? "text-blue-500 border-blue-500" : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setTab("logs")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            tab === "logs" ? "text-blue-500 border-blue-500" : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"
          }`}
        >
          Delivery Logs ({logs.length})
        </button>
      </div>

      {tab === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overview card */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <span className="text-sm font-semibold">Overview</span>
            </div>
            <div className="px-5 py-4">
              <DetailRow label="Channel" value={notification.channel} />
              <DetailRow label="Priority" value={notification.priority} mono />
              <DetailRow label="Recipient" value={notification.recipientId || "\u2014"} mono />
              <DetailRow label="Template" value={notification.templateId || "\u2014"} mono />
              <DetailRow label="Provider" value={notification.providerId || "\u2014"} mono />
              <DetailRow label="Idempotency Key" value={notification.idempotencyKey || "\u2014"} mono />
            </div>
          </div>

          {/* Timeline card */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <span className="text-sm font-semibold">Timeline</span>
            </div>
            <div className="px-5 py-4">
              <DetailRow label="Created" value={fmtDate(notification.createdAt)} mono />
              <DetailRow label="Queued" value={fmtDate(notification.queuedAt)} mono />
              <DetailRow label="Sent" value={fmtDate(notification.sentAt)} mono />
              <DetailRow label="Delivered" value={fmtDate(notification.deliveredAt)} mono />
              <DetailRow label="Failed" value={fmtDate(notification.failedAt)} mono />
              <DetailRow label="Scheduled" value={fmtDate(notification.scheduledAt)} mono />
              <DetailRow label="Retries" value={`${notification.retryCount} / ${notification.maxRetries}`} mono />
            </div>
          </div>

          {/* Content card */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] md:col-span-2">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <span className="text-sm font-semibold">Content</span>
            </div>
            <div className="px-5 py-4">
              {notification.subject && (
                <DetailRow label="Subject" value={notification.subject} />
              )}
              <div className="mt-3">
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-2">Body</div>
                <div className="p-4 bg-[var(--bg-input)] rounded-lg border border-[var(--border-default)] font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {notification.body}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="p-5">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-[var(--text-muted)]">No delivery logs recorded yet.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {logs.map((log, i) => (
                  <div key={log.id} className={`flex gap-4 py-3 ${i > 0 ? "border-t border-[var(--border-subtle)]" : ""}`}>
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dotColors[log.eventType] || "bg-gray-500"}`} />
                    <div className="flex-1">
                      <div className="font-mono text-xs font-medium text-[var(--text-primary)]">{log.eventType}</div>
                      <div className="text-[0.72rem] text-[var(--text-muted)] mt-0.5">
                        {log.provider && <>Provider: {log.provider}</>}
                        {log.statusCode && <> &mdash; Status: {log.statusCode}</>}
                        {log.response && <> &mdash; {log.response.slice(0, 100)}</>}
                      </div>
                    </div>
                    <div className="font-mono text-[0.7rem] text-[var(--text-muted)] shrink-0">{fmtDate(log.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
