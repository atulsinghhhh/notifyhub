"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Recipient = {
  id: string;
  externalId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  timezone: string | null;
  locale: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type Preference = {
  id: string;
  channel: string;
  enabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
};

type Device = {
  id: string;
  token: string;
  platform: string;
  isActive: boolean;
  createdAt: string;
};

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-[var(--border-subtle)] last:border-b-0">
      <span className="text-xs text-[var(--text-muted)] shrink-0 min-w-[100px]">{label}</span>
      <span className={`text-sm text-[var(--text-primary)] text-right break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

export default function RecipientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "preferences" | "devices">("info");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTimezone, setEditTimezone] = useState("");
  const [editLocale, setEditLocale] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [rRes, pRes, dRes] = await Promise.all([
          fetch(`/api/recipients/${id}`),
          fetch(`/api/recipients/${id}/preferences`),
          fetch(`/api/recipients/${id}/devices`),
        ]);

        if (rRes.ok) {
          const data = await rRes.json();
          const r = data.recipient;
          setRecipient(r);
          setEditEmail(r.email || "");
          setEditPhone(r.phone || "");
          setEditTimezone(r.timezone || "UTC");
          setEditLocale(r.locale || "en");
        }
        if (pRes.ok) {
          const data = await pRes.json();
          setPreferences(data.preferences || []);
        }
        if (dRes.ok) {
          const data = await dRes.json();
          setDevices(data.devices || []);
        }
      } catch (err) {
        console.error("Failed to load recipient:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`/api/recipients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail || undefined,
          phone: editPhone || undefined,
          timezone: editTimezone,
          locale: editLocale,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecipient(data.recipient);
        setEditing(false);
        setSaveMsg("Saved");
        setTimeout(() => setSaveMsg(""), 2000);
      }
    } catch {
      setSaveMsg("Failed to save.");
    } finally {
      setSaving(false);
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

  if (!recipient) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h3 className="text-base font-semibold mb-1">Recipient not found</h3>
        <Link href="/dashboard/recipients" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline mt-4">
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
          <h1 className="text-2xl font-bold tracking-tight mb-1">{recipient.name || "Unnamed Recipient"}</h1>
          <p className="font-mono text-xs text-[var(--text-muted)]">{recipient.id}</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-xs text-emerald-400">{saveMsg}</span>}
          <Link href="/dashboard/recipients" className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline">
            Back to list
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border-default)] mb-6">
        {(["info", "preferences", "devices"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === t ? "text-blue-500 border-blue-500" : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"
            }`}
          >
            {t === "info" ? "Information" : t === "preferences" ? `Preferences (${preferences.length})` : `Devices (${devices.length})`}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <span className="text-sm font-semibold">Contact Details</span>
            <button
              className={`inline-flex items-center h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                editing
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
              onClick={() => {
                if (editing) handleSave();
                else setEditing(true);
              }}
              disabled={saving}
            >
              {editing ? (saving ? "Saving..." : "Save") : "Edit"}
            </button>
          </div>
          <div className="px-5 py-4">
            <DetailRow label="Name" value={recipient.name || "\u2014"} />
            <div className="flex justify-between items-center py-2.5 border-b border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)] shrink-0 min-w-[100px]">Email</span>
              {editing ? (
                <input
                  type="email"
                  className="max-w-[280px] h-8 px-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md text-xs font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              ) : (
                <span className="text-xs font-mono text-[var(--text-primary)] text-right break-all">{recipient.email || "\u2014"}</span>
              )}
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)] shrink-0 min-w-[100px]">Phone</span>
              {editing ? (
                <input
                  type="text"
                  className="max-w-[280px] h-8 px-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md text-xs font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              ) : (
                <span className="text-xs font-mono text-[var(--text-primary)] text-right break-all">{recipient.phone || "\u2014"}</span>
              )}
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)] shrink-0 min-w-[100px]">Timezone</span>
              {editing ? (
                <input
                  type="text"
                  className="max-w-[280px] h-8 px-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md text-xs font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={editTimezone}
                  onChange={(e) => setEditTimezone(e.target.value)}
                />
              ) : (
                <span className="text-sm text-[var(--text-primary)] text-right">{recipient.timezone || "UTC"}</span>
              )}
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)] shrink-0 min-w-[100px]">Locale</span>
              {editing ? (
                <input
                  type="text"
                  className="max-w-[280px] h-8 px-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-md text-xs font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={editLocale}
                  onChange={(e) => setEditLocale(e.target.value)}
                />
              ) : (
                <span className="text-sm text-[var(--text-primary)] text-right">{recipient.locale || "en"}</span>
              )}
            </div>
            <DetailRow label="External ID" value={recipient.externalId || "\u2014"} mono />
            <DetailRow label="Created" value={fmtDate(recipient.createdAt)} mono />
            <DetailRow label="Updated" value={fmtDate(recipient.updatedAt)} mono />
          </div>
        </div>
      )}

      {tab === "preferences" && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          {preferences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-[var(--text-muted)]">No channel preferences configured. Defaults apply.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Channel</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Enabled</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Quiet Hours Start</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Quiet Hours End</th>
                  </tr>
                </thead>
                <tbody>
                  {preferences.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.7rem] font-medium bg-blue-500/10 text-blue-400">
                          {p.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-medium font-mono uppercase ${
                          p.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {p.enabled ? "ENABLED" : "DISABLED"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{p.quietHoursStart || "\u2014"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{p.quietHoursEnd || "\u2014"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "devices" && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          {devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-[var(--text-muted)]">No device tokens registered for push notifications.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Platform</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Token</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Active</th>
                    <th className="px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-surface)]">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.7rem] font-medium bg-blue-500/10 text-blue-400">
                          {d.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)] max-w-[300px] truncate">{d.token}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-medium font-mono uppercase ${
                          d.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {d.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{fmtDate(d.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
