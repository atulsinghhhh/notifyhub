"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Device = {
    id: string;
    token: string;
    platform: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
};

const PLATFORMS = ["IOS", "ANDROID", "WEB"] as const;

export default function RecipientDevicesPage() {
    const { id } = useParams<{ id: string }>();

    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Add device form
    const [showAdd, setShowAdd] = useState(false);
    const [newToken, setNewToken] = useState("");
    const [newPlatform, setNewPlatform] = useState<string>("WEB");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadDevices();
    }, [id]);

    async function loadDevices() {
        try {
            const res = await fetch(`/api/recipients/${id}/devices`);
            if (res.ok) {
                const data = await res.json();
                setDevices(data.devices || []);
            }
        } catch (err) {
            console.error("Failed to load devices:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/recipients/${id}/devices`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: newToken, platform: newPlatform }),
            });

            if (res.ok) {
                setSuccess("Device token registered.");
                setShowAdd(false);
                setNewToken("");
                await loadDevices();
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to register device.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (device: Device) => {
        setDeleting(device.id);
        setError("");

        try {
            const res = await fetch(`/api/recipients/${id}/devices`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: device.token }),
            });

            if (res.ok) {
                setDevices((prev) => prev.filter((d) => d.id !== device.id));
                setSuccess("Device token removed.");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to remove device.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setDeleting(null);
        }
    };

    const fmtDate = (d: string) =>
        new Date(d).toLocaleString("en-US", {
            month: "short", day: "numeric", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });

    const platformIcon = (p: string) => {
        switch (p) {
            case "IOS": return "🍎";
            case "ANDROID": return "🤖";
            case "WEB": return "🌐";
            default: return "📱";
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
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Device Tokens</h1>
                    <p className="font-mono text-xs text-[var(--text-muted)]">{id}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Register Device
                    </button>
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

            {/* Add Device Form */}
            {showAdd && (
                <div className="rounded-lg border border-blue-500/30 bg-[var(--bg-card)] mb-6">
                    <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
                        <h3 className="text-sm font-semibold">Register Device Token</h3>
                    </div>
                    <form onSubmit={handleAdd} className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Token *</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    placeholder="FCM or APNs device token..."
                                    value={newToken}
                                    onChange={(e) => setNewToken(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Platform</label>
                                <select
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 outline-none transition-all appearance-none"
                                    value={newPlatform}
                                    onChange={(e) => setNewPlatform(e.target.value)}
                                >
                                    {PLATFORMS.map((p) => (
                                        <option key={p} value={p}>{platformIcon(p)} {p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setShowAdd(false); setNewToken(""); }}
                                className="h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={adding || !newToken}
                                className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {adding ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Registering...
                                    </>
                                ) : "Register"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Devices List */}
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
                {devices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <svg className="w-10 h-10 text-[var(--text-muted)] mb-3 opacity-40" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 16.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" />
                            <path fillRule="evenodd" d="M4 4a3 3 0 013-3h6a3 3 0 013 3v12a3 3 0 01-3 3H7a3 3 0 01-3-3V4zm3-1.5A1.5 1.5 0 005.5 4v12A1.5 1.5 0 007 17.5h6a1.5 1.5 0 001.5-1.5V4A1.5 1.5 0 0013 2.5H7z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-[var(--text-muted)] mb-1">No device tokens registered</p>
                        <p className="text-xs text-[var(--text-muted)] opacity-60">Register a device to enable push notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border-subtle)]">
                        {devices.map((device) => (
                            <div key={device.id} className="flex items-center justify-between px-5 py-4 gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Platform icon */}
                                    <span className="text-xl shrink-0">{platformIcon(device.platform)}</span>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-semibold uppercase bg-blue-500/10 text-blue-400">
                                                {device.platform}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.6rem] font-semibold uppercase ${device.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                                }`}>
                                                {device.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className="font-mono text-xs text-[var(--text-muted)] truncate max-w-[400px]">
                                            {device.token}
                                        </p>
                                        <p className="font-mono text-[0.65rem] text-[var(--text-muted)] opacity-60 mt-0.5">
                                            Registered {fmtDate(device.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={() => handleDelete(device)}
                                    disabled={deleting === device.id}
                                    className="inline-flex items-center gap-1 h-8 px-3 rounded-md text-xs text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                    {deleting === device.id ? (
                                        <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary */}
            {devices.length > 0 && (
                <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-muted)]">
                    <span>{devices.length} device{devices.length !== 1 ? "s" : ""} registered</span>
                    <span>·</span>
                    <span>{devices.filter((d) => d.isActive).length} active</span>
                    <span>·</span>
                    <span>{devices.filter((d) => !d.isActive).length} inactive</span>
                </div>
            )}
        </div>
    );
}
