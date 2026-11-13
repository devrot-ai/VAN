import { getFieldById, listFields } from "@/lib/db";
import { createServiceCrudRoute } from "@/lib/api";
import { createFieldService, updateFieldService, deleteFieldService } from "@/lib/services";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "field",
  service: { list: listFields, get: getFieldById, create: createFieldService, update: updateFieldService, delete: deleteFieldService },
  createFields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "areaHa", type: "number", required: true, min: 0.01 },
    { name: "crop", type: "text", maxLength: 120 },
    { name: "status", type: "text", maxLength: 60 },
    { name: "notes", type: "text", maxLength: 500 },
  ],
  updateFields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "areaHa", type: "number", min: 0.01 },
    { name: "crop", type: "text", maxLength: 120 },
    { name: "status", type: "text", maxLength: 60 },
    { name: "notes", type: "text", maxLength: 500 },
  ],
});
