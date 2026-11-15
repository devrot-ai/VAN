import type { NavIcon } from "@/lib/nav";

const PATHS: Record<NavIcon, React.ReactNode> = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v10h14V9" /><path d="M9 19v-6h6v6" /></>,
  farm: <><path d="M3 21h18" /><path d="M5 21V9l7-5 7 5v12" /><path d="M8 12h2M14 12h2M8 16h2M14 16h2" /></>,
  spark: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 16 .6 1.9L21.5 18l-1.9.6L19 20.5l-.6-1.9-1.9-.6 1.9-.6L19 16Z" /></>,
  tractor: <><path d="M4 17h11" /><path d="M6 17V9h6l3 8" /><path d="M12 9V5h3l2 4" /><circle cx="7" cy="18" r="2.5" /><circle cx="17" cy="18" r="2.5" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.6-3.3 2.5-5 6-5s5.4 1.7 6 5" /><path d="M16 5.5a3 3 0 0 1 0 5.7M17 15c2.3.4 3.7 2 4 5" /></>,
  harvest: <><path d="M4 19h16" /><path d="M6 19v-6h12v6" /><path d="M8 13V8h8v5" /><path d="M10 8V5h4v3" /><path d="M3 21h18" /></>,
  finance: <><path d="M4 19V9" /><path d="M10 19V5" /><path d="M16 19v-7" /><path d="M3 19h16" /><path d="m4 7 6-3 6 3 4-2" /></>,
  devices: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8M8 13h5M12 20v2M8 2v2M16 2v2" /></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  equipment: <><path d="m14 6 4-3 3 3-3 4" /><path d="m18 10-7 7" /><path d="M8 21a4 4 0 0 1 0-8h3v4H8a1 1 0 0 0 0 2h3" /></>,
  inbox: <><path d="M4 4h16v13H4z" /><path d="M4 13h4l2 3h4l2-3h4" /></>,
  jobs: <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M8 6V4h8v2M3 11h18M10 11v2h4v-2" /></>,
  maintenance: <><path d="M14.5 6.5a4 4 0 0 0-5.9 5.1L3 17.2 5.8 20l5.6-5.6a4 4 0 0 0 5.1-5.9l-2.6 2.6-2.6-2.6 3.2-2Z" /></>,
  earnings: <><path d="M12 3v18M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3" /></>,
  members: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 20c.5-3.3 2.3-5 5.5-5s5 1.7 5.5 5M15 15c2.7.2 4.3 1.8 4.7 5" /></>,
  bookings: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M7 14h3M7 17h6" /></>,
  reports: <><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v5h4M8 16v-3M12 16v-6M16 16v-4" /></>,
  enquiries: <><path d="M4 5h16v11H8l-4 4z" /><path d="M8 9h8M8 12h5" /></>,
  availability: <><path d="M4 5h16v15H4z" /><path d="M8 3v4M16 3v4M4 10h16M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
  purchases: <><path d="M5 4h14v17H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  deliveries: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.6-3.3 2.5-5 6-5s5.4 1.7 6 5" /><path d="M17 8h4M19 6v4" /></>,
  activity: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
  settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1M4.6 9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1M9 4.6V4a2 2 0 1 1 4 0v.6M15 19.4v.6a2 2 0 1 1-4 0v-.6M19.4 9l.6-.1a2 2 0 1 1 0-4l-.6.1M4.6 15l-.6.1a2 2 0 1 1 0 4l.6-.1" /></>,
  crop: <><path d="M12 22V8" /><path d="M5 12H2a10 10 0 0 1 20 0h-3" /><path d="M5 19H2a10 10 0 0 1 4-8M19 19h3a10 10 0 0 0-4-8" /><path d="M8 6c2-2 6-2 8 0" /></>,
};

export default function AppIcon({ name }: { name: NavIcon }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
