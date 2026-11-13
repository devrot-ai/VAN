import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, ListRow, EmptyState } from "@/components/app/ui";
import { listHarvestAvailabilityRows, listHarvestAvailability, type HarvestAvailabilityRow, type HarvestAvailability } from "@/lib/db";
import SearchBar from "@/components/app/SearchBar";
import styles from "@/components/app/app.module.css";

export default async function AvailabilityPage() {
  const harvests = listHarvestAvailabilityRows();
  const fieldEstimates = listHarvestAvailability();

  return (
    <AppShell allowed={["buyer"]}>
      {() => (
        <>
          <PageHeader eyebrow="Buyer · Availability" title="Harvest availability" lead="See what farms have coming — clearly, without guesswork." />
          <Panel title="Ready & available harvests">
            {harvests.length === 0 ? (
              <EmptyState text="No harvests marked as ready or available yet. Farmers can record harvests and mark them available." />
            ) : (
              <HarvestsList harvests={harvests} />
            )}
          </Panel>
          {fieldEstimates.length > 0 ? (
            <div style={{ marginTop: "var(--space-5)" }}>
            <Panel title="Planted fields (estimated)">
              <FieldsList fields={fieldEstimates} />
            </Panel>
            </div>
          ) : null}
        </>
      )}
    </AppShell>
  );
}

function HarvestsList({ harvests }: { harvests: HarvestAvailabilityRow[] }) {
  return (
    <SearchBar
      items={harvests}
      keyOf={(h) => `${h.crop} ${h.farmer_name} ${h.farm_name}`}
      placeholder="Search harvests…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          {filtered.map((h) => (
            <ListRow
              key={h.harvest_id}
              title={`${h.crop} — ${h.quantity_tonnes} t`}
              meta={<span>{h.farmer_name}{h.farm_name ? ` · ${h.farm_name}` : ""} · {h.date}</span>}
              badge={h.status}
            />
          ))}
        </ul>
      )}
    </SearchBar>
  );
}

function FieldsList({ fields }: { fields: HarvestAvailability[] }) {
  return (
    <SearchBar
      items={fields}
      keyOf={(f) => `${f.crop} ${f.farm_name} ${f.location}`}
      placeholder="Search fields…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          {filtered.map((f) => (
            <ListRow
              key={f.field_id}
              title={`${f.crop} — ${f.farm_name ?? "Unnamed farm"}`}
              meta={<span>~{f.estimated_tonnes} t · {f.area_ha} ha{f.location ? ` · ${f.location}` : ""}</span>}
              badge={f.status ?? "planted"}
            />
          ))}
        </ul>
      )}
    </SearchBar>
  );
}
