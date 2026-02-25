"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  webhookUrl: string | null;
  webhookSecret: string | null;
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  ownerId: string | null;
  settings: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-[var(--border-subtle)] last:border-b-0">
      <span className="text-xs text-[var(--text-muted)] shrink-0 min-w-[100px]">{label}</span>
      <span className={`text-sm text-[var(--text-primary)] text-right break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit state
  const [editName, setEditName] = useState("");
  const [editPlan, setEditPlan] = useState("FREE");
  const [editWebhookUrl, setEditWebhookUrl] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/tenants/${id}`);
        if (res.ok) {
          const data = await res.json();
          const t = data.tenant;
          setTenant(t);
          setEditName(t.name);
          setEditPlan(t.plan);
          setEditWebhookUrl(t.webhookUrl || "");
          setEditStatus(t.status);
        }
      } catch (err) {
        console.error("Failed to load tenant:", err);
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
      const res = await fetch(`/api/tenants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          plan: editPlan,
          webhookUrl: editWebhookUrl || null,
          status: editStatus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTenant(data.tenant);
        setSuccess("Tenant updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Update failed");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this tenant permanently? All data will be lost.")) return;
    try {
      const res = await fetch(`/api/tenants/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard/tenants");
    } catch {
      setError("Delete failed.");
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-6 h-6 border-3 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h3 className="text-base font-semibold mb-1">Tenant not found</h3>
        <Link href="/dashboard/tenants" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline mt-4">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{tenant.name}</h1>
          <p className="font-mono text-xs text-[var(--text-muted)]">{tenant.slug} &mdash; {tenant.id}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDelete} className="inline-flex items-center h-9 px-4 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors cursor-pointer">
            Delete Tenant
          </button>
          <Link href="/dashboard/tenants" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings form - full width */}
        <form onSubmit={handleSave} className="lg:col-span-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <span className="text-sm font-semibold">Tenant Settings</span>
            <button
              type="submit"
              className="inline-flex items-center h-7 px-3 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Name</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Plan</label>
                <select
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='%236b7280'%3E%3Cpath d='M2.22 4.47a.75.75 0 011.06 0L6 7.19l2.72-2.72a.75.75 0 011.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L2.22 5.53a.75.75 0 010-1.06z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="BUSINESS">Business</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Status</label>
                <select
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='%236b7280'%3E%3Cpath d='M2.22 4.47a.75.75 0 011.06 0L6 7.19l2.72-2.72a.75.75 0 011.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L2.22 5.53a.75.75 0 010-1.06z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Webhook URL</label>
                <input
                  type="url"
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="https://..."
                  value={editWebhookUrl}
                  onChange={(e) => setEditWebhookUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Information card */}
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <span className="text-sm font-semibold">Information</span>
          </div>
          <div className="px-5 py-4">
            <DetailRow label="Slug" value={tenant.slug} mono />
            <DetailRow label="Owner ID" value={tenant.ownerId || "\u2014"} mono />
            <DetailRow label="Created" value={fmtDate(tenant.createdAt)} mono />
            <DetailRow label="Updated" value={fmtDate(tenant.updatedAt)} mono />
          </div>
        </div>

        {/* Rate limits card */}
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <span className="text-sm font-semibold">Rate Limits</span>
          </div>
          <div className="px-5 py-4">
            <DetailRow label="Per Minute" value={tenant.rateLimitPerMinute.toLocaleString()} mono />
            <DetailRow label="Per Day" value={tenant.rateLimitPerDay.toLocaleString()} mono />
          </div>
        </div>
      </div>
    </div>
  );
}
