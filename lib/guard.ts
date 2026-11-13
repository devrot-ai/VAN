import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import type { Role, SafeUser } from "@/lib/db";

export async function requireRole(allowed: Role[]): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (!allowed.includes(user.role)) {
    logAudit("ROLE_DENIED", user.id, { allowed, actualRole: user.role });
    redirect("/forbidden");
  }
  return user;
}

/**
 * Per-resource authorization: validates that a resource belongs to the current
 * user. Operations users can access any resource.
 */
export async function requireOwnership(
  user: SafeUser,
  resourceUserId: number,
): Promise<SafeUser> {
  if (user.id !== resourceUserId && user.role !== "operations") {
    logAudit("RESOURCE_DENIED", user.id, { resourceUserId });
    redirect("/forbidden");
  }
  return user;
}
