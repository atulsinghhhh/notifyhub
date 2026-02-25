"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";

type SignupFormValues = {
    email: string;
    password: string;
    confirmPassword: string;
};

function SignupPage() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormValues>();

    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const passwordVal = watch("password");

    const onSubmit = async (data: SignupFormValues) => {
        try {
            setServerError("");
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setServerError(result.error || "Signup failed");
                return;
            }

            setSuccess(true);
        } catch {
            setServerError("Something went wrong. Please try again.");
        }
    };

    const getPasswordStrength = (pw: string | undefined): { score: number; label: string; color: string } => {
        if (!pw) return { score: 0, label: "", color: "" };
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        const labels = ["", "Weak", "Fair", "Good", "Strong"];
        const colors = ["", "#ef4444", "#f59e0b", "#22d3ee", "#22c55e"];
        return { score: s, label: labels[s], color: colors[s] };
    };

    const strength = getPasswordStrength(passwordVal);

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-success-card">
                    <div className="auth-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="auth-success-title">Account Created</h2>
                    <p className="auth-success-desc">
                        Your account has been created successfully. Sign in to access the console.
                    </p>
                    <Link href="/login" className="auth-submit" style={{ textDecoration: "none", display: "flex", justifyContent: "center" }}>
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

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
                            Build Once,<br />Deliver Everywhere
                        </h1>
                        <p className="auth-brand-desc">
                            A single API for Email, SMS, and Push notifications.
                            Templates, analytics, retry logic — all managed.
                        </p>
                        <div className="auth-brand-stats">
                            <div className="auth-stat">
                                <span className="auth-stat-value">3</span>
                                <span className="auth-stat-label">Channels</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-value">Auto</span>
                                <span className="auth-stat-label">Retry</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-value">Live</span>
                                <span className="auth-stat-label">Analytics</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Form ── */}
                <div className="auth-form-panel">
                    <div>
                        <div className="auth-form-header">
                            <h2 className="auth-form-title">Create account</h2>
                            <p className="auth-form-subtitle">
                                Set up your notification engine in minutes
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
                                            minLength: { value: 8, message: "Min 8 characters" },
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
                                {/* Strength meter */}
                                {passwordVal && (
                                    <>
                                        <div className="auth-strength-bar">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="auth-strength-segment"
                                                    style={{ background: i <= strength.score ? strength.color : undefined }}
                                                />
                                            ))}
                                        </div>
                                        <div className="auth-strength-label" style={{ color: strength.color }}>
                                            {strength.label}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="auth-field">
                                <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
                                <div className="auth-input-wrapper">
                                    <svg className="auth-input-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        className={`auth-input ${errors.confirmPassword ? "auth-input--error" : ""}`}
                                        {...register("confirmPassword", {
                                            required: "Please confirm your password",
                                            validate: (val) =>
                                                val === passwordVal || "Passwords do not match",
                                        })}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword.message}</p>}
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
                                    <><span className="auth-spinner" /> Creating account…</>
                                ) : (
                                    "Create account"
                                )}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Already have an account?{" "}
                            <Link href="/login" className="auth-switch-link">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;