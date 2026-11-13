import { getTransactionById, listTransactions } from "@/lib/db";
import { createServiceCrudRoute } from "@/lib/api";
import { createTransactionService, updateTransactionService, deleteTransactionService } from "@/lib/services";

const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
  entity: "transaction",
  service: { list: listTransactions, get: getTransactionById, create: createTransactionService, update: updateTransactionService, delete: deleteTransactionService },
  createFields: [
    { name: "date", type: "text", required: true, maxLength: 20 },
    { name: "description", type: "text", required: true, maxLength: 200 },
    { name: "amount", type: "number", required: true, min: 0.01 },
    { name: "type", type: "text", required: true, maxLength: 20, enum: ["income", "expense"] },
    { name: "category", type: "text", maxLength: 60 },
  ],
  updateFields: [
    { name: "date", type: "text", required: true, maxLength: 20 },
    { name: "description", type: "text", required: true, maxLength: 200 },
    { name: "amount", type: "number", min: 0.01 },
    { name: "type", type: "text", maxLength: 20, enum: ["income", "expense"] },
    { name: "category", type: "text", maxLength: 60 },
  ],
});
