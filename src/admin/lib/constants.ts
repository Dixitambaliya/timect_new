/** Admin roles -ready for future RBAC expansion */
export type AdminRole = "super_admin" | "admin" | "manager" | "viewer";

export const ADMIN_ROLES: { value: AdminRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "viewer", label: "Viewer" },
];

/** Cookie name for admin JWT session */
export const ADMIN_COOKIE = "timect_admin_token";

/** JWT expiry: 7 days */
export const ADMIN_TOKEN_TTL = "7d";
export const ADMIN_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const GENDER_OPTIONS = ["Men", "Women", "Unisex"] as const;

export const SPEC_SECTION_TYPES = [
  { value: "details", label: "Details List" },
  { value: "grid", label: "Label / Value Grid" },
  { value: "text", label: "Text Block" },
] as const;

/** Role permission helpers (extensible) */
export function canWrite(role: AdminRole): boolean {
  return role === "super_admin" || role === "admin" || role === "manager";
}

export function canManageUsers(role: AdminRole): boolean {
  return role === "super_admin" || role === "admin";
}

export function canDelete(role: AdminRole): boolean {
  return role === "super_admin" || role === "admin";
}
