import AppShell from "@/components/app/AppShell";
import { PageHeader, Stat, Panel, EmptyState, ListRow } from "@/components/app/ui";
import { listMembers, type SafeUser } from "@/lib/db";
import { presentCooperativeDashboard } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export default async function CooperativePage() {
  return (
    <AppShell allowed={["cooperative"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const members = listMembers(user.id);
  const data = presentCooperativeDashboard(members);

  return (
    <>
      <PageHeader
        eyebrow="Cooperative"
        title="Coordinate your member farms."
        lead="A governed view across members — shared bookings, coordination and reports — respecting what each member has authorised."
      />

      <div className={styles.statGrid}>
        <Stat value={String(data.stats.membersCount)} label="Members" />
        <Stat value={String(data.stats.activeCount)} label="Active" />
        <Stat value={String(data.stats.fieldsAcrossMembers)} label="Fields across members" />
        <Stat value={String(data.stats.sharedBookings)} label="Shared bookings" />
      </div>

      <div className={styles.grid2}>
        <Panel title="Members" href="/cooperative/members">
          {data.members.length === 0 ? (
            <EmptyState text="No members yet." />
          ) : (
            <ul className={styles.list}>
              {data.members.map((m) => (
                <ListRow key={m.id} title={m.name} meta={<span>{m.farm}</span>} badge={m.status} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent activity">
          <EmptyState text="Activity will appear here as members create bookings and update their farms." />
        </Panel>
      </div>
    </>
  );
}
