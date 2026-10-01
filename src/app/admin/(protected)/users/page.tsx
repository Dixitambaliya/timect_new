"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Loader2, Pencil, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/admin/components/layout/Breadcrumbs";
import AdminModal from "@/admin/components/ui/AdminModal";
import ConfirmDialog from "@/admin/components/ui/ConfirmDialog";
import EmptyState from "@/admin/components/ui/EmptyState";
import { useToast } from "@/admin/hooks/useToast";
import { ADMIN_ROLES, type AdminRole } from "@/admin/lib/constants";
import {
  adminCreateUser,
  adminDeleteUser,
  adminListUsers,
  adminUpdateUser,
  type AdminUserRow,
} from "@/admin/actions/users";

type FormState = { id?: number; fullName: string; email: string; role: AdminRole; isActive: boolean; password: string };
const EMPTY: FormState = { fullName: "", email: "", role: "manager", isActive: true, password: "" };

const ROLE_HELP: Record<AdminRole, string> = {
  super_admin: "Full access, including managing other super admins",
  admin: "Full catalog access, can manage team members",
  manager: "Create and edit content, cannot delete or manage team",
  viewer: "Read-only access",
};

function formatDate(iso?: string) {
  if (!iso) return "Never";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function UsersPage() {
  const { success, error } = useToast();
  const [data, setData] = useState<Awaited<ReturnType<typeof adminListUsers>> | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [toDelete, setToDelete] = useState<AdminUserRow | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => setData(await adminListUsers()), []);
  useEffect(() => {
    void load();
  }, [load]);

  const submit = () =>
    startTransition(async () => {
      if (!form) return;
      const res = form.id
        ? await adminUpdateUser(form.id, { fullName: form.fullName, role: form.role, isActive: form.isActive, password: form.password || undefined })
        : await adminCreateUser({ fullName: form.fullName, email: form.email, role: form.role, password: form.password });
      if (res.ok) {
        success(form.id ? "Team member updated" : "Team member created");
        setForm(null);
        await load();
      } else error(res.error);
    });

  const canManage = data?.canManage ?? false;

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Team" }]}
        title="Team"
        description="Admin accounts, roles and access to this panel"
        actions={
          canManage && (
            <button type="button" className="admin-btn admin-btn-primary" onClick={() => setForm({ ...EMPTY })}>
              <Plus className="h-4 w-4" /> Add member
            </button>
          )
        }
      />

      {!canManage && data && (
        <p className="mb-3 rounded-fuse-md bg-[var(--admin-warning-soft)] px-4 py-3 text-[14px] text-[var(--admin-warning)]">
          Your role can view the team but not change it.
        </p>
      )}

      <div className="admin-card overflow-hidden">
        {!data ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-muted)]" />
          </div>
        ) : data.users.length === 0 ? (
          <EmptyState icon={<Users className="h-5 w-5" />} title="No admin users" description="Run npm run db:admin-migrate to seed the first super admin." />
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last login</th>
                  <th>Added</th>
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--admin-accent-soft)] font-bold text-[var(--admin-heading)]">
                          {(u.fullName || u.email).slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {u.fullName}
                            {u.id === data.selfId && <span className="ms-2 text-[12px] font-normal text-[var(--admin-muted)]">(you)</span>}
                          </p>
                          <p className="truncate text-[13px] text-[var(--admin-muted)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.role === "super_admin" ? "" : "admin-badge-muted"}`}>
                        {u.role === "super_admin" && <ShieldCheck className="h-3 w-3" />}
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.isActive ? "admin-badge-success" : "admin-badge-danger"}`}>
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="text-[var(--admin-muted)]">{formatDate(u.lastLogin)}</td>
                    <td className="text-[var(--admin-muted)]">{formatDate(u.createdAt)}</td>
                    <td>
                      {canManage && (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost !px-2"
                            aria-label={`Edit ${u.fullName}`}
                            onClick={() => setForm({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, isActive: u.isActive, password: "" })}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {u.id !== data.selfId && (
                            <button type="button" className="admin-btn admin-btn-ghost !px-2" aria-label={`Delete ${u.fullName}`} onClick={() => setToDelete(u)}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal
        open={!!form}
        title={form?.id ? "Edit team member" : "Add team member"}
        onClose={() => setForm(null)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setForm(null)}>
              Cancel
            </button>
            <button type="button" className="admin-btn admin-btn-primary" onClick={submit} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {form?.id ? "Save changes" : "Create account"}
            </button>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <label className="block">
              <span className="admin-label">Full name</span>
              <input className="admin-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </label>
            <label className="block">
              <span className="admin-label">Email</span>
              <input
                className="admin-input"
                type="email"
                value={form.email}
                disabled={!!form.id}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <div>
              <span className="admin-label">Role</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {ADMIN_ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`rounded-fuse-md border p-3 text-left transition-colors ${
                      form.role === r.value
                        ? "border-[var(--admin-accent-border)] bg-[var(--admin-accent-soft)]"
                        : "border-[var(--admin-line-strong)] hover:border-[#8c8c8c]"
                    }`}
                  >
                    <span className="block text-[14px] font-semibold">{r.label}</span>
                    <span className="mt-0.5 block text-[12px] text-[var(--admin-muted)]">{ROLE_HELP[r.value]}</span>
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="admin-label">{form.id ? "New password (optional)" : "Password"}</span>
              <input
                className="admin-input"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            {form.id && (
              <label className="flex cursor-pointer items-center gap-3 rounded-fuse-md bg-[var(--admin-bg)] p-3">
                <input type="checkbox" className="h-5 w-5" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span>
                  <span className="block text-[14px] font-semibold">Account active</span>
                  <span className="block text-[12px] text-[var(--admin-muted)]">Disabled accounts can’t sign in.</span>
                </span>
              </label>
            )}
          </div>
        )}
      </AdminModal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete team member?"
        description={toDelete ? `${toDelete.fullName} (${toDelete.email}) will lose access immediately.` : undefined}
        confirmLabel="Delete"
        danger
        loading={pending}
        onCancel={() => setToDelete(null)}
        onConfirm={() =>
          startTransition(async () => {
            if (!toDelete) return;
            const res = await adminDeleteUser(toDelete.id);
            if (res.ok) success("Team member deleted");
            else error(res.error);
            setToDelete(null);
            await load();
          })
        }
      />
    </div>
  );
}
