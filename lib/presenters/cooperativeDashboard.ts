/**
 * Cooperative dashboard presenter.
 */

import type { MemberRow } from "@/lib/db/types";

export interface MemberListItem {
  id: number;
  name: string;
  farm: string | null;
  status: string;
}

export interface CooperativeDashboardData {
  stats: {
    membersCount: number;
    activeCount: number;
    fieldsAcrossMembers: number;
    sharedBookings: number;
  };
  members: MemberListItem[];
}

export function presentCooperativeDashboard(
  members: MemberRow[],
): CooperativeDashboardData {
  const active = members.filter((m) => m.status === "active");
  const fields = active.reduce((s, m) => s + Number(m.fields_count || 0), 0);

  return {
    stats: {
      membersCount: members.length,
      activeCount: active.length,
      fieldsAcrossMembers: fields,
      sharedBookings: 0,
    },
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      farm: m.farm,
      status: m.status,
    })),
  };
}
