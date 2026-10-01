"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { loginAdmin, type LoginResult } from "@/admin/actions/auth";
import { TIMECT_LOGO } from "@/data/storefront";

const initial: LoginResult | null = null;
const HERO =
  "https://res.cloudinary.com/dphscxzb4/image/upload/f_auto,q_auto,w_1400/v1784048474/timect/image_4.png";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, initial);

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
              <input id="email" name="email" type="email" autoComplete="username" required className="admin-input !py-4" placeholder="admin@timect.com" />
            </div>
            <div>
              <label className="admin-label" htmlFor="password">
                Password
              </label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="admin-input !py-4" placeholder="••••••••" />
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

          <p className="mt-8 text-[12px] text-[var(--admin-muted)]">Protected by JWT session · Credentials stored with bcrypt</p>
        </div>
      </div>
    </div>
  );
}
