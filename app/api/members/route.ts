import { getMemberById, listMembers } from "@/lib/db";
import { createServiceCrudRoute } from "@/lib/api";
import { createMemberService, updateMemberService, deleteMemberService } from "@/lib/services";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "member",
  requireRole: "cooperative",
  service: { list: listMembers, get: getMemberById, create: createMemberService, update: updateMemberService, delete: deleteMemberService },
  createFields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "farm", type: "text", maxLength: 120 },
    { name: "status", type: "text", maxLength: 30, enum: ["active", "pending", "suspended"], default: "active" },
    { name: "fieldsCount", type: "integer", min: 0, default: 0 },
  ],
  updateFields: [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "farm", type: "text", maxLength: 120 },
    { name: "status", type: "text", maxLength: 30, enum: ["active", "pending", "suspended"] },
    { name: "fieldsCount", type: "integer", min: 0 },
  ],
});
