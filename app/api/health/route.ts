import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const startTime = Date.now();

/**
 * Health check endpoint.
 * Tests database connectivity and returns platform status.
 * GET /api/health -> { status, db, uptime }
 */
export function GET() {
  try {
    const db = getDb();
    db.prepare("SELECT 1").get();
    return NextResponse.json({
      status: "ok",
      db: "connected",
      uptime: Math.floor((Date.now() - startTime) / 1000),
    });
  } catch {
    return NextResponse.json(
      { status: "error", db: "disconnected", uptime: Math.floor((Date.now() - startTime) / 1000) },
      { status: 500 },
    );
  }
}
