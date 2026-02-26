"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Template = {
  id: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
};

export default function SendNotificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBulkMode = searchParams.get("mode") === "bulk";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Recipient mode: "id" | "email" | "phone"
  const [recipientMode, setRecipientMode] = useState<"id" | "email" | "phone">("email");
  const [recipientId, setRecipientId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [channel, setChannel] = useState("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [templateId, setTemplateId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");

  // Bulk mode: comma-separated recipients
  const [bulkRecipients, setBulkRecipients] = useState("");

  // Templates list for dropdown
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || []);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    }
    loadTemplates();
  }, []);

  // When a template is selected, auto-populate subject/body
  const handleTemplateSelect = (id: string) => {
    setTemplateId(id);
    if (id) {
      const tpl = templates.find((t) => t.id === id);
      if (tpl) {
        setChannel(tpl.channel);
        if (tpl.subject) setSubject(tpl.subject);
        if (tpl.body) setBody(tpl.body);
      }
    }
  };

  const hasRecipient = isBulkMode
    ? bulkRecipients.trim().length > 0
    : (recipientMode === "id" && recipientId.trim()) ||
      (recipientMode === "email" && email.trim()) ||
      (recipientMode === "phone" && phone.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isBulkMode) {
        // Parse comma/newline separated recipients
        const recipientList = bulkRecipients
          .split(/[,\n]+/)
          .map((r) => r.trim())
          .filter(Boolean);

        if (recipientList.length === 0) {
          setError("Enter at least one recipient");
          setLoading(false);
          return;
        }

        // Build notification array for bulk API
        const notifications = recipientList.map((recipient) => {
          const item: Record<string, unknown> = { channel, priority };

          // Auto-detect type: email vs phone vs ID
          if (recipient.includes("@")) {
            item.email = recipient;
          } else if (recipient.startsWith("+") || /^\d{10,}$/.test(recipient)) {
            item.phone = recipient;
          } else {
            item.recipientId = recipient;
          }

          if (subject) item.subject = subject;
          if (body) item.body = body;
          if (templateId) item.templateId = templateId;
          if (scheduledAt) item.scheduledAt = new Date(scheduledAt).toISOString();
          return item;
        });

        const res = await fetch("/api/notifications/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notifications }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Bulk send failed");
          return;
        }

        setSuccess(`Bulk send complete: ${data.success} queued, ${data.failed} failed out of ${data.total}`);
        setTimeout(() => router.push("/dashboard/notifications"), 2000);
      } else {
        const payload: Record<string, unknown> = { channel, priority };

      // Set recipient based on mode
      if (recipientMode === "id" && recipientId) payload.recipientId = recipientId;
      if (recipientMode === "email" && email) payload.email = email;
      if (recipientMode === "phone" && phone) payload.phone = phone;

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
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const selectCls = "w-full h-10 px-3 pr-8 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] text-sm outline-none cursor-pointer appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22%236b7280%22%3E%3Cpath%20d%3D%22M2.22%204.22a.75.75%200%20011.06%200L6%206.94l2.72-2.72a.75.75%200%20111.06%201.06l-3.25%203.25a.75.75%200%2001-1.06%200L2.22%205.28a.75.75%200%20010-1.06z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.6rem_center]";
  const modeBtnCls = (active: boolean) =>
    `h-8 px-3 rounded-md text-xs font-medium transition-all cursor-pointer ${
      active
        ? "bg-blue-500 text-white shadow-md shadow-blue-500/25"
        : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
    }`;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{isBulkMode ? "Send Bulk Notifications" : "Send Notification"}</h1>
          <p className="text-sm text-[var(--text-muted)]">{isBulkMode ? "Send the same notification to multiple recipients at once" : "Compose and dispatch a new notification"}</p>
        </div>
        <div className="flex gap-2">
          {isBulkMode ? (
            <Link href="/dashboard/notifications/new" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
              Single Mode
            </Link>
          ) : (
            <Link href="/dashboard/notifications/new?mode=bulk" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
              Bulk Mode
            </Link>
          )}
          <Link href="/dashboard/notifications" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
            Back to list
          </Link>
        </div>
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
            {/* Recipient section */}
            {isBulkMode ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Recipients * <span className="normal-case font-normal tracking-normal text-[var(--text-muted)]">(one per line, or comma-separated)</span></label>
                <textarea
                  className="w-full min-h-[120px] px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] font-mono text-sm leading-relaxed outline-none resize-y transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder={"user1@example.com\nuser2@example.com\n+916386748921"}
                  value={bulkRecipients}
                  onChange={(e) => setBulkRecipients(e.target.value)}
                />
                <span className="text-[0.68rem] text-[var(--text-muted)]">
                  Enter emails, phone numbers (with country code), or recipient IDs — auto-detected per entry.
                  {bulkRecipients.trim() && (
                    <span className="ml-1 font-medium text-blue-400">
                      {bulkRecipients.split(/[,\n]+/).map(r => r.trim()).filter(Boolean).length} recipient(s)
                    </span>
                  )}
                </span>
              </div>
            ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Recipient *</label>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
                  <button type="button" onClick={() => setRecipientMode("email")} className={modeBtnCls(recipientMode === "email")}>Email</button>
                  <button type="button" onClick={() => setRecipientMode("phone")} className={modeBtnCls(recipientMode === "phone")}>Phone</button>
                  <button type="button" onClick={() => setRecipientMode("id")} className={modeBtnCls(recipientMode === "id")}>ID</button>
                </div>
              </div>
              {recipientMode === "email" && (
                <input type="email" className={inputCls} placeholder="recipient@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              )}
              {recipientMode === "phone" && (
                <input type="tel" className={inputCls} placeholder="+916386748921" value={phone} onChange={(e) => setPhone(e.target.value)} />
              )}
              {recipientMode === "id" && (
                <input type="text" className={inputCls} placeholder="Recipient UUID" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} />
              )}
              <span className="text-[0.68rem] text-[var(--text-muted)]">
                {recipientMode === "email" ? "Look up recipient by their email address" :
                 recipientMode === "phone" ? "Look up recipient by their phone number (include country code)" :
                 "Use the recipient's unique ID directly"}
              </span>
            </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Channel *</label>
                <select className={selectCls} value={channel} onChange={(e) => setChannel(e.target.value)}>
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="PUSH">Push</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Priority</label>
                <select className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Template selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Template (optional)</label>
              <select
                className={selectCls}
                value={templateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
              >
                <option value="">— No template (custom content) —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.channel})
                  </option>
                ))}
              </select>
              <span className="text-[0.68rem] text-[var(--text-muted)]">Select a template to auto-fill subject &amp; body, or write custom content below</span>
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
              disabled={loading || !hasRecipient}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.114A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                  {isBulkMode ? "Send Bulk Notifications" : "Send Notification"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}