"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Preference = {
    id: string;
    channel: string;
    enabled: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
};

const CHANNELS = ["EMAIL", "SMS", "PUSH"] as const;

export default function RecipientPreferencesPage() {
    const { id } = useParams<{ id: string }>();

    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // New preference form
    const [showAdd, setShowAdd] = useState(false);
    const [newChannel, setNewChannel] = useState<string>("EMAIL");
    const [newEnabled, setNewEnabled] = useState(true);
    const [newQuietStart, setNewQuietStart] = useState("");
    const [newQuietEnd, setNewQuietEnd] = useState("");

    useEffect(() => {
        loadPreferences();
    }, [id]);

    async function loadPreferences() {
        try {
            const res = await fetch(`/api/recipients/${id}/preferences`);
            if (res.ok) {
                const data = await res.json();
                setPreferences(data.preferences || []);
            }
        } catch (err) {
            console.error("Failed to load preferences:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving("add");
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/recipients/${id}/preferences`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channel: newChannel,
                    enabled: newEnabled,
                    quietHoursStart: newQuietStart || null,
                    quietHoursEnd: newQuietEnd || null,
                }),
            });

            if (res.ok) {
                setSuccess(`Preference for ${newChannel} saved.`);
                setShowAdd(false);
                setNewQuietStart("");
                setNewQuietEnd("");
                await loadPreferences();
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save preference.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setSaving(null);
        }
    };

    const handleToggle = async (pref: Preference) => {
        setSaving(pref.id);
        try {
            const res = await fetch(`/api/recipients/${id}/preferences`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    channel: pref.channel,
                    enabled: !pref.enabled,
                }),
            });
            if (res.ok) {
                setPreferences((prev) =>
                    prev.map((p) => (p.id === pref.id ? { ...p, enabled: !p.enabled } : p))
                );
            }
        } catch {
            setError("Failed to toggle preference.");
        } finally {
            setSaving(null);
        }
    };

    const handleDelete = async (pref: Preference) => {
        setSaving(pref.id);
        try {
            const res = await fetch(`/api/recipients/${id}/preferences`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channel: pref.channel }),
            });
            if (res.ok) {
                setPreferences((prev) => prev.filter((p) => p.id !== pref.id));
                setSuccess("Preference removed — defaults will apply.");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch {
            setError("Failed to delete preference.");
        } finally {
            setSaving(null);
        }
    };

    const configuredChannels = preferences.map((p) => p.channel);
    const availableChannels = CHANNELS.filter((c) => !configuredChannels.includes(c));

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
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Notification Preferences</h1>
                    <p className="font-mono text-xs text-[var(--text-muted)]">{id}</p>
                </div>
                <div className="flex items-center gap-3">
                    {availableChannels.length > 0 && (
                        <button
                            onClick={() => {
                                setNewChannel(availableChannels[0]);
                                setShowAdd(true);
                            }}
                            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            Add Preference
                        </button>
                    )}
                    <Link
                        href={`/dashboard/recipients/${id}`}
                        className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline"
                    >
                        Back
                    </Link>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    {success}
                </div>
            )}

            {/* Add Preference Form */}
            {showAdd && (
                <div className="rounded-lg border border-blue-500/30 bg-[var(--bg-card)] mb-6">
                    <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
                        <h3 className="text-sm font-semibold">Add Channel Preference</h3>
                    </div>
                    <form onSubmit={handleAdd} className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Channel</label>
                                <select
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 outline-none transition-all appearance-none"
                                    value={newChannel}
                                    onChange={(e) => setNewChannel(e.target.value)}
                                >
                                    {availableChannels.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Quiet Hours Start</label>
                                <input
                                    type="time"
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm font-mono focus:border-blue-500 outline-none transition-all"
                                    value={newQuietStart}
                                    onChange={(e) => setNewQuietStart(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Quiet Hours End</label>
                                <input
                                    type="time"
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm font-mono focus:border-blue-500 outline-none transition-all"
                                    value={newQuietEnd}
                                    onChange={(e) => setNewQuietEnd(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newEnabled}
                                    onChange={(e) => setNewEnabled(e.target.checked)}
                                    className="w-4 h-4 rounded accent-blue-500"
                                />
                                <span className="text-sm text-[var(--text-secondary)]">Enabled</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAdd(false)}
                                className="h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving === "add"}
                                className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {saving === "add" ? "Saving..." : "Save Preference"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Preferences List */}
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
                {preferences.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <svg className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-40" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-[var(--text-muted)] mb-1">No preferences configured</p>
                        <p className="text-xs text-[var(--text-muted)] opacity-60">Default notification settings apply to all channels</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {preferences.map((pref) => (
                            <div key={pref.id} className="flex items-center justify-between px-5 py-4">
                                <div className="flex items-center gap-4">
                                    {/* Channel badge */}
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 min-w-[60px] justify-center">
                                        {pref.channel}
                                    </span>

                                    {/* Status */}
                                    <button
                                        onClick={() => handleToggle(pref)}
                                        disabled={saving === pref.id}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${pref.enabled ? "bg-emerald-500" : "bg-[var(--border-default)]"
                                            }`}
                                    >
                                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${pref.enabled ? "translate-x-[18px]" : "translate-x-[3px]"
                                            }`} />
                                    </button>
                                    <span className={`text-xs font-mono uppercase ${pref.enabled ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                                        {pref.enabled ? "Enabled" : "Disabled"}
                                    </span>

                                    {/* Quiet hours */}
                                    {pref.quietHoursStart && pref.quietHoursEnd && (
                                        <span className="text-xs text-[var(--text-muted)] font-mono">
                                            🌙 {pref.quietHoursStart}–{pref.quietHoursEnd}
                                        </span>
                                    )}
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(pref)}
                                    disabled={saving === pref.id}
                                    className="inline-flex items-center h-7 px-2.5 rounded-md text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
