import AppShell from "@/components/app/AppShell";
import { PageHeader, Stat, Panel } from "@/components/app/ui";
import { listMembers, type SafeUser } from "@/lib/db";
import styles from "@/components/app/app.module.css";

export default async function ReportsPage() {
  return (
    <AppShell allowed={["cooperative"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const members = listMembers(user.id);
  const active = members.filter((m) => m.status === "active").length;
  const fields = members.reduce((s, m) => s + Number(m.fields_count || 0), 0);
  return (
    <>
      <PageHeader eyebrow="Cooperative · Reports" title="Organisation reports" lead="Clear, aggregated reporting built on authorised member data." />
      <div className={styles.statGrid}>
        <Stat value={String(members.length)} label="Members" />
        <Stat value={String(active)} label="Active" />
        <Stat value={String(fields)} label="Total fields" />
        <Stat value="Q3 2026" label="Reporting period" />
      </div>
      <Panel title="Report builder">
        <div className={styles.empty} style={{ textAlign: "left" }}>
          Choose a period and metric to generate an organisation report. Summaries for
          season activity, shared bookings and member participation are available here as
          the cooperative grows.
        </div>
      </Panel>
    </>
  );
}
