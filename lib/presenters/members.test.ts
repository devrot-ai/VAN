import { describe, it, expect } from "vitest";
import { presentMembersPage } from "./members";
import type { MemberRow } from "@/lib/db/types";

describe("presentMembersPage", () => {
  const members: MemberRow[] = [
    { id: 1, user_id: 1, name: "Farm A", farm: "Green Valley", status: "active", fields_count: 3, created_at: "2025-01-01" },
    { id: 2, user_id: 1, name: "Farm B", farm: "Blue Hills", status: "pending", fields_count: 1, created_at: "2025-01-01" },
    { id: 3, user_id: 1, name: "Farm C", farm: "Red Plains", status: "active", fields_count: 5, created_at: "2025-01-01" },
  ];

  it("computes member stats", () => {
    const data = presentMembersPage(members);
    expect(data.stats.total).toBe(3);
    expect(data.stats.active).toBe(2);
    // No pending stat in presenter, only total/active
  });

  it("returns all members", () => {
    const data = presentMembersPage(members);
    expect(data.members).toHaveLength(3);
  });

  it("handles empty data", () => {
    const data = presentMembersPage([]);
    expect(data.stats.total).toBe(0);
    expect(data.members).toHaveLength(0);
  });
});
