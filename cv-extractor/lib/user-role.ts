export type UserRole = "candidate" | "founder" | "admin";

export const USER_ROLE_COOKIE = "js_role";

export function isUserRole(value: string | null | undefined): value is UserRole {
  return value === "candidate" || value === "founder" || value === "admin";
}

export function getRoleFromMetadata(metadata: unknown): UserRole {
  if (metadata && typeof metadata === "object") {
    const role = (metadata as { role?: string }).role;
    if (isUserRole(role)) return role;
  }
  return "candidate";
}
