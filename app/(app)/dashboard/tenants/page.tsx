"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  createdAt: string;
  updatedAt: string;
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/tenants");
        if (res.ok) {
          const data = await res.json();
          setTenants(data.tenants || []);
        }
      } catch (err) {
        console.error("Failed to load tenants:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const planColors: Record<string, string> = {
    FREE: "bg-gray-500/15 text-gray-400",
    STARTER: "bg-blue-500/10 text-blue-400",
    BUSINESS: "bg-amber-500/10 text-amber-400",
    ENTERPRISE: "bg-purple-500/10 text-purple-400",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400",
    SUSPENDED: "bg-red-500/10 text-red-400",
    INACTIVE: "bg-gray-500/15 text-gray-400",
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tenant? This will remove all associated data.")) return;
    try {
      const res = await fetch(`/api/tenants/${id}`, { method: "DELETE" });
      if (res.ok) setTenants((t) => t.filter((tn) => tn.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Tenants</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage your organizations and API access</p>
        </div>
        <Link
          href="/dashboard/tenants/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors no-underline"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          New Tenant
        </Link>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="w-6 h-6 border-3 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <svg className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="text-sm font-semibold mb-1">No tenants yet</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Create your first tenant to start sending notifications.</p>
            <Link href="/dashboard/tenants/new" className="inline-flex items-center h-8 px-4 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors no-underline">
              Create Tenant
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Name</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Slug</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Status</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Plan</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Rate Limit</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Created</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]"></th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link href={`/dashboard/tenants/${t.id}`} className="text-blue-400 hover:text-blue-300 no-underline">
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{t.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-medium font-mono uppercase tracking-wider ${statusColors[t.status] || "bg-gray-500/10 text-gray-400"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-medium font-mono uppercase tracking-wider ${planColors[t.plan] || "bg-gray-500/10 text-gray-400"}`}>
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{t.rateLimitPerMinute}/min</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{fmtDate(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/dashboard/tenants/${t.id}`} className="inline-flex items-center h-7 px-3 rounded-md text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline border border-transparent hover:border-[var(--border-default)]">
                          Settings
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
