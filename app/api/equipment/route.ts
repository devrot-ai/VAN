import { getEquipmentById, listEquipment } from "@/lib/db";
import { createServiceCrudRoute } from "@/lib/api";
import { createEquipmentService, updateEquipmentService, deleteEquipmentService } from "@/lib/services";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "equipment",
  requireRole: "provider",
  service: { list: listEquipment, get: getEquipmentById, create: createEquipmentService, update: updateEquipmentService, delete: deleteEquipmentService },
  createFields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "category", type: "text", maxLength: 60 },
    { name: "status", type: "text", maxLength: 30, enum: ["available", "booked", "maintenance"], default: "available" },
    { name: "dailyRate", type: "number", min: 0 },
    { name: "location", type: "text", maxLength: 120 },
  ],
  updateFields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "category", type: "text", maxLength: 60 },
    { name: "status", type: "text", maxLength: 30, enum: ["available", "booked", "maintenance"] },
    { name: "dailyRate", type: "number", min: 0 },
    { name: "location", type: "text", maxLength: 120 },
  ],
});
