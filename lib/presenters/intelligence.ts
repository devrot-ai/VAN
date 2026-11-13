/**
 * Intelligence page presenter (farmer portal).
 */

import type { FieldRow } from "@/lib/db/types";

export interface FieldObservationItem {
  id: number;
  name: string;
  crop: string | null;
  area_ha: number;
  status: string | null;
}

export interface IntelligencePageData {
  fields: FieldObservationItem[];
}

export function presentIntelligencePage(fields: FieldRow[]): IntelligencePageData {
  return {
    fields: fields.map((f) => ({
      id: f.id,
      name: f.name,
      crop: f.crop,
      area_ha: f.area_ha,
      status: f.status,
    })),
  };
}
