import type { Role } from "@/lib/db";

export const PORTAL_HOME: Record<Role, string> = {
  farmer: "/app",
  provider: "/provider",
  cooperative: "/cooperative",
  buyer: "/buyer",
  operations: "/operations",
};
