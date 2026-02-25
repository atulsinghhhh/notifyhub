"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    {
        section: "Overview",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: "grid" },
            { label: "Analytics", href: "/dashboard/analytics", icon: "chart" },
        ],
    },
    {
        section: "Messaging",
        items: [
            { label: "Notifications", href: "/dashboard/notifications", icon: "bell" },
            { label: "Templates", href: "/dashboard/templates", icon: "doc" },
        ],
    },
    {
        section: "Management",
        items: [
            { label: "Recipients", href: "/dashboard/recipients", icon: "users" },
            { label: "Tenants", href: "/dashboard/tenants", icon: "building" },
        ],
    },
    {
        section: "Settings",
        items: [
            { label: "API Keys", href: "/dashboard/api-keys", icon: "key" },
        ],
    },
];

function NavIcon({ name }: { name: string }) {
    const icons: Record<string, React.ReactNode> = {
        grid: (
            <svg viewBox="0 0 20 20" fill="currentColor" className="dash-nav-icon">
                <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" />
            </svg>
        ),
        chart: (
            <svg viewBox="0 0 20 20" fill="currentColor" className="dash-nav-icon">
                <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
            </svg>
        ),
        bell: (
            <svg viewBox="0 0 20 20" fill="currentColor" className="dash-nav-icon">
                <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z" clipRule="evenodd" />
            </svg>
        ),
        doc: (
            <svg viewBox="0 0 20 20" fill="currentColor" className="dash-nav-icon">
                <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
            </svg>
        ),
        users: (
            <svg viewBox="0 0 20 20" fill="currentColor" className="dash-nav-icon">
                <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
            </svg>
        ),
        building: (
            <svg viewBox="0 0 20 20" fill="currentColor" className="dash-nav-icon">
                <path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 010-1.5h12.5a.75.75 0 010 1.5H16v13h.25a.75.75 0 010 1.5H3.75a.75.75 0 010-1.5H4zm3-11a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm.5 3.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1zm3.5-4a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm.5 3.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1zm-2 5a1 1 0 011-1h1a1 1 0 011 1v3h-3v-3z" clipRule="evenodd" />
            </svg>
        ),
        key: (
            <svg viewBox="0 0 20 20" fill="currentColor" className="dash-nav-icon">
                <path fillRule="evenodd" d="M8 7a5 5 0 113.61 4.804l-1.903 1.903A1 1 0 019 14H8v1a1 1 0 01-1 1H6v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a1 1 0 01.293-.707L8.196 8.39A5.002 5.002 0 018 7zm5-3a.75.75 0 000 1.5A1.5 1.5 0 0114.5 7 .75.75 0 0016 7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
        ),
    };
    return icons[name] || null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="dash-layout">
            {/* ── Overlay (mobile) ── */}
            <div
                className={`dash-overlay ${sidebarOpen ? "dash-overlay--visible" : ""}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* ── Sidebar ── */}
            <aside className={`dash-sidebar ${sidebarOpen ? "dash-sidebar--open" : ""}`}>
                <div className="dash-sidebar-header">
                    <Link href="/dashboard" className="dash-sidebar-logo">
                        <div className="dash-sidebar-logo-mark">N</div>
                        <span className="dash-sidebar-logo-text">NotifyHub</span>
                    </Link>
                </div>

                <nav className="dash-sidebar-nav">
                    {NAV_ITEMS.map((section) => (
                        <div className="dash-nav-section" key={section.section}>
                            <div className="dash-nav-section-label">{section.section}</div>
                            {section.items.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`dash-nav-link ${isActive ? "dash-nav-link--active" : ""}`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <NavIcon name={item.icon} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="dash-sidebar-footer">
                    <Link href="/login" className="dash-nav-link" style={{ color: "var(--text-muted)" }}>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="dash-nav-icon">
                            <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                        </svg>
                        Sign out
                    </Link>
                </div>
            </aside>

            {/* ── Top bar ── */}
            <header className="dash-topbar">
                <div className="dash-topbar-left">
                    <button
                        className="dash-sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <span className="dash-topbar-title">Control Center</span>
                </div>
                <div className="dash-topbar-right">
                    <button className="dash-topbar-btn" title="Notifications">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <div className="dash-avatar">AT</div>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="dash-main">
                {children}
            </main>
        </div>
    );
}
