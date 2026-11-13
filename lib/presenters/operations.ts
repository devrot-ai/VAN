/**
 * Operations dashboard presenter.
 */

export interface PlatformMetrics {
  users: number;
  fields: number;
  bookings: number;
  devices: number;
  members: number;
  engagements: number;
  earlyAccess: number;
}

export interface OperationsPageData {
  metrics: PlatformMetrics;
}

/**
 * Present operations dashboard data.
 * The metrics are already aggregated by the DB layer, so this presenter
 * simply wraps them for consistency with the presenter pattern.
 */
export function presentOperationsPage(metrics: PlatformMetrics): OperationsPageData {
  return { metrics };
}
