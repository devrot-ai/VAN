import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sanitizeText } from "@/lib/sanitize";
import { logAudit, AuditEvent } from "@/lib/audit";
import { SafeUser, Role } from "@/lib/db";

/**
 * Standardized API error response helpers.
 *
 * All API routes use these helpers for consistent error shapes:
 * { error: string, code?: string, retryAfter?: number }
 */

export interface ApiError {
  error: string;
  code?: string;
  retryAfter?: number;
}

export function badRequest(message: string, code: string = "BAD_REQUEST"): NextResponse {
  return NextResponse.json({ error: message, code }, { status: 400 });
}

export function unauthorized(message: string = "Please sign in first."): NextResponse {
  return NextResponse.json({ error: message, code: "UNAUTHORIZED" }, { status: 401 });
}

export function forbidden(message: string = "You do not have permission."): NextResponse {
  return NextResponse.json({ error: message, code: "FORBIDDEN" }, { status: 403 });
}

export function notFound(message: string = "The resource was not found."): NextResponse {
  return NextResponse.json({ error: message, code: "NOT_FOUND" }, { status: 404 });
}

export function conflict(message: string): NextResponse {
  return NextResponse.json({ error: message, code: "CONFLICT" }, { status: 409 });
}

export function rateLimited(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later.", code: "RATE_LIMITED", retryAfter },
    { status: 429 },
  );
}

// ---------------------------------------------------------------------------
// Composable Middleware
// ---------------------------------------------------------------------------
// Independent, testable layers that can be composed for any route.
// Each middleware wraps a handler function and adds one concern:
//   withAuth()     — session check + optional role gate
//   withSanitize() — JSON parse + field sanitization
//   withAudit()    — log audit event after successful handler
//
// These can be used standalone or combined. The CRUD factory uses them
// internally, but hand-written routes can compose them too.
// ---------------------------------------------------------------------------

/** Context passed to a middleware-wrapped handler. */
export interface HandlerContext {
  user: SafeUser;
  body: Record<string, unknown>;
}

/** A route handler that receives enriched context. */
export type RouteHandler = (ctx: HandlerContext) => NextResponse | Promise<NextResponse>;

/**
 * withAuth — Check session and optional role before calling the inner handler.
 *
 * Usage:
 *   export const POST = withAuth({ role: "farmer" }, async (ctx) => {
 *     // ctx.user is guaranteed to exist and match the role
 *   });
 */
export function withAuth(
  options: { role?: Role; message?: string } = {},
  handler: (ctx: { user: SafeUser; body?: Record<string, unknown> }) => NextResponse | Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (options.role && user.role !== options.role) {
      return forbidden(options.message ?? `Only ${options.role}s can perform this action.`);
    }
    return handler({ user });
  };
}

/**
 * withSanitizeOnly — Parse JSON body and sanitize specified fields, without requiring auth.
 * Use this for public endpoints (contact forms, early access, etc.) that need
 * input sanitization but no session check.
 *
 * Usage:
 *   export const POST = withSanitizeOnly(
 *     [{ name: "name", type: "text", required: true, maxLength: 120 }],
 *     async (ctx) => {
 *       // ctx.body contains sanitized values
 *       const name = ctx.body.name as string;
 *     },
 *   );
 */
export function withSanitizeOnly(
  fields: CrudField[],
  handler: (ctx: { body: Record<string, unknown> }) => NextResponse | Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    // Sanitize all declared fields
    for (const field of fields) {
      const { value, error } = parseField(body, field);
      if (error) return badRequest(error);
      body[field.name] = value;
    }

    return handler({ body });
  };
}

/**
 * withSanitize — Parse JSON body and sanitize specified fields.
 * Must be composed with withAuth. Returns early on parse error or validation failure.
 *
 * Usage:
 *   const POST = withAuth({}, withSanitize(fields, async (ctx) => {
 *     // ctx.body contains sanitized values
 *   }));
 */
export function withSanitize(
  fields: CrudField[],
  handler: RouteHandler,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    // Sanitize all declared fields
    for (const field of fields) {
      const { value, error } = parseField(body, field);
      if (error) return badRequest(error);
      body[field.name] = value;
    }

    // Delegate to the auth middleware or direct handler
    if ((handler as any).__authWrapped) {
      return (handler as any)({ req, body });
    }
    return badRequest("withSanitize must be composed with withAuth. Use: withAuth({}, withSanitize(fields, handler))");
  };
}

