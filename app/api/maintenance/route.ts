import { getMaintenanceById, listMaintenance, getEquipmentById } from "@/lib/db";
import { createServiceCrudRoute } from "@/lib/api";
import { createMaintenanceService, updateMaintenanceService, deleteMaintenanceService } from "@/lib/services";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "maintenance",
  service: { list: listMaintenance, get: getMaintenanceById, create: createMaintenanceService, update: updateMaintenanceService, delete: deleteMaintenanceService },
  createFields: [
    { name: "equipmentId", type: "integer", required: true },
    { name: "task", type: "text", required: true, maxLength: 200 },
    { name: "dueDate", type: "text", maxLength: 20 },
    { name: "status", type: "text", maxLength: 20, default: "scheduled" },
    { name: "notes", type: "text", maxLength: 500 },
  ],
  updateFields: [
    { name: "task", type: "text", required: true, maxLength: 200 },
    { name: "dueDate", type: "text", maxLength: 20 },
    { name: "status", type: "text", maxLength: 20, default: "scheduled" },
    { name: "notes", type: "text", maxLength: 500 },
  ],
  validateCreate: (data) => {
    const equipmentId = Number(data.equipmentId);
    if (!Number.isFinite(equipmentId)) return "Equipment ID is required.";
    const equipment = getEquipmentById(equipmentId);
    if (!equipment) return "That equipment does not exist.";
    return undefined;
  },
  listKey: "records",
  itemKey: "record",
});
