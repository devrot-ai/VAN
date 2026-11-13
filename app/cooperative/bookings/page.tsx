import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, ListRow, EmptyState } from "@/components/app/ui";
import { listCooperativeBookings, type CooperativeBooking, type SafeUser } from "@/lib/db";
import SearchBar from "@/components/app/SearchBar";
import styles from "@/components/app/app.module.css";

export default async function SharedBookingsPage() {
  return (
    <AppShell allowed={["cooperative"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const bookings = listCooperativeBookings(user.id);

  return (
    <>
      <PageHeader eyebrow="Cooperative · Bookings" title="Shared bookings" lead="Coordinate equipment and labour across member farms with transparent allocation." />
      <Panel title="Shared bookings">
        {bookings.length === 0 ? (
          <EmptyState text="No member bookings yet." />
        ) : (
          <BookingsList bookings={bookings} />
        )}
      </Panel>
    </>
  );
}

function BookingsList({ bookings }: { bookings: CooperativeBooking[] }) {
  return (
    <SearchBar
      items={bookings}
      keyOf={(b) => `${b.title} ${b.member_name} ${b.farm}`}
      placeholder="Search bookings…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          {filtered.map((b) => (
            <ListRow
              key={b.booking_id}
              title={b.title}
              meta={<span>{b.member_name} · {b.farm ?? "No farm"}</span>}
              badge={b.status}
            />
          ))}
        </ul>
      )}
    </SearchBar>
  );
}
