import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import { getProviderEquipment, type SafeUser } from "@/lib/db";
import BookingRequestForm from "@/components/app/BookingRequestForm";
import styles from "@/components/app/app.module.css";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <Inner user={user} equipmentId={Number(id)} />}
    </AppShell>
  );
}

async function Inner({ user, equipmentId }: { user: SafeUser; equipmentId: number }) {
  const equipment = getProviderEquipment(equipmentId);
  if (!equipment) notFound();

  const rate =
    equipment.daily_rate != null ? `$${Number(equipment.daily_rate).toFixed(0)} per day` : "Rate on request";

  return (
    <>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/app/machinery">← Machinery marketplace</Link>
      </nav>

      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Equipment listing</span>
        <h1 className={styles.title}>{equipment.name}</h1>
        <p className={styles.lead}>
          {equipment.category ? `Category: ${equipment.category}. ` : ""}
          {rate}. Offered by {equipment.owner_farm ?? equipment.owner_name}
          {equipment.owner_location ? ` (${equipment.owner_location})` : ""}.
        </p>
      </header>

      <div className={`${styles.grid2} ${styles.marketGrid}`}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><span>Listing details</span></div>
          <table className={styles.table}>
            <tbody>
              <tr>
                <th scope="row">Availability</th>
                <td>{equipment.status === "available" ? "Available to book now" : equipment.status}</td>
              </tr>
              <tr>
                <th scope="row">Type</th>
                <td>{equipment.category ?? "—"}</td>
              </tr>
              <tr>
                <th scope="row">Rate</th>
                <td>{rate}</td>
              </tr>
              <tr>
                <th scope="row">Based at</th>
                <td>{equipment.location ?? equipment.owner_location ?? "—"}</td>
              </tr>
              <tr>
                <th scope="row">Owner</th>
                <td>{equipment.owner_farm ?? equipment.owner_name}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}><span>Request a booking</span></div>
          <div style={{ padding: "var(--space-5)" }}>
            {equipment.status === "maintenance" ? (
              <p className={styles.lead}>
                This machine is under maintenance and cannot be booked right now.
              </p>
            ) : (
              <BookingRequestForm equipmentId={equipment.id} />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
