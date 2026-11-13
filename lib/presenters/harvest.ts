/**
 * Harvest page presenter.
 */

import type { FieldRow, BookingRow, HarvestWithField } from "@/lib/db/types";

export interface HarvestRecordItem {
  id: number;
  field_id: number;
  crop: string;
  quantity_tonnes: number;
  field_name: string | null;
  date: string;
  quality: string | null;
  status: string;
}

export interface CropFieldItem {
  id: number;
  name: string;
  crop: string;
  area_ha: number;
  status: string | null;
}

export interface LogisticsItem {
  id: number;
  title: string;
  counterparty: string | null;
  when_date: string | null;
  status: string;
}

export interface HarvestPageData {
  stats: {
    fieldsToHarvest: number;
    transportBookings: number;
    totalTonnes: number;
    readyForMarket: number;
  };
  harvests: HarvestRecordItem[];
  cropFields: CropFieldItem[];
  logistics: LogisticsItem[];
}

export function presentHarvestPage(
  fields: FieldRow[],
  bookings: BookingRow[],
  harvests: HarvestWithField[],
): HarvestPageData {
  const cropFields = fields.filter((f) => f.crop && f.status !== "fallow");
  const logistics = bookings.filter((b) => b.kind === "logistics");
  const totalTonnes = harvests.reduce((s, h) => s + Number(h.quantity_tonnes || 0), 0);
  const readyHarvests = harvests.filter((h) => h.status === "ready" || h.status === "available");

  return {
    stats: {
      fieldsToHarvest: cropFields.length,
      transportBookings: logistics.length,
      totalTonnes,
      readyForMarket: readyHarvests.length,
    },
    harvests: harvests.map((h) => ({
      id: h.id,
      field_id: h.field_id,
      crop: h.crop,
      quantity_tonnes: h.quantity_tonnes,
      field_name: h.field_name,
      date: h.date,
      quality: h.quality,
      status: h.status,
    })),
    cropFields: cropFields.map((f) => ({
      id: f.id,
      name: f.name,
      crop: f.crop!,
      area_ha: f.area_ha,
      status: f.status,
    })),
    logistics: logistics.map((b) => ({
      id: b.id,
      title: b.title,
      counterparty: b.counterparty,
      when_date: b.when_date,
      status: b.status,
    })),
  };
}
