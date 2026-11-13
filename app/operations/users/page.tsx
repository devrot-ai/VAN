import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel } from "@/components/app/ui";
import { listAllUsers, type SafeUser } from "@/lib/db";
import RoleChangeSelect from "@/components/app/RoleChangeSelect";
import styles from "@/components/app/app.module.css";

export default async function OperationsUsersPage() {
  return (
    <AppShell allowed={["operations"]}>
      {() => {
        const users = listAllUsers();
        return (
          <>
            <PageHeader eyebrow="Operations · Users" title="Registered users" lead="Manage roles and accounts on the platform." />
            <Panel title="Users">
              <table className={styles.table}>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Farm / business</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <RoleChangeSelect userId={u.id} currentRole={u.role} />
                      </td>
                      <td>{u.farm_name ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </>
        );
      }}
    </AppShell>
  );
}
