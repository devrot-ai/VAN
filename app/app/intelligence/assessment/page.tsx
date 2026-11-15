import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, EmptyState, ListRow } from "@/components/app/ui";
import { type SafeUser } from "@/lib/db";
import { getAssessmentReportService } from "@/lib/services";
import AddMeasurementForm from "@/components/app/AddMeasurementForm";
import { SubmitButton, ApproveButton } from "@/components/app/AssessmentActions";
import styles from "@/components/app/app.module.css";
import Link from "next/link";

export default async function AssessmentDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ assessmentId?: string }>;
}) {
  return (
    <AppShell allowed={["farmer"]}>
      {async (user) => {
        const params = await searchParams;
        const assessmentId = params.assessmentId ? Number(params.assessmentId) : null;

        if (!assessmentId || !Number.isFinite(assessmentId)) {
          return (
            <>
              <PageHeader eyebrow="Land Intelligence" title="Assessment detail" />
              <EmptyState text="No assessment selected. Choose an assessment from the list." />
            </>
          );
        }

        const report = getAssessmentReportService(user.id, assessmentId);
        if (!report) {
          return (
            <>
              <PageHeader eyebrow="Land Intelligence" title="Assessment detail" />
              <EmptyState text="Assessment not found or you don't have access." />
            </>
          );
        }

        return <Detail assessment={report} user={user} />;
      }}
    </AppShell>
  );
}

function Detail({
  assessment,
  user,
}: {
  assessment: any;
  user: SafeUser;
}) {
  const isApproved = assessment.status === "approved";
  const isUnderReview = assessment.status === "under_review";
  const isDraft = assessment.status === "draft";
  const isOperations = user.role === "operations";
  // Only operations can approve; farmers can submit their own drafts
  const canApprove = isOperations && !isApproved;
  const canSubmit = !isOperations && isDraft && assessment.measurementCount > 0;

  return (
    <>
      <PageHeader
        eyebrow="Assessment"
        title={`${assessment.field?.name ?? "Field"} — ${formatType(assessment.assessment_type)}`}
        lead={`Assessment #${assessment.id} · ${assessment.status}`}
      />

      {/* Status message */}
      {isApproved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 mb-4">
          <p className="text-sm font-medium text-emerald-800">This assessment has been approved by VAN operations.</p>
          <p className="text-sm text-emerald-700 mt-1">Approved assessments are part of the farm's historical record and cannot be modified or deleted.</p>
          <div className="mt-2">
            <Link href="/app/crop-planning/new" className="text-sm font-medium text-[#183B2B] hover:underline">
              Start crop planning with this assessment →
            </Link>
          </div>
        </div>
      )}
      {isUnderReview && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
          <p className="text-sm font-medium text-amber-800">This assessment is awaiting review by VAN operations.</p>
        </div>
      )}

      <div className={styles.grid2}>
        {/* Assessment info */}
        <Panel title="Assessment details">
          <div style={{ padding: "var(--space-5)" }}>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Field</dt>
                <dd className="text-sm font-medium">{assessment.field?.name ?? `Field #${assessment.field_id}`}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Type</dt>
                <dd className="text-sm font-medium">{formatType(assessment.assessment_type)}</dd>
              </div>
              {assessment.assessor && (
                <div>
                  <dt className="text-sm text-gray-500">Assessor</dt>
                  <dd className="text-sm font-medium">{assessment.assessor}</dd>
                </div>
              )}
              {assessment.data_source && (
                <div>
                  <dt className="text-sm text-gray-500">Data source</dt>
                  <dd className="text-sm font-medium">{assessment.data_source}</dd>
                </div>
              )}
              {assessment.assessment_date && (
                <div>
                  <dt className="text-sm text-gray-500">Date</dt>
                  <dd className="text-sm font-medium">{assessment.assessment_date.slice(0, 10)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <span className={badgeClass(assessment.status)}>{assessment.status}</span>
                </dd>
              </div>
              {assessment.observations && (
                <div>
                  <dt className="text-sm text-gray-500">Observations</dt>
                  <dd className="text-sm">{assessment.observations}</dd>
                </div>
              )}
              {assessment.report && (
                <div>
                  <dt className="text-sm text-gray-500">Report</dt>
                  <dd className="text-sm">{assessment.report}</dd>
                </div>
              )}
            </dl>
          </div>
        </Panel>

        {/* Measurements */}
        <Panel title={`Soil measurements (${assessment.measurementCount})`}>
          {assessment.measurements.length === 0 ? (
            <EmptyState text="No measurements recorded yet. Add your first measurement below." />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {assessment.measurements.map((m: any) => (
                  <tr key={m.id}>
                    <td>{formatMeasurementType(m.measurement_type)}</td>
                    <td>{m.value}</td>
                    <td>{m.unit}</td>
                    <td>{m.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      {/* Add measurement form */}
      {assessment.status !== "approved" && (
        <div style={{ marginTop: "var(--space-5)" }}>
          <Panel title="Add measurement">
            <div style={{ padding: "var(--space-5)" }}>
              <AddMeasurementForm assessmentId={assessment.id} />
            </div>
          </Panel>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: "var(--space-5)" }}>
        <div className="flex gap-3">
          <Link href="/app/intelligence" className="text-sm font-medium text-[#728B51] hover:underline">
            ← Back to assessments
          </Link>
          {canSubmit && (
            <SubmitButton assessmentId={assessment.id} />
          )}
          {canApprove && (
            <ApproveButton assessmentId={assessment.id} />
          )}
        </div>
      </div>
    </>
  );
}


function formatType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatMeasurementType(type: string) {
  const labels: Record<string, string> = {
    pH: "pH",
    organic_carbon: "Organic Carbon",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    moisture: "Moisture",
    electrical_conductivity: "Electrical Conductivity",
    texture: "Soil Texture",
  };
  return labels[type] ?? formatType(type);
}

function badgeClass(status: string) {
  if (status === "approved") return `${styles.badge} ${styles.badgeLive}`;
  if (status === "draft" || status === "under_review") return `${styles.badge} ${styles.badgeMilestone}`;
  return styles.badge;
}
