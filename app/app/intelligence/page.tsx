import AppShell from "@/components/app/AppShell";
import WeatherPanel from "@/components/app/WeatherPanel";
import {
  PageHeader,
  Stat,
  Panel,
  EmptyState,
  ListRow,
} from "@/components/app/ui";
import { listFields, type SafeUser } from "@/lib/db";
import { listAssessmentsService } from "@/lib/services";
import { presentIntelligencePage } from "@/lib/presenters";
import AddAssessmentForm from "@/components/app/AddAssessmentForm";
import SearchBar from "@/components/app/SearchBar";
import styles from "@/components/app/app.module.css";
import Link from "next/link";

export default async function IntelligencePage() {
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const fields = listFields(user.id);
  const assessments = listAssessmentsService(user.id);
  const data = presentIntelligencePage(fields);

  const approvedCount = assessments.filter((a) => a.status === "approved").length;
  const draftCount = assessments.filter((a) => a.status === "draft").length;

  return (
    <>
      <PageHeader
        eyebrow="Land Intelligence"
        title="Understand your fields, not just see them."
        lead="Assess your land, record soil measurements and track quality over time. Remote sensing and yield estimation are added when real, validated integrations exist."
      />

      <div className={styles.statGrid}>
        <Stat value={String(assessments.length)} label="Assessments" />
        <Stat value={String(approvedCount)} label="Approved" />
        <Stat value={String(draftCount)} label="Draft" />
        <Stat value={String(fields.length)} label="Fields" />
      </div>

      <div className={styles.grid2}>
        {/* Assessments list */}
        <Panel title="Assessments">
          {assessments.length === 0 ? (
            <EmptyState text="No assessments yet. Create your first assessment below." />
          ) : (
            <AssessmentsList assessments={assessments} fields={fields} />
          )}
        </Panel>

        {/* Create assessment */}
        <Panel title="Create assessment">
          <div style={{ padding: "var(--space-5)" }}>
            <AddAssessmentForm
              fields={fields.map((f) => ({ id: f.id, name: f.name }))}
            />
          </div>
        </Panel>
      </div>

      {/* Fields with assessment status */}
      <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Fields with assessment status">
          {fields.length === 0 ? (
            <EmptyState text="No fields to assess. Add fields in the Farm section first." />
          ) : (
            <ul className={styles.list}>
              {fields.map((f) => {
                const fieldAssessments = assessments.filter((a) => a.field_id === f.id);
                const latestApproved = fieldAssessments.find((a) => a.status === "approved");
                return (
                  <li key={f.id} className={styles.listItem}>
                    <div>
                      <span className={styles.listTitle}>{f.name}</span>
                      <span className={styles.listMeta}>
                        <span>{f.area_ha} ha</span>
                        {f.crop ? <span>{f.crop}</span> : null}
                      </span>
                    </div>
                    <span className={styles.listMeta}>
                      {fieldAssessments.length > 0 ? (
                        <span>{fieldAssessments.length} assessment{fieldAssessments.length !== 1 ? "s" : ""}</span>
                      ) : (
                        <span className="text-amber-600">Not assessed</span>
                      )}
                      {latestApproved ? (
                        <span className={`${styles.badge} ${styles.badgeLive}`}>Approved</span>
                      ) : null}
                      <Link
                        href={`/app/intelligence?fieldId=${f.id}`}
                        className="text-sm font-medium text-[#728B51] hover:underline ml-2"
                      >
                        Assess →
                      </Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Weather — live">
          <WeatherPanel location={user.location} />
        </Panel>
      </div>

      {/* Capability notes */}
      <div className={styles.panel} style={{ marginTop: "var(--space-5)" }}>
        <div className={styles.panelHeader}><span>Capability notes</span></div>
        <ul className={styles.list}>
          <ListRow title="Satellite observations" meta={<span>Not yet integrated — will appear here when a real feed is connected.</span>} />
          <ListRow title="Yield estimation" meta={<span>Requires a validated model — not shown until then.</span>} />
          <ListRow title="Historical performance" meta={<span>Rebuilds from your own field and activity records over time.</span>} />
        </ul>
      </div>
    </>
  );
}

// --- Client component for assessments list with search ---

function AssessmentsList({
  assessments,
  fields,
}: {
  assessments: Array<{
    id: number;
    field_id: number;
    assessment_type: string;
    assessment_date: string | null;
    assessor: string | null;
    status: string;
    observations: string | null;
  }>;
  fields: Array<{ id: number; name: string }>;
}) {
  const getFieldName = (fieldId: number) => fields.find((f) => f.id === fieldId)?.name ?? `Field #${fieldId}`;

  return (
    <SearchBar
      items={assessments}
      keyOf={(a) => `${getFieldName(a.field_id)} ${a.assessment_type} ${a.status}`}
      placeholder="Search assessments…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          {filtered.map((a) => (
            <li key={a.id} className={styles.listItem}>
              <div>
                <span className={styles.listTitle}>{getFieldName(a.field_id)}</span>
                <span className={styles.listMeta}>
                  <span>{formatAssessmentType(a.assessment_type)}</span>
                  {a.assessment_date ? <span>{a.assessment_date.slice(0, 10)}</span> : null}
                  {a.assessor ? <span>{a.assessor}</span> : null}
                </span>
              </div>
              <span className={styles.listMeta}>
                <Link
                  href={`/app/intelligence/assessment?assessmentId=${a.id}`}
                  className="text-sm font-medium text-[#728B51] hover:underline"
                >
                  View →
                </Link>
                <span className={badgeClass(a.status)}>{a.status}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </SearchBar>
  );
}

function formatAssessmentType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function badgeClass(status: string) {
  if (status === "approved") return `${styles.badge} ${styles.badgeLive}`;
  if (status === "draft" || status === "under_review") return `${styles.badge} ${styles.badgeMilestone}`;
  return styles.badge;
}
