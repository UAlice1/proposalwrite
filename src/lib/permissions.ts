export type UserRole = "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "EMPLOYEE";

const ROLE_RANK: Record<UserRole, number> = {
  SUPER_ADMIN: 4,
  ORG_ADMIN:   3,
  MANAGER:     2,
  EMPLOYEE:    1,
};

function rank(role: string): number {
  return ROLE_RANK[role as UserRole] ?? 0;
}

function atLeast(role: string, minimum: UserRole): boolean {
  return rank(role) >= rank(minimum);
}

export function canViewAllOrgProposals(role: string): boolean {
  return atLeast(role, "MANAGER");
}

export function canCreateProposals(role: string): boolean {
  return atLeast(role, "MANAGER");
}

export function canEditProposals(role: string): boolean {
  return atLeast(role, "MANAGER");
}

export function canDeleteProposals(role: string): boolean {
  return atLeast(role, "MANAGER");
}

export function canManageOrg(role: string): boolean {
  return atLeast(role, "ORG_ADMIN");
}

export function canUseAI(role: string): boolean {
  return atLeast(role, "EMPLOYEE");
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ORG_ADMIN:   "Org Admin",
  MANAGER:     "Manager",
  EMPLOYEE:    "Employee",
};

export const ASSIGNABLE_ROLES: UserRole[] = ["MANAGER", "EMPLOYEE"];

export const Permission = {
  canViewAllOrgProposals,
  canCreateProposals,
  canEditProposals,
  canDeleteProposals,
  canManageOrg,
  canUseAI,
} as const;
