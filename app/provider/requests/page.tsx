import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, EmptyState, ListRow } from "@/components/app/ui";
import { listBookings, type BookingRow, type SafeUser } from "@/lib/db";
import BookingRespond from "@/components/app/BookingRespond";
import SearchBar from "@/components/app/SearchBar";
import styles from "@/components/app/app.module.css";

export default async function RequestsPage() {
  return (
    <AppShell allowed={["provider"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const allRequests = listBookings(user.id).filter((b) => b.kind === "request");
  const pending = allRequests.filter((r) => r.status === "pending");
  const handled = allRequests.filter((r) => r.status !== "pending");

  return (
    <>
      <PageHeader
        eyebrow="Provider · Requests"
        title="Booking requests"
        lead="Review and respond to incoming hire requests. Your decision reaches the farmer immediately."
      />

      <Panel title={`Pending (${pending.length})`}>
        {pending.length === 0 ? (
          <EmptyState text="No pending requests right now." />
        ) : (
          <RequestsList requests={pending} showRespond />
        )}
      </Panel>

      <Panel title="Handled">
        {handled.length === 0 ? (
          <EmptyState text="Requests you respond to appear here." />
        ) : (
          <RequestsList requests={handled} />
        )}
      </Panel>
    </>
  );
}

function RequestsList({ requests, showRespond }: { requests: BookingRow[]; showRespond?: boolean }) {
  return (
    <SearchBar
      items={requests}
      keyOf={(r) => `${r.title} ${r.counterparty}`}
      placeholder="Search requests…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          {filtered.map((r) => (
            <li key={r.id} className={styles.listItem}>
              <span className={styles.listTitle}>{r.title}</span>
              <span className={styles.listMeta}>
                <span>{r.counterparty ?? "Farmer"}</span>
                <span>{r.when_date ?? ""}{r.end_date ? ` → ${r.end_date}` : ""}</span>
                {r.amount != null ? <span>${Number(r.amount).toFixed(0)}{r.kind === "request" ? "/day" : ""}</span> : null}
                {showRespond ? <BookingRespond bookingId={r.id} /> : null}
                {r.status ? <span className={styles.badge}>{r.status}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SearchBar>
  );
}
