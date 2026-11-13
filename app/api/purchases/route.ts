import { getPurchaseById, listPurchases } from "@/lib/db";
import { createServiceCrudRoute } from "@/lib/api";
import { createPurchaseService, updatePurchaseService, deletePurchaseService } from "@/lib/services";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "purchase",
  requireRole: "buyer",
  service: { list: listPurchases, get: getPurchaseById, create: createPurchaseService, update: updatePurchaseService, delete: deletePurchaseService },
  createFields: [
    { name: "lot", type: "text", required: true, maxLength: 200 },
    { name: "buyer", type: "text", maxLength: 120 },
    { name: "quantityTonnes", type: "number", min: 0, default: 0 },
    { name: "amount", type: "number", min: 0, default: 0 },
    { name: "status", type: "text", maxLength: 30, enum: ["enquiry", "confirmed", "scheduled", "delivered", "cancelled"], default: "enquiry" },
  ],
  updateFields: [
    { name: "lot", type: "text", required: true, maxLength: 200 },
    { name: "buyer", type: "text", maxLength: 120 },
    { name: "quantityTonnes", type: "number", min: 0 },
    { name: "amount", type: "number", min: 0 },
    { name: "status", type: "text", maxLength: 30, enum: ["enquiry", "confirmed", "scheduled", "delivered", "cancelled"] },
  ],
});
