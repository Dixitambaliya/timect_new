"use client";

import { useState, useActionState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { loginAdmin, type LoginResult } from "@/admin/actions/auth";
import { TIMECT_LOGO } from "@/data/storefront";

const initial: LoginResult | null = null;
const HERO =
  "https://res.cloudinary.com/dphscxzb4/image/upload/v1794738506/timect/admin/general/lkjubswku6x0ybptntps.png";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, initial);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="admin-root grid min-h-screen gap-3 p-2 md:p-3 lg:grid-cols-2">
      <div className="relative isolate hidden overflow-hidden rounded-fuse bg-[#2b3342] text-white lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO} alt="" aria-hidden className="img-fill -z-10 scale-150 blur-[90px]" />
        <div className="absolute inset-0 -z-10 bg-[#1a1f2a]/40" />
        <div className="flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TIMECT_LOGO} alt="" className="h-11 w-11 rounded-full bg-white object-contain" />
            <span className="font-chivo text-[24px] font-black uppercase tracking-[0.18em]">Timect</span>
          </div>
          <div className="flex justify-center">
            <div className="relative h-[360px] w-[320px] overflow-hidden rounded-fuse bg-[radial-gradient(circle_at_50%_40%,#fff,#e6eaef_70%)] shadow-[0_40px_80px_rgba(0,0,0,.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO} alt="" className="img-fill object-contain p-6" />
            </div>
          </div>
          <div>
            <p className="text-[40px] font-bold leading-[1.1] text-white">Catalog administration</p>
            <p className="mt-3 max-w-md text-white/80">
              Manage products, collections, storefront content and customer enquiries in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center rounded-fuse bg-[var(--admin-surface)] p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={TIMECT_LOGO} alt="" className="h-10 w-10 rounded-full object-contain" />
            <span className="font-chivo text-[22px] font-black uppercase tracking-[0.18em] text-[var(--admin-heading)]">Timect</span>
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-fuse-md bg-[var(--admin-bg)] text-[var(--admin-heading)]">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-6 text-[34px] font-bold leading-tight">Sign in</h1>
          <p className="mt-2 text-[15px] text-[var(--admin-muted)]">Secure access for authorized staff only.</p>

          <form action={formAction} className="mt-8 space-y-5">
            <div>
              <label className="admin-label" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" autoComplete="username" required className="admin-input !py-4" placeholder="Email" />
            </div>
            <div>
              <label className="admin-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="admin-input !py-4 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] transition-colors hover:text-[var(--admin-heading)] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label
                htmlFor="rememberMe"
                className="flex items-center gap-2.5 cursor-pointer select-none text-[14px] text-[var(--admin-muted)] hover:text-[var(--admin-heading)] transition-colors"
              >
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  value="true"
                  defaultChecked
                  className="h-4 w-4 rounded border-[var(--admin-line)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)] cursor-pointer"
                />
                <span>Remember me (30 days)</span>
              </label>
            </div>

            {state && !state.ok && (
              <p className="rounded-fuse-md bg-[var(--admin-danger-soft)] px-4 py-3 text-sm text-[var(--admin-danger)]" role="alert">
                {state.error}
              </p>
            )}

            <button type="submit" className="admin-btn admin-btn-primary w-full !rounded-fuse !py-4 !text-[16px]" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
