"use client";

import { useEffect, useState } from "react";

type ApiKeyItem = {
  id: string;
  name: string;
  prefix: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  scopes: string[];
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
};

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [latestRawKey, setLatestRawKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadApiKeys();
  }, []);

  async function loadApiKeys() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load API keys");
      }

      setApiKeys(data.apiKeys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName.trim() || "API Key",
          scopes: ["notifications:send"],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create API key");
      }

      setLatestRawKey(data.rawApiKey || null);
      setNewKeyName("");
      await loadApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    const ok = confirm("Revoke this API key? This action cannot be undone.");
    if (!ok) return;

    setRevokingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to revoke API key");
      }

      setApiKeys((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "REVOKED" } : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke API key");
    } finally {
      setRevokingId(null);
    }
  }

  async function copyRawKey() {
    if (!latestRawKey) return;
    await navigator.clipboard.writeText(latestRawKey);
  }

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">API Keys</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage tenant API keys used for server-to-server requests.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {latestRawKey ? (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-amber-200 mb-1">New key created</h2>
              <p className="text-xs text-amber-100/80 mb-2">
                Save this key now. You won&apos;t be able to view it again.
              </p>
              <div className="font-mono text-xs sm:text-sm break-all bg-black/30 border border-amber-500/20 rounded px-3 py-2 text-amber-100">
                {latestRawKey}
              </div>
            </div>
            <button
              onClick={copyRawKey}
              className="inline-flex items-center h-8 px-3 rounded-md text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">Create API Key</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. CI Integration)"
            className="flex-1 h-10 px-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-default)] text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? "Creating..." : "Create Key"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-[220px]">
            <div className="w-6 h-6 border-3 border-[var(--border-default)] border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="py-14 text-center">
            <h3 className="text-sm font-semibold mb-1">No API keys yet</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Create your first API key to authenticate API requests.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Name</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Prefix</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Status</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Scopes</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Last Used</th>
                  <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Created</th>
                  <th className="px-4 py-2.5 bg-[var(--bg-surface)]" />
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">
                      {item.prefix}...
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[0.7rem] font-medium ${
                          item.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      {item.scopes.join(", ")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">
                      {formatDate(item.lastUsedAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === "ACTIVE" ? (
                        <button
                          onClick={() => handleRevoke(item.id)}
                          disabled={revokingId === item.id}
                          className="inline-flex items-center h-7 px-3 rounded-md text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {revokingId === item.id ? "Revoking..." : "Revoke"}
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">—</span>
                      )}
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
