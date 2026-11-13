/**
 * Members page presenter (cooperative portal).
 */

import type { MemberRow } from "@/lib/db/types";

export interface CooperativeMemberItem {
  id: number;
  name: string;
  farm: string | null;
  status: string;
  fields_count: number;
}

export interface MembersPageData {
  stats: {
    total: number;
    active: number;
  };
  members: CooperativeMemberItem[];
}

export function presentMembersPage(members: MemberRow[]): MembersPageData {
  return {
    stats: {
      total: members.length,
      active: members.filter((m) => m.status === "active").length,
    },
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      farm: m.farm,
      status: m.status,
      fields_count: m.fields_count,
    })),
  };
}
