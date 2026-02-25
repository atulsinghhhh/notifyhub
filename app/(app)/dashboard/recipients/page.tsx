"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Recipient = {
  id: string;
  externalId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  timezone: string | null;
  locale: string | null;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/recipients?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.recipients || []);
        setPagination((prev) => ({ ...prev, ...data.pagination }));
      }
    } catch (err) {
      console.error("Failed to load recipients:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recipient and all their data?")) return;
    try {
      const res = await fetch(`/api/recipients/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Recipients</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage your notification recipients</p>
        </div>
        <Link
          href="/dashboard/recipients/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors no-underline"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          Add Recipient
        </Link>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
        {/* Search toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              className="w-full h-9 pl-9 pr-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="Search by name, email, phone, or external ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="w-6 h-6 border-3 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : recipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <svg className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="text-sm font-semibold mb-1">No recipients found</h3>
            <p className="text-xs text-[var(--text-muted)]">{search ? "No results match your search." : "Recipients will appear here once created via the API."}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Name</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Email</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Phone</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Timezone</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">External ID</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Created</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]"></th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">
                        <Link href={`/dashboard/recipients/${r.id}`} className="text-blue-400 hover:text-blue-300 no-underline">
                          {r.name || "\u2014"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{r.email || "\u2014"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">{r.phone || "\u2014"}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{r.timezone || "UTC"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)] max-w-[100px] truncate">{r.externalId || "\u2014"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Link href={`/dashboard/recipients/${r.id}`} className="inline-flex items-center h-7 px-3 rounded-md text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline border border-transparent hover:border-[var(--border-default)]">
                            View
                          </Link>
                          <button onClick={() => handleDelete(r.id)} className="inline-flex items-center h-7 px-3 rounded-md text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)]">
                {pagination.total} recipients &mdash; Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  className="inline-flex items-center h-7 px-3 rounded-md text-xs border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Prev
                </button>
                <button
                  className="inline-flex items-center h-7 px-3 rounded-md text-xs border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
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
