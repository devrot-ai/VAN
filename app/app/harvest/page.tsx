import AppShell from "@/components/app/AppShell";
import AddHarvestForm from "@/components/app/AddHarvestForm";
import EditHarvestForm from "@/components/app/EditHarvestForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import {
  PageHeader,
  Stat,
  Panel,
  EmptyState,
  ListRow,
} from "@/components/app/ui";
import { listFields, listBookings, listHarvests, type SafeUser } from "@/lib/db";
import { presentHarvestPage, type HarvestRecordItem } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export default async function HarvestPage() {
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const fields = listFields(user.id);
  const bookings = listBookings(user.id);
  const harvests = listHarvests(user.id);
  const data = presentHarvestPage(fields, bookings, harvests);

  return (
    <>
      <PageHeader
        eyebrow="Harvest & Logistics"
        title="From field to buyer, coordinated."
        lead="Plan lots, coordinate crews and equipment, and connect produce to transport, storage and buyers."
      />

      <div className={styles.statGrid}>
        <Stat value={String(data.stats.fieldsToHarvest)} label="Fields to harvest" />
        <Stat value={String(data.stats.transportBookings)} label="Transport bookings" />
        <Stat value={`${data.stats.totalTonnes.toFixed(1)} t`} label="Total harvested" />
        <Stat value={String(data.stats.readyForMarket)} label="Ready for market" />
      </div>

      <div className={styles.grid2}>
        <Panel title="Record harvest">
          <AddHarvestForm />
        </Panel>

        <Panel title="Harvest records">
          {data.harvests.length === 0 ? (
            <EmptyState text="No harvests recorded yet. Use the form to add one." />
          ) : (
            <HarvestsList harvests={data.harvests} />
          )}
        </Panel>
      </div>

      <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Crops in the ground">
          {data.cropFields.length === 0 ? (
            <EmptyState text="No crops planted yet." />
          ) : (
            <ul className={styles.list}>
              {data.cropFields.map((f) => (
                <ListRow key={f.id} title={f.name} meta={<span>{f.crop} · {f.area_ha} ha</span>} badge={f.status} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Transport & logistics bookings">
          {data.logistics.length === 0 ? (
            <EmptyState text="No logistics bookings yet." />
          ) : (
            <ul className={styles.list}>
              {data.logistics.map((b) => (
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
      </div>
    </>
  );
}

function HarvestsList({ harvests }: { harvests: HarvestRecordItem[] }) {
  return (
    <SearchBar
      items={harvests}
      keyOf={(h) => `${h.crop} ${h.field_name} ${h.status}`}
      placeholder="Search harvests…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          <EditableList
            items={filtered}
            renderEdit={(h, cancel) => (
              <EditHarvestForm
                id={h.id}
                initial={{ fieldId: h.field_id, crop: h.crop, quantityTonnes: h.quantity_tonnes, date: h.date, quality: h.quality ?? "", status: h.status }}
                onCancel={cancel}
              />
            )}
            renderNormal={(h, setEditing) => (
              <li key={h.id} className={styles.listItem}>
                <span className={styles.listTitle}>{h.crop} — {h.quantity_tonnes} t</span>
                <span className={styles.listMeta}>
                  <span>{h.field_name ?? "Unknown field"} · {h.date}</span>
                  <span className={styles.badge}>{h.status}</span>
                  <RowActions id={h.id} apiPath={`/api/harvests?id=${h.id}`} onEdit={() => setEditing(h.id)} />
                </span>
              </li>
            )}
          />
        </ul>
      )}
    </SearchBar>
  );
}
