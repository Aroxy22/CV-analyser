export type UserRole = "user" | "founder" | "admin";

export const USER_ROLE_COOKIE = "js_role";

export function isUserRole(value: string | null | undefined): value is UserRole {
  return value === "user" || value === "founder" || value === "admin";
}

/** Maps cookie or metadata string to UserRole (legacy Supabase metadata used "candidate"). */
export function normalizeRoleString(value: string | null | undefined): UserRole {
  if (value === "candidate") return "user";
  if (isUserRole(value)) return value;
  return "user";
}

export function getRoleFromMetadata(metadata: unknown): UserRole {
  if (metadata && typeof metadata === "object") {
    const role = (metadata as { role?: string }).role;
    if (role === "candidate") return "user";
    if (isUserRole(role)) return role;
  }
  return "user";
}
