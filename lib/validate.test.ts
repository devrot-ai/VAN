import { describe, it, expect } from "vitest";
import { validate, mustPass, FIELD_SCHEMA, ACTIVITY_SCHEMA, DEVICE_SCHEMA, TRANSACTION_SCHEMA, HARVEST_SCHEMA } from "./validate";

describe("validate function", () => {
  it("returns no errors for valid data", () => {
    const errors = validate(FIELD_SCHEMA, {
      name: "North Field",
      areaHa: 2.5,
      crop: "Wheat",
      status: "planted",
    });
    expect(errors).toHaveLength(0);
  });

  it("returns error for missing required enum field", () => {
    // The validator only checks fields present in the schema, not missing keys.
    // Required enum fields fail when not provided because undefined isn't in the enum values.
    const errors = validate(FIELD_SCHEMA, { name: "Test", areaHa: 2.5 });
    expect(errors.some((e) => e.field === "status")).toBe(true);
  });

  it("returns error for string too long", () => {
    const errors = validate(FIELD_SCHEMA, {
      name: "A".repeat(201),
      areaHa: 2.5,
    });
    expect(errors.some((e) => e.field === "name")).toBe(true);
  });

  it("returns error for number below min", () => {
    const errors = validate(FIELD_SCHEMA, { name: "Test", areaHa: 0.001, status: "planted" });
    expect(errors.some((e) => e.field === "areaHa")).toBe(true);
  });

  it("returns error for invalid enum value", () => {
    const errors = validate(FIELD_SCHEMA, {
      name: "Test",
      areaHa: 1,
      status: "invalid_status",
    });
    expect(errors.some((e) => e.field === "status")).toBe(true);
  });

  it("skips optional fields when not provided", () => {
    const errors = validate(FIELD_SCHEMA, { name: "Test", areaHa: 1, status: "planted" });
    expect(errors).toHaveLength(0);
  });

  it("validates optional fields when provided", () => {
    const errors = validate(FIELD_SCHEMA, {
      name: "Test",
      areaHa: 1,
      status: "planted",
      crop: "A".repeat(201),
    });
    expect(errors.some((e) => e.field === "crop")).toBe(true);
  });
});

describe("mustPass", () => {
  it("throws for invalid data", () => {
    expect(() => mustPass(FIELD_SCHEMA, { areaHa: 2.5 })).toThrow("status");
  });

  it("does not throw for valid data", () => {
    expect(() => mustPass(FIELD_SCHEMA, { name: "Test", areaHa: 1, status: "planted" })).not.toThrow();
  });
});

describe("ACTIVITY_SCHEMA", () => {
  it("validates valid activity", () => {
    const errors = validate(ACTIVITY_SCHEMA, { title: "Plant wheat" });
    expect(errors).toHaveLength(0);
  });

  it("rejects invalid dueDate format", () => {
    const errors = validate(ACTIVITY_SCHEMA, { title: "Test", dueDate: "01-06-2025" });
    expect(errors.some((e) => e.field === "dueDate")).toBe(true);
  });

  it("accepts valid dueDate format", () => {
    const errors = validate(ACTIVITY_SCHEMA, { title: "Test", dueDate: "2025-06-01" });
    expect(errors).toHaveLength(0);
  });
});

describe("DEVICE_SCHEMA", () => {
  it("validates valid device", () => {
    const errors = validate(DEVICE_SCHEMA, { name: "Sensor", kind: "weather", status: "online" });
    expect(errors).toHaveLength(0);
  });

  it("rejects invalid status", () => {
    const errors = validate(DEVICE_SCHEMA, { name: "Sensor", kind: "weather", status: "broken" });
    expect(errors.some((e) => e.field === "status")).toBe(true);
  });
});

describe("TRANSACTION_SCHEMA", () => {
  it("validates valid transaction", () => {
    const errors = validate(TRANSACTION_SCHEMA, {
      description: "Seed purchase",
      amount: 5000,
      type: "expense",
      date: "2025-01-01",
    });
    expect(errors).toHaveLength(0);
  });

  it("rejects amount below min", () => {
    const errors = validate(TRANSACTION_SCHEMA, {
      description: "Test",
      amount: 0,
      type: "expense",
      date: "2025-01-01",
    });
    expect(errors.some((e) => e.field === "amount")).toBe(true);
  });

  it("rejects invalid type", () => {
    const errors = validate(TRANSACTION_SCHEMA, {
      description: "Test",
      amount: 100,
      type: "refund",
      date: "2025-01-01",
    });
    expect(errors.some((e) => e.field === "type")).toBe(true);
  });
});

describe("HARVEST_SCHEMA", () => {
  it("validates valid harvest", () => {
    const errors = validate(HARVEST_SCHEMA, {
      crop: "Wheat",
      quantityTonnes: 5,
      fieldId: 1,
      date: "2025-06-01",
      status: "ready",
    });
    expect(errors).toHaveLength(0);
  });

  it("rejects non-integer fieldId", () => {
    const errors = validate(HARVEST_SCHEMA, {
      crop: "Wheat",
      quantityTonnes: 5,
      fieldId: 1.5,
      date: "2025-06-01",
      status: "ready",
    });
    expect(errors.some((e) => e.field === "fieldId")).toBe(true);
  });
});
