"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
  "Australia/Sydney", "Pacific/Auckland",
];

const LOCALES = [
  "en", "es", "fr", "de", "it", "pt", "ja", "zh", "ko", "hi", "ar", "ru",
];

export default function NewRecipientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [externalId, setExternalId] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [locale, setLocale] = useState("en");
  const [fcmToken, setFcmToken] = useState("");
  const [platform, setPlatform] = useState("WEB");

  const hasContact = !!(email || phone || fcmToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!hasContact) {
      setError("At least one contact method (email, phone, or device token) is required.");
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = { name };
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
      if (externalId) payload.externalId = externalId;
      if (fcmToken) {
        payload.fcmToken = fcmToken;
        payload.platform = platform;
      }
      // metadata with timezone/locale
      payload.metadata = { timezone, locale };

      const res = await fetch("/api/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create recipient.");
        return;
      }

      router.push("/dashboard/recipients");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">New Recipient</h1>
          <p className="text-sm text-[var(--text-muted)]">Add a notification recipient to your tenant</p>
        </div>
        <Link
          href="/dashboard/recipients"
          className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline"
        >
          Back
        </Link>
      </div>

      {/* Error */}
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
          {/* Identity */}
          <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold mb-0.5">Identity</h2>
            <p className="text-xs text-[var(--text-muted)]">Basic information about this recipient</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Name *</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">External ID</label>
                <input
                  type="text"
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="usr_abc123 (optional)"
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] mt-5">
          <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold mb-0.5">Contact Methods</h2>
            <p className="text-xs text-[var(--text-muted)]">At least one contact method is required</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Phone
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <span className="block mt-1 text-[0.65rem] text-[var(--text-muted)]">International format: +[country code][number]</span>
              </div>
            </div>

            {/* Push */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Device Token (FCM / APNs)
                  </span>
                </label>
                <input
                  type="text"
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="Optional push notification token"
                  value={fcmToken}
                  onChange={(e) => setFcmToken(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Platform</label>
                <select
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 outline-none transition-all appearance-none"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  disabled={!fcmToken}
                >
                  <option value="WEB">🌐 Web</option>
                  <option value="ANDROID">🤖 Android</option>
                  <option value="IOS">🍎 iOS</option>
                </select>
              </div>
            </div>

            {/* Contact validation indicator */}
            <div className={`flex items-center gap-2 text-xs ${hasContact ? "text-emerald-400" : "text-amber-400"}`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                {hasContact ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                )}
              </svg>
              {hasContact ? "Contact method provided" : "At least one contact method required"}
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] mt-5">
          <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold mb-0.5">Localization</h2>
            <p className="text-xs text-[var(--text-muted)]">Timezone and locale for quiet hours and content translation</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Timezone</label>
                <select
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 outline-none transition-all appearance-none"
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
                  className="w-full h-10 px-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm focus:border-blue-500 outline-none transition-all appearance-none"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                >
                  {LOCALES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-5">
          <Link
            href="/dashboard/recipients"
            className="inline-flex items-center h-9 px-4 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors no-underline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            disabled={loading || !name || !hasContact}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : "Create Recipient"}
          </button>
        </div>
      </form>
    </div>
  );
}
