"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SendNotificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [recipientId, setRecipientId] = useState("");
  const [channel, setChannel] = useState("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [templateId, setTemplateId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, unknown> = { recipientId, channel, priority };
      if (subject) payload.subject = subject;
      if (body) payload.body = body;
      if (templateId) payload.templateId = templateId;
      if (scheduledAt) payload.scheduledAt = new Date(scheduledAt).toISOString();
      if (idempotencyKey) payload.idempotencyKey = idempotencyKey;

      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send notification");
        return;
      }

      setSuccess(`Notification queued: ${data.notificationId}`);
      setTimeout(() => router.push("/dashboard/notifications"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const selectCls = "w-full h-10 px-3 pr-8 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm outline-none cursor-pointer appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22%236b7280%22%3E%3Cpath%20d%3D%22M2.22%204.22a.75.75%200%20011.06%200L6%206.94l2.72-2.72a.75.75%200%20111.06%201.06l-3.25%203.25a.75.75%200%2001-1.06%200L2.22%205.28a.75.75%200%20010-1.06z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center]";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Send Notification</h1>
          <p className="text-sm text-[var(--text-muted)]">Compose and dispatch a new notification</p>
        </div>
        <Link href="/dashboard/notifications" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
          Back to list
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-4">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm mb-4">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] max-w-2xl">
          <div className="px-6 py-5 border-b border-[var(--border-subtle)]">
            <h2 className="text-base font-semibold tracking-tight mb-0.5">Notification Details</h2>
            <p className="text-xs text-[var(--text-muted)]">Configure the notification content and delivery options</p>
          </div>

          <div className="px-6 py-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Recipient ID *</label>
                <input type="text" className={inputCls} placeholder="Recipient UUID" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Channel *</label>
                <select className={selectCls} value={channel} onChange={(e) => setChannel(e.target.value)}>
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="PUSH">Push</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Priority</label>
                <select className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Template ID</label>
                <input type="text" className={inputCls} placeholder="Optional — use a template" value={templateId} onChange={(e) => setTemplateId(e.target.value)} />
                <span className="text-[0.72rem] text-[var(--text-muted)]">Leave blank to use custom subject/body</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Subject</label>
              <input type="text" className={inputCls} placeholder="Email subject or push title" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Body</label>
              <textarea
                className="w-full min-h-[120px] px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-mono text-sm leading-relaxed outline-none resize-y transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Notification message content…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Schedule (optional)</label>
                <input type="datetime-local" className={inputCls} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                <span className="text-[0.72rem] text-[var(--text-muted)]">Leave blank to send immediately</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Idempotency Key</label>
                <input type="text" className={inputCls} placeholder="Unique dedup key" value={idempotencyKey} onChange={(e) => setIdempotencyKey(e.target.value)} />
                <span className="text-[0.72rem] text-[var(--text-muted)]">Prevents duplicate sends</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex justify-end gap-2">
            <Link href="/dashboard/notifications" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !recipientId}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.114A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                  Send Notification
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
