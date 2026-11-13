import { getDeviceById, listDevices } from "@/lib/db";
import { createServiceCrudRoute } from "@/lib/api";
import { createDeviceService, updateDeviceService, deleteDeviceService } from "@/lib/services";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "device",
  service: { list: listDevices, get: getDeviceById, create: createDeviceService, update: updateDeviceService, delete: deleteDeviceService },
  createFields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "kind", type: "text", required: true, maxLength: 60 },
    { name: "status", type: "text", maxLength: 30, enum: ["online", "offline", "maintenance"], default: "offline" },
    { name: "location", type: "text", maxLength: 120 },
  ],
  updateFields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "kind", type: "text", required: true, maxLength: 60 },
    { name: "status", type: "text", maxLength: 30, enum: ["online", "offline", "maintenance"] },
    { name: "location", type: "text", maxLength: 120 },
  ],
});
