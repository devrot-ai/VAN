/**
 * Presenters — pure functions that transform raw DB rows into UI-ready data.
 *
 * This creates a clean seam between "data preparation" and "UI rendering."
 * Pages become thin renderers that call the presenter and pass the result to UI components.
 * The presenter can be tested independently of the page.
 *
 * Pattern:
 *   // In page.tsx (server component):
 *   const data = presentFarmerDashboard(fields, activities, bookings, devices);
 *   return <FarmerDashboardView data={data} />;
 */

export * from "./farmerDashboard";
export * from "./providerDashboard";
export * from "./cooperativeDashboard";
export * from "./buyerDashboard";
export * from "./farm";
export * from "./finance";
export * from "./harvest";
export * from "./devices";
export * from "./equipment";
export * from "./maintenance";
export * from "./bookings";
export * from "./members";
export * from "./purchases";
export * from "./earnings";
export * from "./intelligence";
export * from "./machinery";
export * from "./operations";
