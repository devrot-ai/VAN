/**
 * Devices page presenter.
 */

import type { DeviceRow } from "@/lib/db/types";

export interface DeviceListItem {
  id: number;
  name: string;
  kind: string;
  status: string;
  location: string | null;
}

export interface DevicesPageData {
  stats: {
    totalDevices: number;
    online: number;
    offline: number;
  };
  devices: DeviceListItem[];
}

export function presentDevicesPage(devices: DeviceRow[]): DevicesPageData {
  const online = devices.filter((d) => d.status === "online").length;
  const offline = devices.filter((d) => d.status !== "online").length;

  return {
    stats: {
      totalDevices: devices.length,
      online,
      offline,
    },
    devices: devices.map((d) => ({
      id: d.id,
      name: d.name,
      kind: d.kind,
      status: d.status,
      location: d.location,
    })),
  };
}
