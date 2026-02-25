"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [channel, setChannel] = useState("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: Record<string, unknown> = { name, channel, body };
      if (subject) payload.subject = subject;

      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create template");
        return;
      }

      router.push("/dashboard/templates");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">New Template</h1>
          <p className="text-sm text-[var(--text-muted)]">Create a reusable notification template</p>
        </div>
        <Link href="/dashboard/templates" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
          Back
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold mb-0.5">Template Details</h2>
            <p className="text-xs text-[var(--text-muted)]">Use {"{{variableName}}"} for dynamic placeholders</p>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Name *</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="e.g. Welcome Email"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Channel *</label>
                <select
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='%236b7280'%3E%3Cpath d='M2.22 4.47a.75.75 0 011.06 0L6 7.19l2.72-2.72a.75.75 0 011.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L2.22 5.53a.75.75 0 010-1.06z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="PUSH">Push</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Subject</label>
              <input
                type="text"
                className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="Email subject line or push title"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Body *</label>
              <textarea
                className="w-full min-h-[180px] p-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm font-mono leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-y"
                placeholder="Hello {{name}}, your order {{orderId}} has been confirmed..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                maxLength={1000}
              />
              <span className="block mt-1 text-[0.7rem] text-[var(--text-muted)]">{body.length}/1000 characters</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
            <Link href="/dashboard/templates" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              disabled={loading || !name || !body}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : "Create Template"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
