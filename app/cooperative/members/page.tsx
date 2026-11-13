import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, EmptyState } from "@/components/app/ui";
import { listMembers, type MemberRow, type SafeUser } from "@/lib/db";
import EditMemberForm from "@/components/app/EditMemberForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import styles from "@/components/app/app.module.css";

export default async function MembersPage() {
  return (
    <AppShell allowed={["cooperative"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const members = listMembers(user.id);
  return (
    <>
      <PageHeader eyebrow="Cooperative · Members" title="Member records" lead="Only what each member has authorised is visible here." />
      <Panel title="Members">
        {members.length === 0 ? (
          <EmptyState text="No members yet." />
        ) : (
          <MembersTable members={members} />
        )}
      </Panel>
    </>
  );
}

function MembersTable({ members }: { members: MemberRow[] }) {
  return (
    <SearchBar
      items={members}
      keyOf={(m) => `${m.name} ${m.farm} ${m.status}`}
      placeholder="Search members…"
    >
      {(filtered) => (
        <table className={styles.table}>
          <thead>
            <tr><th>Member</th><th>Farm</th><th>Fields</th><th>Status</th><th style={{ width: "120px" }}>Actions</th></tr>
          </thead>
          <tbody>
            <EditableList
              items={filtered}
              colSpan={5}
              renderEdit={(m, cancel) => (
                <EditMemberForm
                  id={m.id}
                  initial={{ name: m.name, farm: m.farm ?? "", status: m.status, fieldsCount: m.fields_count }}
                  onCancel={cancel}
                />
              )}
              renderNormal={(m, setEditing) => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.farm ?? "—"}</td>
                  <td>{m.fields_count}</td>
                  <td>{m.status}</td>
                  <td>
                    <RowActions id={m.id} apiPath={`/api/members?id=${m.id}`} onEdit={() => setEditing(m.id)} />
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
