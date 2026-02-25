"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");

  const [name, setName] = useState("");
  const [plan, setPlan] = useState("FREE");
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setApiKey("");

    try {
      const payload: Record<string, unknown> = { name };
      if (plan !== "FREE") payload.plan = plan;
      if (webhookUrl) payload.webhookUrl = webhookUrl;

      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create tenant");
        return;
      }

      if (data.apiKey) {
        setApiKey(data.apiKey);
      } else {
        router.push("/dashboard/tenants");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (apiKey) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Tenant Created</h1>
          <p className="text-sm text-[var(--text-muted)]">Save your API key &mdash; it won&apos;t be shown again</p>
        </div>

        <div className="max-w-[640px] rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <span className="text-sm font-semibold">API Key</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              This is your only chance to copy this key. Store it securely.
            </div>
            <div className="p-4 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg font-mono text-sm break-all select-all">
              {apiKey}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => navigator.clipboard.writeText(apiKey)}
                className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                Copy to clipboard
              </button>
              <Link href="/dashboard/tenants" className="inline-flex items-center h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors no-underline">
                Go to Tenants
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">New Tenant</h1>
          <p className="text-sm text-[var(--text-muted)]">Create a new organization for sending notifications</p>
        </div>
        <Link href="/dashboard/tenants" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
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
            <h2 className="text-sm font-semibold mb-0.5">Organization Details</h2>
            <p className="text-xs text-[var(--text-muted)]">A unique slug and API key will be auto-generated</p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Tenant Name *</label>
              <input
                type="text"
                className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                placeholder="e.g. Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Plan</label>
                <select
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='%236b7280'%3E%3Cpath d='M2.22 4.47a.75.75 0 011.06 0L6 7.19l2.72-2.72a.75.75 0 011.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L2.22 5.53a.75.75 0 010-1.06z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                >
                  <option value="FREE">Free</option>
                  <option value="STARTER">Starter</option>
                  <option value="BUSINESS">Business</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Webhook URL</label>
                <input
                  type="url"
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="https://your-app.com/webhooks"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <span className="block mt-1 text-[0.7rem] text-[var(--text-muted)]">Receive delivery status callbacks</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
            <Link href="/dashboard/tenants" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              disabled={loading || !name}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : "Create Tenant"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
