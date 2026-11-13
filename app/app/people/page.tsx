import AppShell from "@/components/app/AppShell";
import {
  PageHeader,
  Panel,
  EmptyState,
  ListRow,
} from "@/components/app/ui";
import { listBookings, listProviders, type SafeUser } from "@/lib/db";
import styles from "@/components/app/app.module.css";

export default async function PeoplePage() {
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const jobs = listBookings(user.id).filter((b) => b.kind === "service");
  const providers = listProviders();

  return (
    <>
      <PageHeader
        eyebrow="People & Services"
        title="Find help, track the work."
        lead="Workers, operators, contractors, consultants and technicians — with profiles, jobs and clear outcomes."
      />

      <div className={styles.grid2}>
        <Panel title="Your service jobs">
          {jobs.length === 0 ? (
            <EmptyState text="No service jobs yet." />
          ) : (
            <ul className={styles.list}>
              {jobs.map((b) => (
                <ListRow
                  key={b.id}
                  title={b.title}
                  meta={<span>{b.counterparty ?? ""} · {b.when_date ?? ""}</span>}
                  badge={b.status}
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Provider directory">
          {providers.length === 0 ? (
            <EmptyState text="No providers registered yet." />
          ) : (
            <ul className={styles.list}>
              {providers.map((p) => (
                <ListRow
                  key={p.id}
                  title={p.name}
                  meta={<span>{p.equipment_count} equipment · {p.location ?? p.farm_name ?? "No location"}</span>}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
