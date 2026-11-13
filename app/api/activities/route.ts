import { getActivityById, listActivities } from "@/lib/db";
import { createServiceCrudRoute } from "@/lib/api";
import { createActivityService, updateActivityService, deleteActivityService } from "@/lib/services";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "activity",
  service: { list: listActivities, get: getActivityById, create: createActivityService, update: updateActivityService, delete: deleteActivityService },
  createFields: [
    { name: "title", type: "text", required: true, maxLength: 200 },
    { name: "dueDate", type: "text", maxLength: 20 },
    { name: "category", type: "text", maxLength: 80 },
    { name: "done", type: "text", maxLength: 5 },
  ],
  updateFields: [
    { name: "title", type: "text", required: true, maxLength: 200 },
    { name: "dueDate", type: "text", maxLength: 20 },
    { name: "category", type: "text", maxLength: 80 },
    { name: "done", type: "text", maxLength: 5 },
  ],
  validateCreate: (data) => {
    if (data.dueDate && Number.isNaN(Date.parse(String(data.dueDate)))) {
      data.dueDate = null;
    } else if (!data.dueDate) {
      data.dueDate = null;
    }
    data.done = Boolean(data.done);
    return undefined;
  },
  validateUpdate: (data) => {
    if (data.dueDate !== undefined) {
      if (data.dueDate && Number.isNaN(Date.parse(String(data.dueDate)))) {
        data.dueDate = null;
      }
    }
    if (data.done !== undefined) {
      data.done = Boolean(data.done);
    }
    return undefined;
  },
});
