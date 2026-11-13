import AppShell from "@/components/app/AppShell";
import { PageHeader, Stat, Panel, EmptyState } from "@/components/app/ui";
import { listDevices, type SafeUser } from "@/lib/db";
import { presentDevicesPage, type DeviceListItem } from "@/lib/presenters";
import AddDeviceForm from "@/components/app/AddDeviceForm";
import EditDeviceForm from "@/components/app/EditDeviceForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import styles from "@/components/app/app.module.css";

export default async function DevicesPage() {
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const devices = listDevices(user.id);
  const data = presentDevicesPage(devices);

  return (
    <>
      <PageHeader
        eyebrow="Devices"
        title="One home for your hardware."
        lead="Register devices once and see status, telemetry and alerts alongside the rest of your farm."
      />

      <div className={styles.statGrid}>
        <Stat value={String(data.stats.totalDevices)} label="Devices" />
        <Stat value={`${data.stats.online}/${data.stats.totalDevices}`} label="Online" />
        <Stat value={String(devices.filter((d) => d.status === "maintenance").length)} label="Maintenance" />
        <Stat value="2" label="Alerts (sample)" />
      </div>

      <Panel title="Connected devices">
        {data.devices.length === 0 ? (
          <EmptyState text="No devices registered yet." />
        ) : (
          <DevicesTable devices={data.devices} />
        )}
      </Panel>

      <div style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Register a device">
          <div style={{ padding: "var(--space-5)" }}>
            <AddDeviceForm />
          </div>
        </Panel>
      </div>

    </>
  );
}

function DevicesTable({ devices }: { devices: DeviceListItem[] }) {
  return (
    <SearchBar
      items={devices}
      keyOf={(d) => `${d.name} ${d.kind} ${d.location}`}
      placeholder="Search devices…"
    >
      {(filtered) => (
        <table className={styles.table}>
          <thead>
            <tr><th>Device</th><th>Kind</th><th>Location</th><th>Status</th><th style={{ width: "120px" }}>Actions</th></tr>
          </thead>
          <tbody>
            <EditableList
              items={filtered}
              colSpan={5}
              renderEdit={(d, cancel) => (
                <EditDeviceForm
                  id={d.id}
                  initial={{ name: d.name, kind: d.kind, status: d.status, location: d.location ?? "" }}
                  onCancel={cancel}
                />
              )}
              renderNormal={(d, setEditing) => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.kind}</td>
                  <td>{d.location ?? "—"}</td>
                  <td>{d.status}</td>
                  <td>
                    <RowActions id={d.id} apiPath={`/api/devices?id=${d.id}`} onEdit={() => setEditing(d.id)} />
                  </td>
                </tr>
              )}
            />
          </tbody>
        </table>
      )}
    </SearchBar>
  );
}
