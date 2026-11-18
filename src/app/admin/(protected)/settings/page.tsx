"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";
import Breadcrumbs from "@/admin/components/layout/Breadcrumbs";
import {
  changeAdminPassword,
  getCurrentAdmin,
} from "@/admin/actions/auth";
import type { AdminSession } from "@/admin/lib/session";
import { useToast } from "@/admin/hooks/useToast";
import { adminGetInspectionRestriction, adminSaveInspectionRestriction } from "@/admin/actions/inspection";
import { canWrite } from "@/admin/lib/constants";

export default function SettingsPage() {
  const { success, error } = useToast();
  const [user, setUser] = useState<AdminSession | null>(null);
  const [restriction, setRestriction] = useState<boolean | null>(null);
  const [savingRestriction, setSavingRestriction] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (
      _prev: { ok: boolean; error?: string } | null,
      formData: FormData,
    ) => {
      const res = await changeAdminPassword(formData);
      return res;
    },
    null as { ok: boolean; error?: string } | null,
  );

  useEffect(() => {
    getCurrentAdmin().then(setUser);
    adminGetInspectionRestriction().then(setRestriction).catch(() => error("Failed to load inspection setting"));
  }, [error]);

  async function changeRestriction(enabled: boolean) {
    setSavingRestriction(true);
    try {
      const result = await adminSaveInspectionRestriction(enabled);
      if (!result.ok) error(result.error || "Failed to save inspection setting");
      else {
        setRestriction(enabled);
        success("Inspection setting saved");
      }
    } catch {
      error("Failed to save inspection setting");
    } finally {
      setSavingRestriction(false);
    }
  }

  useEffect(() => {
    if (!state) return;
    if (state.ok) success("Password updated");
    else if (state.error) error(state.error);
  }, [state, success, error]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Settings" },
          ]}
        />
        <h1 className="text-[28px] font-bold leading-tight tracking-tight md:text-[34px]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Account security and storefront controls
        </p>
      </div>

      <div className="admin-card p-6">
        <h2 className="text-sm font-semibold">Storefront inspection shortcuts</h2>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">
          Restrict right-click menus and common developer-tools shortcuts on the storefront. This cannot prevent all inspection or protect public content.
        </p>
        <label className="mt-4 flex items-center gap-3 text-sm">
          <input type="checkbox" checked={restriction === true} disabled={restriction === null || savingRestriction || !user || !canWrite(user.role)} onChange={(event) => changeRestriction(event.target.checked)} />
          Restrict inspection shortcuts
        </label>
        <p className="mt-2 text-xs text-[var(--admin-muted)]">Changes apply when visitors load or refresh a storefront page. The admin panel is unaffected.</p>
      </div>

      <div className="admin-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-accent-soft)]">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Signed in as</h2>
            <p className="text-sm text-[var(--admin-muted)]">
              {user?.fullName || "…"} · {user?.email || "…"}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-[var(--admin-muted)]">
              Role: {user?.role?.replace("_", " ") || "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="admin-card p-6">
        <h2 className="mb-4 text-sm font-semibold">Change password</h2>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="admin-label" htmlFor="currentPassword">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="admin-input"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              className="admin-input"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="confirmPassword">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="admin-input"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Update password
          </button>
        </form>
      </div>

      <div className="admin-card space-y-2 p-6 text-sm text-[var(--admin-muted)]">
        <h2 className="text-sm font-semibold text-[var(--admin-ink)]">
          Environment
        </h2>
        <p>
          Set <code className="text-[var(--admin-ink)]">ADMIN_JWT_SECRET</code>{" "}
          in production. Optional seed vars:{" "}
          <code className="text-[var(--admin-ink)]">ADMIN_SEED_EMAIL</code>,{" "}
          <code className="text-[var(--admin-ink)]">ADMIN_SEED_PASSWORD</code>.
        </p>
        <p>
          Run{" "}
          <code className="text-[var(--admin-ink)]">
            npx tsx src/db/admin-migrate.ts
          </code>{" "}
          to apply non-destructive admin schema updates. Existing product data is preserved.
        </p>
        <p>
          Cloudinary:{" "}
          <code className="text-[var(--admin-ink)]">CLOUDINARY_CLOUD_NAME</code>
          ,{" "}
          <code className="text-[var(--admin-ink)]">CLOUDINARY_API_KEY</code>,{" "}
          <code className="text-[var(--admin-ink)]">CLOUDINARY_API_SECRET</code>
          .
        </p>
      </div>
    </div>
  );
}
