import AppShell from "@/components/app/AppShell";
import {
  PageHeader,
  Stat,
  Panel,
  EmptyState,
  badgeClass,
} from "@/components/app/ui";
import { getCropCycleByIdService, getCropPlanByCycleService, listStagesByCycleService, listInputRequirementsByCycleService } from "@/lib/services";
import { getAssessmentById } from "@/lib/db/assessments";
import { getFieldById } from "@/lib/db/fields";
import { getFarmById } from "@/lib/db/farms";
import { listSoilMeasurements } from "@/lib/db/assessments";
import styles from "@/components/app/app.module.css";
import Link from "next/link";
import CropPlanEditor from "@/components/app/CropPlanEditor";
import StageManager from "@/components/app/StageManager";
import InputRequirementManager from "@/components/app/InputRequirementManager";

export default async function CropCycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AppShell allowed={["farmer", "operations"]}>
      {async (user) => {
        const { id } = await params;
        const cycleId = Number(id);
        if (!Number.isFinite(cycleId)) return <EmptyState text="Invalid crop cycle ID." />;

        let cycle;
        try {
          cycle = getCropCycleByIdService(user.id, cycleId);
        } catch {
          return <EmptyState text="Crop cycle not found or you don't have access." />;
        }

        const field = getFieldById(cycle.field_id);
        const farm = field?.farm_id ? getFarmById(field.farm_id) : null;
        const assessment = cycle.assessment_id ? getAssessmentById(cycle.assessment_id) : null;
        const measurements = assessment ? listSoilMeasurements(assessment.id) : [];
        let plan = null;
        try { plan = getCropPlanByCycleService(user.id, cycleId); } catch { /* no plan */ }
        let stages: any[] = [];
        try { stages = listStagesByCycleService(user.id, cycleId); } catch { /* no stages */ }
        let requirements: any[] = [];
        try { requirements = listInputRequirementsByCycleService(user.id, cycleId); } catch { /* no requirements */ }

        return <Inner
          cycle={cycle}
          field={field}
          farm={farm}
          assessment={assessment}
          measurements={measurements}
          plan={plan}
          stages={stages}
          requirements={requirements}
        />;
      }}
    </AppShell>
  );
}

function Inner({ cycle, field, farm, assessment, measurements, plan, stages, requirements }: {
  cycle: any;
  field: any;
  farm: any;
  assessment: any;
  measurements: any[];
  plan: any;
  stages: any[];
  requirements: any[];
}) {
  return (
    <>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        {farm ? <Link href="/app/farm">{farm.name}</Link> : "Farms"}
        {" → "}
        {field ? <Link href="/app/farm">{field.name}</Link> : "Field"}
        {" → "}
        <span style={{ color: "var(--text-muted)" }}>{cycle.crop_type}</span>
      </div>

      <PageHeader
        eyebrow="Crop Cycle"
        title={`${cycle.crop_type}${cycle.variety ? ` (${cycle.variety})` : ""}`}
        lead={
          `${field?.name || "Unknown field"}${farm ? ` · ${farm.name}` : ""}${cycle.season ? ` · ${cycle.season}` : ""}`
        }
      />

      <div className={styles.statGrid}>
        <Stat value={cycle.cultivated_area_ha ? `${cycle.cultivated_area_ha} ha` : "—"} label="Cultivated area" />
        <Stat value={cycle.planned_planting_date ? formatDate(cycle.planned_planting_date) : "—"} label="Planting date" />
        <Stat value={cycle.planned_harvest_date ? formatDate(cycle.planned_harvest_date) : "—"} label="Expected harvest" />
        <Stat value={cycle.status} label="Status" />
      </div>

      {/* Tabs */}
      <TabNavigation cycleId={cycle.id} />

      {/* Overview tab (always shown) */}
      <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Crop details">
          <div style={{ padding: "var(--space-5)" }}>
            <DetailRow label="Crop" value={cycle.crop_type} />
            <DetailRow label="Variety" value={cycle.variety || "—"} />
            <DetailRow label="Season" value={cycle.season || "—"} />
            <DetailRow label="Cultivated Area" value={cycle.cultivated_area_ha ? `${cycle.cultivated_area_ha} ha` : "—"} />
            <DetailRow label="Field" value={field?.name || "—"} />
            <DetailRow label="Farm" value={farm?.name || "—"} />
            <DetailRow label="Current Stage" value={cycle.current_stage || "—"} />
            <DetailRow label="Created" value={formatDate(cycle.created_at)} />
            {cycle.notes && <DetailRow label="Notes" value={cycle.notes} />}
          </div>
        </Panel>

        <Panel title="Linked assessment">
          <div style={{ padding: "var(--space-5)" }}>
            {assessment ? (
              <>
                <DetailRow label="Type" value={assessment.assessment_type} />
                <DetailRow label="Date" value={formatDate(assessment.assessment_date)} />
                <DetailRow label="Status" value={<span className={badgeClass(assessment.status)}>{assessment.status}</span>} />
                <DetailRow label="Assessor" value={assessment.assessor || "—"} />
                <div style={{ marginTop: "var(--space-3)" }}>
                  <Link href={`/app/intelligence/assessment?assessmentId=${assessment.id}`} className="text-sm font-medium text-[#728B51] hover:underline">
                    View full assessment →
                  </Link>
                </div>
                {measurements.length > 0 && (
                  <div style={{ marginTop: "var(--space-4)" }}>
                    <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--space-2)" }}>
                      Soil measurements
                    </p>
                    <MeasurementsList measurements={measurements} />
                  </div>
                )}
              </>
            ) : (
              <EmptyState text="No assessment linked to this crop cycle." />
            )}
          </div>
        </Panel>
      </div>

      {/* Crop Plan section */}
      <div style={{ marginTop: "var(--space-5)" }}>
        <CropPlanEditor cycleId={cycle.id} existingPlan={plan} />
      </div>

      {/* Growth Stages section */}
      <div style={{ marginTop: "var(--space-5)" }}>
        <StageManager cycleId={cycle.id} existingStages={stages} />
      </div>

      {/* Input Requirements section */}
      <div style={{ marginTop: "var(--space-5)" }}>
        <InputRequirementManager cycleId={cycle.id} existingRequirements={requirements} cultivatedAreaHa={cycle.cultivated_area_ha || 0} />
      </div>
    </>
  );
}

function TabNavigation({ cycleId }: { cycleId: number }) {
  const tabs = [
    { label: "Overview", href: `/app/crop-planning/${cycleId}` },
    { label: "Crop Plan", href: `/app/crop-planning/${cycleId}#plan` },
    { label: "Stages", href: `/app/crop-planning/${cycleId}#stages` },
    { label: "Inputs", href: `/app/crop-planning/${cycleId}#inputs` },
  ];

  return (
    <div style={{ display: "flex", gap: "var(--space-1)", marginBottom: "var(--space-5)", borderBottom: "1px solid var(--line)" }}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          style={{
            padding: "var(--space-3) var(--space-4)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--text-muted)",
            borderBottom: "2px solid transparent",
            textDecoration: "none",
            transition: "all 0.15s",
          }}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-2) 0", borderBottom: "1px solid var(--line)", fontSize: "var(--text-sm)" }}>
      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{value}</span>
    </div>
  );
}

function MeasurementsList({ measurements }: { measurements: any[] }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-2)" }}>
      {measurements.map((m: any) => (
        <div key={m.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", padding: "var(--space-1) 0" }}>
          <span style={{ color: "var(--text-muted)" }}>{m.parameter}</span>
          <span style={{ fontWeight: 600 }}>{m.value} {m.unit}</span>
        </div>
      ))}
    </div>
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
