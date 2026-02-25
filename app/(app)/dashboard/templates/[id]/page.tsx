"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [channel, setChannel] = useState("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/templates/${id}`);
        if (res.ok) {
          const data = await res.json();
          const t = data.template;
          setName(t.name);
          setChannel(t.channel);
          setSubject(t.subject || "");
          setBody(t.body);
        }
      } catch (err) {
        console.error("Failed to load template:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: Record<string, unknown> = { name, channel, body };
      if (subject) payload.subject = subject;

      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update template");
        return;
      }

      setSuccess("Template updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this template permanently? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard/templates");
    } catch {
      setError("Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-6 h-6 border-3 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Edit Template</h1>
          <p className="font-mono text-xs text-[var(--text-muted)]">{id}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDelete} className="inline-flex items-center h-9 px-4 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors cursor-pointer">
            Delete
          </button>
          <Link href="/dashboard/templates" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
            Back
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSave}>
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
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Body *</label>
              <textarea
                className="w-full min-h-[180px] p-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm font-mono leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-y"
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
              disabled={saving || !name || !body}
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
