/**
 * Farm page presenter (fields + activities).
 */

import type { FieldRow, ActivityRow } from "@/lib/db/types";

export interface FarmFieldItem {
  id: number;
  name: string;
  area_ha: number;
  farm_id: number | null;
  crop: string | null;
  status: string | null;
}

export interface FarmActivityItem {
  id: number;
  title: string;
  due_date: string | null;
  category: string | null;
  done: number;
}

export interface FarmPageData {
  stats: {
    fieldsCount: number;
    totalAreaHa: number;
    fieldsUnderCrop: number;
    activitiesCount: number;
  };
  fields: FarmFieldItem[];
  activities: FarmActivityItem[];
}

export function presentFarmPage(
  fields: FieldRow[],
  activities: ActivityRow[],
): FarmPageData {
  const totalArea = fields.reduce((s, f) => s + Number(f.area_ha || 0), 0);

  return {
    stats: {
      fieldsCount: fields.length,
      totalAreaHa: totalArea,
      fieldsUnderCrop: fields.filter((f) => f.crop).length,
      activitiesCount: activities.length,
    },
    fields: fields.map((f) => ({
      id: f.id,
      name: f.name,
      area_ha: f.area_ha,
      farm_id: f.farm_id,
      crop: f.crop,
      status: f.status,
    })),
    activities: activities.map((a) => ({
      id: a.id,
      title: a.title,
      due_date: a.due_date,
      category: a.category,
      done: a.done,
    })),
  };
}
