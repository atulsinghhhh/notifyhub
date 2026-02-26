"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Template = {
  id: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  _count?: { notifications: number };
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || []);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template permanently?")) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) setTemplates((t) => t.filter((tpl) => tpl.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Templates</h1>
          <p className="text-sm text-[var(--text-muted)]">Reusable notification templates for all channels</p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors no-underline"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          New Template
        </Link>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="w-6 h-6 border-3 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <svg className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="text-sm font-semibold mb-1">No templates yet</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Create your first message template to streamline notifications.</p>
            <Link href="/dashboard/templates/new" className="inline-flex items-center h-8 px-4 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors no-underline">
              Create Template
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Name</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Channel</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Subject</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Used</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Created</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]"></th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link href={`/dashboard/templates/${t.id}`} className="text-blue-400 hover:text-blue-300 no-underline">
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.7rem] font-medium bg-blue-500/10 text-blue-400">
                        {t.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)] max-w-[200px] truncate">
                      {t.subject || "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-[var(--text-primary)]">
                        {t._count?.notifications ?? 0}
                        <span className="text-[var(--text-muted)]">times</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{fmtDate(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/dashboard/templates/${t.id}`} className="inline-flex items-center h-7 px-3 rounded-md text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline border border-transparent hover:border-[var(--border-default)]">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(t.id)} className="inline-flex items-center h-7 px-3 rounded-md text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                          Delete
                        </button>
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
  );
}