/**
 * withAudit — Log an audit event after a successful handler call.
 * Use this for hand-written routes with unique business logic (bookings, etc.)
 * where audit can't be placed at the DB layer.
 *
 * Usage:
 *   const POST = withAudit("BOOKING_CREATED", (ctx) => ({ bookingId: ctx.body.bookingId }), async (ctx) => {
 *     // handler body
 *   });
 */
export function withAudit(
  event: AuditEvent,
  metaFn: (ctx: HandlerContext) => Record<string, unknown>,
  handler: RouteHandler,
) {
  return async (ctx: HandlerContext): Promise<NextResponse> => {
    const response = await handler(ctx);
    if (response.status < 400) {
      const meta = metaFn(ctx);
      logAudit(event, ctx.user.id, meta);
    }
    return response;
  };
}

/**
 * Compose auth + sanitize + audit in one call for hand-written routes.
 * This is the recommended way to write non-CRUD routes.
 *
 * Usage:
 *   export const POST = withAuthAndSanitize(
 *     { role: "farmer" },
 *     [{ name: "equipmentId", type: "integer", required: true }],
 *     "BOOKING_CREATED",
 *     (ctx) => ({ equipmentId: ctx.body.equipmentId }),
 *     async (ctx) => {
 *       const equipmentId = ctx.body.equipmentId as number;
 *       // business logic
 *     },
 *   );
 */
