import type { Role } from "@/lib/db";

export type NavIcon =
  | "home"
  | "farm"
  | "spark"
  | "tractor"
  | "people"
  | "harvest"
  | "finance"
  | "devices"
  | "dashboard"
  | "equipment"
  | "inbox"
  | "jobs"
  | "maintenance"
  | "earnings"
  | "members"
  | "bookings"
  | "reports"
  | "enquiries"
  | "availability"
  | "purchases"
  | "deliveries"
  | "users"
  | "activity"
  | "settings";

export type NavItem = { label: string; href: string; icon: NavIcon };

export const PORTAL_NAV: Record<Role, NavItem[]> = {
  farmer: [
    { label: "Home", href: "/app", icon: "home" },
    { label: "My Farm", href: "/app/farm", icon: "farm" },
    { label: "Intelligence", href: "/app/intelligence", icon: "spark" },
    { label: "Machinery", href: "/app/machinery", icon: "tractor" },
    { label: "People & Services", href: "/app/people", icon: "people" },
    { label: "Harvest & Logistics", href: "/app/harvest", icon: "harvest" },
    { label: "Finance & Commerce", href: "/app/finance", icon: "finance" },
    { label: "Devices", href: "/app/devices", icon: "devices" },
  ],
  provider: [
    { label: "Dashboard", href: "/provider", icon: "dashboard" },
    { label: "Equipment", href: "/provider/equipment", icon: "equipment" },
    { label: "Booking requests", href: "/provider/requests", icon: "inbox" },
    { label: "Jobs", href: "/provider/jobs", icon: "jobs" },
    { label: "Maintenance", href: "/provider/maintenance", icon: "maintenance" },
    { label: "Earnings", href: "/provider/earnings", icon: "earnings" },
  ],
  cooperative: [
    { label: "Overview", href: "/cooperative", icon: "dashboard" },
    { label: "Members", href: "/cooperative/members", icon: "members" },
    { label: "Farms", href: "/cooperative/farms", icon: "farm" },
    { label: "Shared bookings", href: "/cooperative/bookings", icon: "bookings" },
    { label: "Reports", href: "/cooperative/reports", icon: "reports" },
  ],
  buyer: [
    { label: "Overview", href: "/buyer", icon: "dashboard" },
    { label: "Enquiries", href: "/buyer/enquiries", icon: "enquiries" },
    { label: "Availability", href: "/buyer/availability", icon: "availability" },
    { label: "Purchases", href: "/buyer/purchases", icon: "purchases" },
    { label: "Deliveries", href: "/buyer/deliveries", icon: "deliveries" },
  ],
  operations: [
    { label: "Overview", href: "/operations", icon: "dashboard" },
    { label: "Users", href: "/operations/users", icon: "users" },
    { label: "Platform activity", href: "/operations/activity", icon: "activity" },
    { label: "Settings", href: "/operations/settings", icon: "settings" },
  ],
};
