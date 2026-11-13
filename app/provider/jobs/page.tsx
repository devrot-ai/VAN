import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, EmptyState, ListRow } from "@/components/app/ui";
import { listBookings, type SafeUser } from "@/lib/db";
import styles from "@/components/app/app.module.css";

export default async function JobsPage() {
  return (
    <AppShell allowed={["provider"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const jobs = listBookings(user.id).filter((b) => b.kind === "request");
  return (
    <>
      <PageHeader eyebrow="Provider · Jobs" title="Jobs & status" lead="Track assigned work from booking to completion evidence." />
      <Panel title="All jobs">
        {jobs.length === 0 ? (
          <EmptyState text="No jobs yet." />
        ) : (
          <ul className={styles.list}>
            {jobs.map((j) => (
              <ListRow key={j.id} title={j.title} meta={<span>{j.counterparty ?? ""} · {j.when_date ?? ""}</span>} badge={j.status} />
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
