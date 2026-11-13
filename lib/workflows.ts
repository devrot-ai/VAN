/**
 * lib/workflows.ts — Composable workflow engine with compensation.
 *
 * Inspired by MercurJS workflow system: each business operation is a sequence of
 * typed steps. If any step fails, the workflow automatically runs compensation
 * (rollback) steps in reverse order. This ensures atomicity without transactions.
 */

/* ---------- Types ---------- */

export interface WorkflowContext {
  [key: string]: any
}

export interface StepResult {
  step: string
  result: any
  duration: number
}

export interface CompensationStep {
  (ctx: WorkflowContext): void | Promise<void>
}

export interface WorkflowStep {
  name: string
  execute: (ctx: WorkflowContext) => any | Promise<any>
  compensate?: CompensationStep
}

export interface WorkflowResult {
  success: boolean
  context: WorkflowContext
  steps: StepResult[]
  error?: Error
}

/* ---------- Step Builder ---------- */

export function step(
  name: string,
  execute: (ctx: WorkflowContext) => any | Promise<any>,
  compensate?: CompensationStep,
): WorkflowStep {
  return { name, execute, compensate }
}

/* ---------- Workflow Runner ---------- */

export async function runWorkflow(
  label: string,
  steps: WorkflowStep[],
  initialContext: WorkflowContext = {},
): Promise<WorkflowResult> {
  const ctx: WorkflowContext = { ...initialContext }
  const results: StepResult[] = []
  const completedSteps: WorkflowStep[] = []
  let error: Error | undefined

  for (const s of steps) {
    const t0 = Date.now()
    try {
      const result = await s.execute(ctx)
      ctx[s.name] = result
      results.push({ step: s.name, result, duration: Date.now() - t0 })
      completedSteps.push(s)
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      results.push({ step: s.name, result: undefined, duration: Date.now() - t0 })

      // Compensation: run compensating steps in reverse order
      try {
        await compensateSteps(completedSteps, ctx, label)
      } catch (compErr) {
        console.error(`[Workflow ${label}] Compensation error:`, compErr)
      }
      break
    }
  }

  return {
    success: error === undefined,
    context: ctx,
    steps: results,
    error,
  }
}

async function compensateSteps(steps: WorkflowStep[], ctx: WorkflowContext, label: string) {
  for (let i = steps.length - 1; i >= 0; i--) {
    const s = steps[i]
    if (s.compensate) {
      try {
        await s.compensate(ctx)
      } catch (err) {
        console.error(`[Workflow ${label}] Compensation failed for "${s.name}":`, err)
      }
    }
  }
}

/* ---------- Workflow Factory ---------- */

/**
 * Create a workflow with proper compensation tracking.
 * Returns a function that runs the workflow.
 */
export function createWorkflow(
  label: string,
  steps: WorkflowStep[],
) {
  return async (initialContext: WorkflowContext = {}): Promise<WorkflowResult> => {
    return runWorkflow(label, steps, initialContext)
  }
}

/* ---------- Common Step Helpers ---------- */

/** Create a step that emits an event */
export function emitStep(eventType: string, payloadFn: (ctx: WorkflowContext) => any): WorkflowStep {
  return step(eventType, async (ctx) => {
    const { events } = await import("./events")
    return events.emit(eventType, payloadFn(ctx))
  })
}

/** Create a step that validates input */
export function validateStep(fn: (ctx: WorkflowContext) => string | null): WorkflowStep {
  return step("validate", (ctx) => {
    const error = fn(ctx)
    if (error) throw new Error(error)
    return true
  })
}

/** Create a step that logs an audit event */
export function auditStep(eventFn: (ctx: WorkflowContext) => string): WorkflowStep {
  return step("audit", async (ctx) => {
    const { logAudit } = await import("./audit")
    const event = eventFn(ctx)
    await logAudit(event as any, Number(ctx.userId), ctx.entityId ?? undefined)
  })
}
