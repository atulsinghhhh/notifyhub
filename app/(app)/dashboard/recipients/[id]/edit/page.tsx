"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
};

const TIMEZONES = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver",
    "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin",
    "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
    "Australia/Sydney", "Pacific/Auckland",
];

const LOCALES = [
    "en", "es", "fr", "de", "it", "pt", "ja", "zh", "ko", "hi", "ar", "ru",
];

export default function EditRecipientPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [timezone, setTimezone] = useState("UTC");
    const [locale, setLocale] = useState("en");
    const [externalId, setExternalId] = useState("");
    const [metadata, setMetadata] = useState("{}");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/recipients/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    const r = data.recipient;
                    setName(r.name || "");
                    setEmail(r.email || "");
                    setPhone(r.phone || "");
                    setTimezone(r.timezone || "UTC");
                    setLocale(r.locale || "en");
                    setExternalId(r.externalId || "");
                    setMetadata(r.metadata ? JSON.stringify(r.metadata, null, 2) : "{}");
                }
            } catch (err) {
                console.error("Failed to load recipient:", err);
                setError("Failed to load recipient data.");
            } finally {
                setLoading(false);
            }
        }
        if (id) load();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        let parsedMeta: Record<string, unknown> | undefined;
        try {
            parsedMeta = JSON.parse(metadata);
        } catch {
            setError("Metadata must be valid JSON.");
            setSaving(false);
            return;
        }

        try {
            const res = await fetch(`/api/recipients/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name || undefined,
                    email: email || undefined,
                    phone: phone || undefined,
                    timezone,
                    locale,
                    metadata: parsedMeta,
                }),
            });

            if (res.ok) {
                setSuccess("Recipient updated successfully.");
                setTimeout(() => router.push(`/dashboard/recipients/${id}`), 1200);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update recipient.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setSaving(false);
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
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Edit Recipient</h1>
                    <p className="font-mono text-xs text-[var(--text-muted)]">{id}</p>
                </div>
                <Link
                    href={`/dashboard/recipients/${id}`}
                    className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline"
                >
                    Cancel
                </Link>
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

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
                    <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                        <h2 className="text-sm font-semibold mb-0.5">Contact Details</h2>
                        <p className="text-xs text-[var(--text-muted)]">Update recipient information</p>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Name + External ID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Name</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">External ID</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    placeholder="usr_abc123"
                                    value={externalId}
                                    onChange={(e) => setExternalId(e.target.value)}
                                    disabled
                                />
                                <span className="block mt-1 text-[0.65rem] text-[var(--text-muted)]">External ID cannot be changed after creation</span>
                            </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Email</label>
                                <input
                                    type="email"
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Phone</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    placeholder="+1 555 123 4567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Timezone & Locale */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Timezone</label>
                                <select
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                >
                                    {TIMEZONES.map((tz) => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Locale</label>
                                <select
                                    className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                                    value={locale}
                                    onChange={(e) => setLocale(e.target.value)}
                                >
                                    {LOCALES.map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Metadata (JSON)</label>
                            <textarea
                                className="w-full min-h-[120px] p-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm font-mono leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-y"
                                placeholder='{"plan": "pro", "region": "us-east"}'
                                value={metadata}
                                onChange={(e) => setMetadata(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
                        <Link
                            href={`/dashboard/recipients/${id}`}
                            className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            disabled={saving}
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
