import Link from "next/link";
import AppShell from "@/components/app/AppShell";
import {
  PageHeader,
  Stat,
  Panel,
  EmptyState,
  ListRow,
} from "@/components/app/ui";
import { listBookings, listProviderEquipment, type SafeUser } from "@/lib/db";
import { presentMachineryPage } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export const metadata = { title: "Machinery — VAN" };

const CATEGORIES = [
  { value: "", label: "All types" },
  { value: "tractor", label: "Tractors" },
  { value: "implements", label: "Implements" },
  { value: "trailer", label: "Trailers" },
  { value: "harvester", label: "Harvesters" },
  { value: "irrigation", label: "Irrigation" },
];

export default async function MachineryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; where?: string; available?: string }>;
}) {
  const filters = await searchParams;
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => (
        <MachineryMarket
          user={user}
          filters={filters}
        />
      )}
    </AppShell>
  );
}

async function MachineryMarket({
  user,
  filters,
}: {
  user: SafeUser;
  filters: { type?: string; where?: string; available?: string };
}) {
  const state = {
    category: filters.type ?? "",
    location: filters.where ?? "",
    available: filters.available === "1",
  };

  const listings = listProviderEquipment({
    category: state.category || undefined,
    location: state.location || undefined,
    available: state.available,
  });
  const allListings = listProviderEquipment({});
  const bookings = listBookings(user.id);
  const data = presentMachineryPage(listings, allListings, bookings);

  return (
    <>
      <PageHeader
        eyebrow="Machinery"
        title="Find and book the right machine."
        lead="Real listings from equipment owners on the platform. Compare types, locations and rates, then request a booking with your dates."
      />

      <div className={styles.statGrid}>
        <Stat value={String(data.stats.totalListings)} label="Listings on the platform" />
        <Stat value={String(data.stats.availableNow)} label="Available now" />
        <Stat value={String(data.stats.userBookings)} label="Your bookings" />
        <Stat value={`$${data.stats.committed.toFixed(0)}`} label="Committed" />
      </div>

      <section className={styles.panel} aria-label="Search machinery">
        <div className={styles.panelHeader}><span>Search listings</span></div>
        <form className={styles.marketFilters} method="get" action="/app/machinery">
          <label className={styles.filterField}>
            <span>Equipment type</span>
            <select name="type" defaultValue={state.category}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterField}>
            <span>Location</span>
            <input name="where" placeholder="Near a town or region" defaultValue={state.location} />
          </label>
          <label className={styles.filterCheck}>
            <input type="checkbox" name="available" value="1" defaultChecked={state.available} />
            <span>Available to book</span>
          </label>
          <button type="submit" className={styles.filterSubmit}>Search</button>
          <Link href="/app/machinery" className={styles.filterClear}>Clear</Link>
        </form>
      </section>

      <div className={`${styles.grid2} ${styles.marketGrid}`}>
        <Panel title={`Listings (${data.listings.length})`}>
          {data.listings.length === 0 ? (
            <EmptyState text="No matching listings yet. Clear filters or try a wider location." />
          ) : (
            <ul className={styles.list}>
              {data.listings.map((l) => (
                <li key={l.id} className={styles.listItem}>
                  <span className={styles.listTitle}>
                    <Link href={`/app/machinery/${l.id}`} className={styles.listLink}>{l.name}</Link>
                  </span>
                  <span className={styles.listMeta}>
                    <span>{l.owner_farm ?? l.owner_name}{l.owner_location ? ` · ${l.owner_location}` : ""}</span>
                    {l.daily_rate != null ? <span>${Number(l.daily_rate).toFixed(0)}/day</span> : null}
                    <span className={l.status === "available" ? `${styles.badge} ${styles.badgeLive}` : styles.badge}>{l.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <Panel title="Your bookings" href="/app/machinery">
            {data.bookings.length === 0 ? (
              <EmptyState text="No machinery bookings yet — request one from a listing." />
            ) : (
              <ul className={styles.list}>
                {data.bookings.map((b) => (
                  <ListRow
                    key={b.id}
                    title={b.title}
                    meta={<span>{b.counterparty ?? ""} · {b.when_date ?? ""}{b.end_date ? ` → ${b.end_date}` : ""}</span>}
                    badge={b.status}
                  />
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="How booking works">
            <ul className={styles.list}>
              <ListRow title="1 · Search & compare" meta={<span>Filter by type, location and availability; see rates side by side.</span>} />
              <ListRow title="2 · Request" meta={<span>Send a request with your dates and scope of work.</span>} />
              <ListRow title="3 · Owner responds" meta={<span>Accepted or declined — you see the decision in your bookings.</span>} />
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
