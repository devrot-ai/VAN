import { requireRole } from "@/lib/guard";
import { PORTAL_NAV } from "@/lib/nav";
import type { Role, SafeUser } from "@/lib/db";
import Sidebar from "./Sidebar";
import ErrorBoundary from "./ErrorBoundary";
import styles from "./app.module.css";

export default async function AppShell({
  allowed,
  children,
}: {
  allowed: Role[];
  children: (user: SafeUser) => React.ReactNode;
}) {
  const user = await requireRole(allowed);
  return (
    <div className={styles.shell}>
      <Sidebar items={PORTAL_NAV[user.role]} user={user} />
      <main className={styles.main}>
        <ErrorBoundary>{children(user)}</ErrorBoundary>
      </main>
    </div>
  );
}