export function withAuthAndSanitize(
  authOptions: { role?: Role; message?: string },
  fields: CrudField[],
  auditEvent: AuditEvent,
  auditMetaFn: (ctx: HandlerContext) => Record<string, unknown>,
  handler: (ctx: { user: SafeUser; body: Record<string, unknown> }) => NextResponse | Promise<NextResponse>,
) {
  // Build inner handler with audit
  const withAuditLayer = async (ctx: { user: SafeUser; body: Record<string, unknown> }): Promise<NextResponse> => {
    const response = await handler(ctx);
    if (response.status < 400) {
      logAudit(auditEvent, ctx.user.id, auditMetaFn({ user: ctx.user, body: ctx.body }));
    }
    return response;
  };

  // Build auth + sanitize wrapper
  return async (req: NextRequest): Promise<NextResponse> => {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (authOptions.role && user.role !== authOptions.role) {
      return forbidden(authOptions.message ?? `Only ${authOptions.role}s can perform this action.`);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    for (const field of fields) {
      const { value, error } = parseField(body, field);
      if (error) return badRequest(error);
      body[field.name] = value;
    }

    return withAuditLayer({ user, body });
  };
}

// ---------------------------------------------------------------------------
// CRUD Route Factory
// ---------------------------------------------------------------------------
// Extracts the repeated CRUD pattern (auth → parse → sanitize → validate →
// DB call → audit → response) into a factory function. Each entity route
// becomes a short config object instead of 120-155 lines of boilerplate.
// Built on top of the composable middleware above.
// ---------------------------------------------------------------------------

/** A single field definition for sanitization and validation. */
export interface CrudField {
  name: string;
  type: "text" | "number" | "integer";
  maxLength?: number;
  required?: boolean;
  min?: number;
  enum?: string[];
  default?: string | number | null;
}

/** Row shape returned by the DB getter — must have id and user_id. */
export interface OwnedRow {
  id: number;
  user_id: number;
  [key: string]: unknown;
}

/** Config for creating a CRUD route handler set. */
export interface CrudRouteConfig<T extends OwnedRow> {
  /** Singular entity name for audit events and error messages (e.g. "field", "transaction"). */
  entity: string;

  /** DB functions for this entity. The create/update functions receive the
      sanitized field data as a plain record — the route config is responsible
      for mapping factory field names to DB column names via `fieldMap` if needed.
      Note: update and delete now receive userId as the last parameter because
      the DB layer handles audit logging automatically. */
  db: {
    list: (userId: number) => T[];
    get: (id: number) => T | undefined;
    /** Create receives { userId, ...sanitizedFields }. Must return the created row. */
    create: (input: any) => T;
    /** Update receives (id, { field1?: value, field2?: value }, userId). */
    update: (id: number, input: any, userId: number) => void;
    /** Delete receives (id, userId). */
    delete: (id: number, userId: number) => void;
  };

  /** Fields to sanitize on create. Only fields listed here are accepted. */
  createFields: CrudField[];

  /** Fields to sanitize on update. Only fields listed here are accepted. */
  updateFields: CrudField[];

  /** Optional: restrict ALL methods to a specific role (e.g. equipment → provider only). */
  requireRole?: Role;

  /** Optional: restrict create to specific roles (use requireRole for all methods). */
  createRole?: Role;

  /** Optional: custom validation before create. Return error message or undefined. */
  validateCreate?: (data: Record<string, unknown>) => string | undefined;

  /** Optional: custom validation before update. Return error message or undefined. */
  validateUpdate?: (data: Record<string, unknown>) => string | undefined;

  /** Optional: response key for the list endpoint (defaults to entity + "s"). */
  listKey?: string;

  /** Optional: response key for the created/updated item (defaults to entity). */
  itemKey?: string;

  /** Optional: called after a successful create with the created row and user.
      Use this to emit notification events for entities that need them. */
  onCreate?: (row: T, user: SafeUser) => void;

  /** Optional: called after a successful update with the updated row and user.
      Use this to emit notification events for entities that need them. */
  onUpdate?: (row: T, user: SafeUser) => void;
}

/** Parse a single field value from the request body and sanitize it. */
function parseField(body: Record<string, unknown>, field: CrudField): { value: unknown; error?: string } {
  const raw = body[field.name];

  if (field.type === "number") {
    if (raw === undefined || raw === null || raw === "") {
      if (!field.required) return { value: field.default ?? null };
      return { value: undefined, error: `${field.name} is required.` };
    }
    const num = Number(raw);
    if (!Number.isFinite(num)) return { value: undefined, error: `${field.name} must be a number.` };
    if (field.min !== undefined && num < field.min) return { value: undefined, error: `${field.name} must be >= ${field.min}.` };
    return { value: num };
  }

  if (field.type === "integer") {
    if (raw === undefined || raw === null || raw === "") {
      if (!field.required) return { value: field.default ?? null };
      return { value: undefined, error: `${field.name} is required.` };
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || !Number.isInteger(num)) return { value: undefined, error: `${field.name} must be an integer.` };
    if (field.min !== undefined && num < field.min) return { value: undefined, error: `${field.name} must be >= ${field.min}.` };
    return { value: num };
  }

  // text type
  const maxLen = field.maxLength ?? 500;
  if (raw === undefined || raw === null || raw === "") {
    if (field.required) return { value: undefined, error: `${field.name} is required.` };
    return { value: field.default ?? null };
  }
  const text = sanitizeText(String(raw).trim(), maxLen);
  if (field.required && !text) return { value: undefined, error: `${field.name} is required.` };
  if (field.enum && text && !field.enum.includes(text)) {
    return { value: undefined, error: `${field.name} must be one of: ${field.enum.join(", ")}.` };
  }
  return { value: text || (field.default ?? null) };
}

/**
 * Service-based CRUD route config.
 * Uses async service functions that handle validation, DB calls, and event emission.
 * The factory only handles auth, sanitize, and ownership checks.
 */
export interface ServiceCrudConfig<T extends OwnedRow> {
  /** Singular entity name for error messages. */
  entity: string;

  /** Async service functions — each handles validation → DB → emit event. */
  service: {
    list: (userId: number) => T[];
    get: (id: number) => T | undefined;
    create: (userId: number, input: Record<string, unknown>) => Promise<T>;
    update: (userId: number, id: number, input: Record<string, unknown>) => Promise<void | boolean>;
    delete: (userId: number, id: number) => Promise<void | boolean>;
  };

  /** Fields to sanitize on create. Only fields listed here are accepted. */
  createFields: CrudField[];

  /** Fields to sanitize on update. Only fields listed here are accepted. */
  updateFields: CrudField[];

  /** Optional: restrict ALL methods to a specific role. */
  requireRole?: Role;

  /** Optional: restrict create to specific roles. */
  createRole?: Role;

  /** Optional: custom validation before create (e.g., ownership checks). Return error message or undefined. */
  validateCreate?: (data: Record<string, unknown>) => string | undefined;

  /** Optional: custom validation before update. Return error message or undefined. */
  validateUpdate?: (data: Record<string, unknown>) => string | undefined;

  /** Optional: response key for the list endpoint. */
  listKey?: string;

  /** Optional: response key for the created/updated item. */
  itemKey?: string;
}

/**
 * Factory that returns GET/POST/PUT/DELETE handlers using a service layer.
 * Services handle validation, DB calls, and event emission — the factory
 * only handles auth, sanitize, and ownership checks.
 *
 * This is the primary way to create CRUD routes. It wires the full architecture:
 * Auth → Sanitize → Service (validate → DB → emit event) → Response
 *
 * Usage:
 *   const { GET, POST, PUT, DELETE } = createServiceCrudRoute({
 *     entity: "field",
 *     service: { list: listFields, get: getFieldById, create: createFieldService, ... },
 *     createFields: [{ name: "name", type: "text", required: true, maxLength: 120 }, ...],
 *     updateFields: [...],
 *   });
 */
export function createServiceCrudRoute<T extends OwnedRow>(config: ServiceCrudConfig<T>) {
  const { entity, service, createFields, updateFields, requireRole, createRole, validateCreate, validateUpdate } = config;
  const listKey = config.listKey ?? `${entity}s`;
  const itemKey = config.itemKey ?? entity;
  const singularCapital = entity.charAt(0).toUpperCase() + entity.slice(1);

  /** GET — list all entities for the signed-in user. */
  async function GET() {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (requireRole && user.role !== requireRole) {
      return forbidden(`Only ${requireRole}s can access ${entity} records.`);
    }
    const items = service.list(user.id);
    return NextResponse.json({ ok: true, [listKey]: items });
  }

  /** POST — create a new entity via service (validates, creates, emits event). */
  async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (requireRole && user.role !== requireRole) {
      return forbidden(`Only ${requireRole}s can manage ${entity} records.`);
    }
    if (createRole && user.role !== createRole) {
      return forbidden(`Only ${createRole}s can create ${entity} records.`);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    // Parse and sanitize all fields
    const data: Record<string, unknown> = {};
    for (const field of createFields) {
      const { value, error } = parseField(body, field);
      if (error) return badRequest(error);
      data[field.name] = value;
    }

    // Custom validation (e.g., ownership checks)
    if (validateCreate) {
      const err = validateCreate(data);
      if (err) return badRequest(err);
    }

    try {
      const item = await service.create(user.id, data);
      return NextResponse.json({ ok: true, [itemKey]: item }, { status: 201 });
    } catch (err: any) {
      return badRequest(err.message ?? `Failed to create ${entity}.`);
    }
  }

  /** PUT — update an existing entity via service. */
  async function PUT(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (requireRole && user.role !== requireRole) {
      return forbidden(`Only ${requireRole}s can manage ${entity} records.`);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    const id = Number(body.id);
    if (!Number.isFinite(id)) return badRequest(`${singularCapital} ID is required.`);

    const existing = service.get(id);
    if (!existing || existing.user_id !== user.id) {
      return notFound(`That ${entity} does not belong to your account.`);
    }

    // Parse and sanitize all fields
    const updates: Record<string, unknown> = {};
    for (const field of updateFields) {
      if (body[field.name] === undefined) continue;
      const { value, error } = parseField(body, field);
      if (error) return badRequest(error);
      updates[field.name] = value;
    }

    if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

    // Custom validation
    if (validateUpdate) {
      const err = validateUpdate(updates);
      if (err) return badRequest(err);
    }

    try {
      await service.update(user.id, id, updates);
      return NextResponse.json({ ok: true });
    } catch (err: any) {
      return badRequest(err.message ?? `Failed to update ${entity}.`);
    }
  }

  /** DELETE — delete an entity via service. */
  async function DELETE(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (requireRole && user.role !== requireRole) {
      return forbidden(`Only ${requireRole}s can manage ${entity} records.`);
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    const id = Number(body.id);
    if (!Number.isFinite(id)) return badRequest(`${singularCapital} ID is required.`);

    const existing = service.get(id);
    if (!existing || existing.user_id !== user.id) {
      return notFound(`That ${entity} does not belong to your account.`);
    }

    await service.delete(user.id, id);
    return NextResponse.json({ ok: true });
  }

  return { GET, POST, PUT, DELETE };
}

// ---------------------------------------------------------------------------
// Legacy CRUD factory — kept for backward compatibility.
// New routes should use createServiceCrudRoute() which wires the full
// service layer (validation → DB → events → notifications).
// ---------------------------------------------------------------------------

/**
 * Factory that returns GET/POST/PUT/DELETE handlers for a standard CRUD entity.
 *
 * Usage:
 *   const { GET, POST, PUT, DELETE } = createCrudRoute({
 *     entity: "field",
 *     db: { list: listFields, get: getFieldById, create: createField, ... },
 *     createFields: [{ name: "name", type: "text", required: true, maxLength: 120 }, ...],
 *     updateFields: [...],
 *   });
 */
export function createCrudRoute<T extends OwnedRow>(config: CrudRouteConfig<T>) {
  const { entity, db, createFields, updateFields, requireRole, createRole, validateCreate, validateUpdate, onCreate, onUpdate } = config;
  const listKey = config.listKey ?? `${entity}s`;
  const itemKey = config.itemKey ?? entity;
  const singularCapital = entity.charAt(0).toUpperCase() + entity.slice(1);

  /** GET — list all entities for the signed-in user. */
  async function GET() {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (requireRole && user.role !== requireRole) {
      return forbidden(`Only ${requireRole}s can access ${entity} records.`);
    }
    const items = db.list(user.id);
    return NextResponse.json({ ok: true, [listKey]: items });
  }

  /** POST — create a new entity. */
  async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (requireRole && user.role !== requireRole) {
      return forbidden(`Only ${requireRole}s can manage ${entity} records.`);
    }
    if (createRole && user.role !== createRole) {
      return forbidden(`Only ${createRole}s can create ${entity} records.`);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    // Parse and sanitize all fields
    const data: Record<string, unknown> = {};
    for (const field of createFields) {
      const { value, error } = parseField(body, field);
      if (error) return badRequest(error);
      data[field.name] = value;
    }

    // Custom validation
    if (validateCreate) {
      const err = validateCreate(data);
      if (err) return badRequest(err);
    }

    const item = db.create({ userId: user.id, ...data });
    if (onCreate) onCreate(item, user);
    return NextResponse.json({ ok: true, [itemKey]: item }, { status: 201 });
  }

  /** PUT — update an existing entity. */
  async function PUT(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (requireRole && user.role !== requireRole) {
      return forbidden(`Only ${requireRole}s can manage ${entity} records.`);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    const id = Number(body.id);
    if (!Number.isFinite(id)) return badRequest(`${singularCapital} ID is required.`);

    const existing = db.get(id);
    if (!existing || existing.user_id !== user.id) {
      return notFound(`That ${entity} does not belong to your account.`);
    }

    // Parse and sanitize all fields
    const updates: Record<string, unknown> = {};
    for (const field of updateFields) {
      if (body[field.name] === undefined) continue;
      const { value, error } = parseField(body, field);
      if (error) return badRequest(error);
      updates[field.name] = value;
    }

    if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

    // Custom validation
    if (validateUpdate) {
      const err = validateUpdate(updates);
      if (err) return badRequest(err);
    }

    db.update(id, updates, user.id);
    const updated = db.get(id);
    if (onUpdate && updated) onUpdate(updated, user);
    return NextResponse.json({ ok: true });
  }

  /** DELETE — delete an entity. */
  async function DELETE(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (requireRole && user.role !== requireRole) {
      return forbidden(`Only ${requireRole}s can manage ${entity} records.`);
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    const id = Number(body.id);
    if (!Number.isFinite(id)) return badRequest(`${singularCapital} ID is required.`);

    const existing = db.get(id);
    if (!existing || existing.user_id !== user.id) {
      return notFound(`That ${entity} does not belong to your account.`);
    }

    db.delete(id, user.id);
    return NextResponse.json({ ok: true });
  }

  return { GET, POST, PUT, DELETE };
}
