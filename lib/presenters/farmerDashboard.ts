/**
 * Farmer dashboard presenter.
 *
 * Transforms raw DB rows into UI-ready stats, lists, and analytics.
 */

import type { FieldRow, ActivityRow, BookingRow, DeviceRow } from "@/lib/db/types";

export interface AnalyticsItem {
  label: string;
  value: number;
  color?: string;
}

export interface ActivityListItem {
  id: number;
  title: string;
  due_date: string | null;
  category: string | null;
}

export interface BookingListItem {
  id: number;
  title: string;
  when_date: string | null;
  status: string;
}

export interface FieldListItem {
  id: number;
  name: string;
  area_ha: number;
  crop: string | null;
  status: string | null;
}

export interface FarmerDashboardData {
  stats: {
    fieldsCount: number;
    areaHa: number;
    activeBookings: number;
    devicesOnline: string;
  };
  openActivities: ActivityListItem[];
  recentBookings: BookingListItem[];
  fieldsAtAGlance: FieldListItem[];
  fieldAnalytics: AnalyticsItem[];
  activityAnalytics: AnalyticsItem[];
}

/**
 * Present farmer dashboard data from raw DB rows.
 */
export function presentFarmerDashboard(
  fields: FieldRow[],
  activities: ActivityRow[],
  bookings: BookingRow[],
  devices: DeviceRow[],
): FarmerDashboardData {
  const areaHa = fields.reduce((s, f) => s + Number(f.area_ha || 0), 0);
  const openActivities = activities.filter((a) => !a.done);
  const devicesOnline = devices.filter((d) => d.status === "online").length;

  // Field status breakdown
  const fieldStatusCounts: Record<string, number> = {};
  fields.forEach((f) => {
    const status = f.status || "unknown";
    fieldStatusCounts[status] = (fieldStatusCounts[status] || 0) + 1;
  });
  const fieldAnalytics: AnalyticsItem[] = Object.entries(fieldStatusCounts).map(
    ([label, value]) => ({
      label,
      value,
      color:
        label === "active"
          ? "var(--color-green)"
          : label === "fallow"
            ? "#c0392b"
            : undefined,
    }),
  );

  // Activity category breakdown
  const activityCategoryCounts: Record<string, number> = {};
  activities.forEach((a) => {
    const cat = a.category || "uncategorized";
    activityCategoryCounts[cat] = (activityCategoryCounts[cat] || 0) + 1;
  });
  const activityAnalytics: AnalyticsItem[] = Object.entries(activityCategoryCounts).map(
    ([label, value]) => ({ label, value }),
  );

  // Filter out logistics bookings for "active bookings" stat
  const activeBookings = bookings.filter((b) => b.kind !== "request");

  return {
    stats: {
      fieldsCount: fields.length,
      areaHa,
      activeBookings: activeBookings.length,
      devicesOnline: `${devicesOnline}/${devices.length}`,
    },
    openActivities: openActivities.slice(0, 5).map((a) => ({
      id: a.id,
      title: a.title,
      due_date: a.due_date,
      category: a.category,
    })),
    recentBookings: activeBookings.slice(0, 4).map((b) => ({
      id: b.id,
      title: b.title,
      when_date: b.when_date,
      status: b.status,
    })),
    fieldsAtAGlance: fields.slice(0, 4).map((f) => ({
      id: f.id,
      name: f.name,
      area_ha: f.area_ha,
      crop: f.crop,
      status: f.status,
    })),
    fieldAnalytics,
    activityAnalytics,
  };
}
