"use client";

import { useEffect, useState } from "react";

type Summary = {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalBounced: number;
    totalOpened: number;
    totalClicked: number;
    deliveryRate: string;
    failureRate: string;
};

type ChannelData = {
    channel: string;
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: string;
};

type ActivityItem = {
    id: string;
    type: "sent" | "failed" | "queued";
    text: string;
    time: string;
};

export default function DashboardPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [channels, setChannels] = useState<ChannelData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [sumRes, chRes] = await Promise.all([
                    fetch("/api/analytics/summary?days=30"),
                    fetch("/api/analytics/channels?days=30"),
                ]);

                if (sumRes.ok) {
                    const data = await sumRes.json();
                    setSummary(data);
                }
                if (chRes.ok) {
                    const data = await chRes.json();
                    setChannels(data.channels || []);
                }
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Placeholder activity until we wire up real-time
    const activity: ActivityItem[] = [
        { id: "1", type: "sent", text: "Email delivered to user@example.com", time: "2m ago" },
        { id: "2", type: "sent", text: "SMS sent to +1 (555) 012-3456", time: "5m ago" },
        { id: "3", type: "failed", text: "Push failed — device token expired", time: "8m ago" },
        { id: "4", type: "queued", text: "Bulk batch (250 emails) queued", time: "12m ago" },
        { id: "5", type: "sent", text: "Email delivered to ops@acme.co", time: "15m ago" },
    ];

    const maxChannelSent = Math.max(...channels.map((c) => c.totalSent), 1);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
                <div className="auth-spinner" style={{ width: 24, height: 24, borderWidth: 3, borderColor: "var(--border-default)", borderTopColor: "var(--accent)" }} />
            </div>
        );
    }

    return (
        <div>
            {/* ── Page header ── */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>
                    Dashboard
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Last 30 days — notification delivery overview
                </p>
            </div>

            {/* ── Stat cards ── */}
            <div className="stat-grid">
                <div className="stat-card stat-card--blue">
                    <div className="stat-card-label">Total Sent</div>
                    <div className="stat-card-value">{summary?.totalSent?.toLocaleString() ?? "0"}</div>
                </div>
                <div className="stat-card stat-card--green">
                    <div className="stat-card-label">Delivered</div>
                    <div className="stat-card-value">{summary?.totalDelivered?.toLocaleString() ?? "0"}</div>
                    <div className="stat-card-sub">{summary?.deliveryRate ?? "0%"} delivery rate</div>
                </div>
                <div className="stat-card stat-card--red">
                    <div className="stat-card-label">Failed</div>
                    <div className="stat-card-value">{summary?.totalFailed?.toLocaleString() ?? "0"}</div>
                    <div className="stat-card-sub">{summary?.failureRate ?? "0%"} failure rate</div>
                </div>
                <div className="stat-card stat-card--amber">
                    <div className="stat-card-label">Bounced</div>
                    <div className="stat-card-value">{summary?.totalBounced?.toLocaleString() ?? "0"}</div>
                </div>
                <div className="stat-card stat-card--cyan">
                    <div className="stat-card-label">Opened</div>
                    <div className="stat-card-value">{summary?.totalOpened?.toLocaleString() ?? "0"}</div>
                </div>
            </div>

            {/* ── Two-column panels ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Channel breakdown */}
                <div className="dash-panel" style={{ gridColumn: channels.length === 0 ? "1 / -1" : undefined }}>
                    <div className="dash-panel-header">
                        <span className="dash-panel-title">Channel Breakdown</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>30 DAYS</span>
                    </div>
                    <div className="dash-panel-body">
                        {channels.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1rem 0" }}>
                                No channel data yet — send your first notification.
                            </p>
                        ) : (
                            channels.map((ch) => (
                                <div className="channel-row" key={ch.channel}>
                                    <span className="channel-label">{ch.channel}</span>
                                    <div className="channel-bar-track">
                                        <div
                                            className={`channel-bar-fill channel-bar-fill--${ch.channel.toLowerCase()}`}
                                            style={{ width: `${(ch.totalSent / maxChannelSent) * 100}%` }}
                                        />
                                    </div>
                                    <span className="channel-value">{ch.totalSent.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent activity */}
                <div className="dash-panel">
                    <div className="dash-panel-header">
                        <span className="dash-panel-title">Recent Activity</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)" }}>LIVE</span>
                    </div>
                    <div className="dash-panel-body">
                        {activity.map((item) => (
                            <div className="activity-item" key={item.id}>
                                <div className={`activity-dot activity-dot--${item.type}`} />
                                <div>
                                    <div className="activity-text">{item.text}</div>
                                    <div className="activity-time">{item.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
