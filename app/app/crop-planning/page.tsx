import AppShell from "@/components/app/AppShell";
import {
  PageHeader,
  Stat,
  Panel,
  EmptyState,
  badgeClass,
} from "@/components/app/ui";
import { listCropCyclesService } from "@/lib/services";
import { listFarmsService } from "@/lib/services";
import { listFields } from "@/lib/db";
import styles from "@/components/app/app.module.css";
import Link from "next/link";
import CropCyclesFilters from "@/components/app/CropCyclesFilters";

export default async function CropPlanningPage() {
  return (
    <AppShell allowed={["farmer", "operations"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: any }) {
  const cycles = listCropCyclesService(user.id);
  const farms = listFarmsService(user.id);
  const fields = listFields(user.id);

  // Build a field lookup for cycle display
  const fieldMap = new Map(fields.map((f: any) => [f.id, f]));
  const farmMap = new Map(farms.map((f: any) => [f.id, f]));

  // Stats
  const totalCycles = cycles.length;
  const activeCycles = cycles.filter((c: any) => c.status === "active").length;
  const plannedCycles = cycles.filter((c: any) => c.status === "planned").length;
  const harvestingCycles = cycles.filter((c: any) => c.status === "harvesting").length;

  return (
    <>
      <PageHeader
        eyebrow="Crop Planning"
        title="Plan and manage your crop cycles."
        lead="From land assessment through harvest — create crop plans, track growth stages and plan input requirements."
      />

      <div className={styles.statGrid}>
        <Stat value={String(totalCycles)} label="Total cycles" />
        <Stat value={String(activeCycles)} label="Active" />
        <Stat value={String(plannedCycles)} label="Planned" />
        <Stat value={String(harvestingCycles)} label="Harvesting" />
      </div>

      <div className={styles.grid2}>
        <Panel title="Crop cycles" href="/app/crop-planning/new" actionLabel="+ New cycle">
          {cycles.length === 0 ? (
            <EmptyState text="No crop cycles yet. Create your first crop cycle to begin planning." />
          ) : (
            <CropCyclesFilters
              cycles={cycles}
              farms={farms}
              fields={fields}
              fieldMap={fieldMap}
              farmMap={farmMap}
            />
          )}
        </Panel>

        <Panel title="Quick actions">
          <div style={{ padding: "var(--space-5)" }}>
            <div style={{ display: "grid", gap: "var(--space-3)" }}>
              <Link
                href="/app/crop-planning/new"
                className="text-sm font-medium text-[#728B51] hover:underline"
                style={{ padding: "var(--space-3) var(--space-4)", background: "var(--surface-page)", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)", textDecoration: "none", display: "block" }}
              >
                Create new crop cycle →
              </Link>
              <Link
                href="/app/farm"
                className="text-sm font-medium text-[#728B51] hover:underline"
                style={{ padding: "var(--space-3) var(--space-4)", background: "var(--surface-page)", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)", textDecoration: "none", display: "block" }}
              >
                Manage farms and fields →
              </Link>
              <Link
                href="/app/intelligence"
                className="text-sm font-medium text-[#728B51] hover:underline"
                style={{ padding: "var(--space-3) var(--space-4)", background: "var(--surface-page)", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)", textDecoration: "none", display: "block" }}
              >
                View land assessments →
              </Link>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}
