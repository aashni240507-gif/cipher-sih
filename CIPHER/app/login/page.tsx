"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import ConstellationCanvas from "@/components/ConstellationCanvas";
import WireframeSphereCanvas from "@/components/WireframeSphereCanvas";
import { useAuth } from "@/components/AuthProvider";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("analyst.sharma@cipher.intel");
  const [password, setPassword] = useState("cipher-classified-pass");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefetch operational portal routes on mount for instant transition
  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/portal");

    // Restore remembered identifier if saved previously
    try {
      const savedUser = localStorage.getItem("cipher_remember_identifier");
      if (savedUser) {
        setIdentifier(savedUser);
      }
    } catch (_) {}
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Guard against accidental duplicate submission

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier) {
      setError("Username or email is required.");
      return;
    }

    if (!cleanPassword) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    setError(null);

    // Save/clear remembered identifier (strictly no passwords)
    try {
      if (rememberMe) {
        localStorage.setItem("cipher_remember_identifier", cleanIdentifier);
      } else {
        localStorage.removeItem("cipher_remember_identifier");
      }
    } catch (_) {}

    try {
      const result = await login(cleanIdentifier, cleanPassword);

      if (result.success) {
        // Resolve target destination: search param redirect or /dashboard
        const redirectParam = searchParams.get("redirect");
        const destination =
          redirectParam && redirectParam.startsWith("/") && redirectParam !== "/login"
            ? redirectParam
            : "/dashboard";

        // Immediate client-side transition
        router.replace(destination);
        return;
      }

      // Handle expected authentication failure
      setError(result.error || "Invalid credentials. Please verify your email and password.");
      setLoading(false);
    } catch (err: any) {
      setError(err?.message || "Authentication service unavailable. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex items-center justify-center relative p-4 bg-[#05080e] bg-network-glow overflow-hidden select-none">
      {/* Background decorative constellation and points */}
      <div className="fixed inset-0 pointer-events-none digital-overlay opacity-30 z-0" />
      <ConstellationCanvas className="fixed inset-0 pointer-events-none z-0" />

      {/* Main Authentication Card */}
      <main className="relative z-10 w-full max-w-[890px] rounded-3xl bg-[#0d141f]/95 border border-[#1e2a3b] shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        {/* Left Login Form Section */}
        <section className="flex-1 p-8 sm:p-12 flex flex-col justify-between">
          {/* Brand Header */}
          <div className="space-y-6">
            <header className="text-center sm:text-left flex flex-col items-center sm:items-start">
              {/* Logo Icon */}
              <div className="flex items-center gap-3">
                <div
                  aria-label="CIPHER Logo"
                  className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-red-950/40 border border-red-500/40 shadow"
                >
                  <svg
                    className="w-7 h-7 text-[#FF453A]"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" fill="rgba(255, 69, 58, 0.2)" r="3" stroke="currentColor" />
                    <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                    <path d="m4.93 4.93 2.12 2.12m9.9 9.9 2.12 2.12M4.93 19.07l2.12-2.12m9.9-9.9 2.12-2.12" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeDasharray="2 3" />
                  </svg>
                </div>
                <span className="text-2xl font-bold tracking-widest text-white uppercase font-sans">
                  CIPHER
                </span>
              </div>
              <p className="text-[10px] tracking-[0.22em] text-[#8e9cb0] uppercase font-medium mt-1">
                AI-Powered Criminal Network Analysis System
              </p>
            </header>

            {/* Titles */}
            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-[#8292a6] mt-1.5 font-normal">
                Sign in to access the CIPHER platform
              </p>
            </div>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4 my-8">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300 font-mono animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username/Email Field */}
            <div className="space-y-1">
              <div className="relative flex items-center bg-[#131d2b] border border-[#213044] rounded-xl px-3.5 py-3 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50">
                <User className="w-5 h-5 text-[#6c7d93] shrink-0 mr-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username / Email"
                  required
                  className="bg-transparent w-full text-sm text-gray-200 placeholder-[#5f7085] focus:outline-none border-none p-0"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="relative flex items-center bg-[#131d2b] border border-[#213044] rounded-xl px-3.5 py-3 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50">
                <Lock className="w-5 h-5 text-[#6c7d93] shrink-0 mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="bg-transparent w-full text-sm text-gray-200 placeholder-[#5f7085] focus:outline-none border-none p-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#6c7d93] hover:text-gray-300 focus:outline-none ml-2"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-[#FF453A]" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 pb-2 text-xs">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#131d2b] border-[#213044] text-[#FF453A] focus:ring-0 cursor-pointer"
                />
                <span className="text-[#8091a5] group-hover:text-gray-300 transition">
                  Remember me
                </span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact agency IT security to request token reset.");
                }}
                className="text-[#3b82f6] hover:text-blue-400 font-normal transition underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-red-glow text-white py-3 px-4 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Credential...</span>
                </>
              ) : (
                <>
                  <span>Login to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Help Info */}
          <footer className="text-center text-xs text-[#6e7e92] pt-4">
            <span>Don't have an account?</span>
            <span className="text-gray-300 ml-1 font-medium">
              Contact Administrator (Auth L3)
            </span>
          </footer>
        </section>

        {/* Right Wireframe Globe Section */}
        <aside className="relative hidden md:flex flex-col items-center justify-center w-[340px] lg:w-[380px] border-l border-[#1b2636] bg-[#0a0f18]/80 p-8 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute w-56 h-56 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
            {/* Quote */}
            <div className="text-center mb-6">
              <p className="text-slate-300 text-lg font-serif italic tracking-wide leading-relaxed">
                &ldquo;Better insights.
              </p>
              <p className="text-slate-300 text-lg font-serif italic tracking-wide leading-relaxed">
                Safer communities.&rdquo;
              </p>
            </div>

            {/* Interactive 3D Wireframe Globe */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <WireframeSphereCanvas width={260} height={260} />
            </div>

            {/* System Encryption Status */}
            <div className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full bg-[#111c2e] border border-[#1b2c45] text-[10px] font-mono text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 / E2E ENCRYPTED</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05080e]" />}>
      <LoginContent />
    </Suspense>
  );
}
