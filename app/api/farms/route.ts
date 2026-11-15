import { createFarmService, updateFarmService, deleteFarmService, listFarmsService } from "@/lib/services";
import { getFarmById } from "@/lib/db/farms";
import { createServiceCrudRoute } from "@/lib/api";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "farm",
  service: {
    list: listFarmsService,
    get: getFarmById, // factory checks ownership via user_id
    create: (userId, input) => createFarmService(userId, input),
    update: (userId, id, input) => updateFarmService(userId, id, input),
    delete: (userId, id) => deleteFarmService(userId, id),
  },
  createFields: [
    { name: "name", type: "text", required: true, maxLength: 200 },
    { name: "address", type: "text", maxLength: 500 },
    { name: "totalAreaHa", type: "number", required: true, min: 0.01 },
    { name: "status", type: "text", maxLength: 20 },
  ],
  updateFields: [
    { name: "name", type: "text", required: true, maxLength: 200 },
    { name: "address", type: "text", maxLength: 500 },
    { name: "totalAreaHa", type: "number", min: 0.01 },
    { name: "status", type: "text", maxLength: 20, enum: ["active", "inactive", "archived"] },
  ],
});

export { GET, POST, PUT, DELETE };
