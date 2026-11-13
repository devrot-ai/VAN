import { getHarvestById, listHarvests, getFieldById } from "@/lib/db";
import { createServiceCrudRoute } from "@/lib/api";
import { createHarvestService, updateHarvestService, deleteHarvestService } from "@/lib/services";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "harvest",
  service: { list: listHarvests, get: getHarvestById, create: createHarvestService, update: updateHarvestService, delete: deleteHarvestService },
  createFields: [
    { name: "fieldId", type: "integer", required: true },
    { name: "crop", type: "text", required: true, maxLength: 100 },
    { name: "quantityTonnes", type: "number", required: true, min: 0.01 },
    { name: "date", type: "text", required: true, maxLength: 20 },
    { name: "quality", type: "text", maxLength: 60 },
    { name: "status", type: "text", maxLength: 20, default: "planned" },
  ],
  updateFields: [
    { name: "crop", type: "text", required: true, maxLength: 100 },
    { name: "quantityTonnes", type: "number", min: 0.01 },
    { name: "date", type: "text", required: true, maxLength: 20 },
    { name: "quality", type: "text", maxLength: 60 },
    { name: "status", type: "text", maxLength: 20, default: "planned" },
  ],
  validateCreate: (data) => {
    const fieldId = Number(data.fieldId);
    if (!Number.isFinite(fieldId)) return "Field ID is required.";
    const field = getFieldById(fieldId);
    if (!field) return "That field does not exist.";
    return undefined;
  },
});
