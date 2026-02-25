"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Link from "next/link";

type LoginFormValues = {
    email: string;
    password: string;
};

function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>();
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setServerError("");
            const res = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (!res?.ok) {
                setServerError(res?.error || "Invalid credentials");
                return;
            }

            window.location.href = "/dashboard";
        } catch {
            setServerError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* ── Left: Branding ── */}
                <div className="auth-brand-panel">
                    <div>
                        <div className="auth-logo">
                            <div className="auth-logo-mark">N</div>
                            <span className="auth-logo-text">NotifyHub</span>
                        </div>
                        <h1 className="auth-brand-title">
                            Notification<br />Infrastructure
                        </h1>
                        <p className="auth-brand-desc">
                            Multi-channel delivery engine for Email, SMS, and Push.
                            Built for scale, reliability, and observability.
                        </p>
                        <div className="auth-brand-stats">
                            <div className="auth-stat">
                                <span className="auth-stat-value">99.9%</span>
                                <span className="auth-stat-label">Uptime</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-value">{"<"}50ms</span>
                                <span className="auth-stat-label">Latency</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-value">10M+</span>
                                <span className="auth-stat-label">Msgs/day</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Form ── */}
                <div className="auth-form-panel">
                    <div>
                        <div className="auth-form-header">
                            <h2 className="auth-form-title">Sign in</h2>
                            <p className="auth-form-subtitle">
                                Access your notification control center
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                            <div className="auth-field">
                                <label htmlFor="email" className="auth-label">Email</label>
                                <div className="auth-input-wrapper">
                                    <svg className="auth-input-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                                        <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                                    </svg>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="you@company.com"
                                        className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Enter a valid email",
                                            },
                                        })}
                                    />
                                </div>
                                {errors.email && <p className="auth-error">{errors.email.message}</p>}
                            </div>

                            <div className="auth-field">
                                <label htmlFor="password" className="auth-label">Password</label>
                                <div className="auth-input-wrapper">
                                    <svg className="auth-input-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="••••••••"
                                        className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
                                        {...register("password", {
                                            required: "Password is required",
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="auth-toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z" clipRule="evenodd" /><path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" /></svg>
                                        ) : (
                                            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className="auth-error">{errors.password.message}</p>}
                            </div>

                            {serverError && (
                                <div className="auth-server-error">
                                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    {serverError}
                                </div>
                            )}

                            <button type="submit" disabled={isSubmitting} className="auth-submit">
                                {isSubmitting ? (
                                    <><span className="auth-spinner" /> Signing in…</>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="auth-switch-link">Create account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;