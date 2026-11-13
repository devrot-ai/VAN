import AppShell from "@/components/app/AppShell";
import AnalyticsBar from "@/components/app/AnalyticsBar";
import {
  PageHeader,
  Stat,
  Panel,
  EmptyState,
  ListRow,
} from "@/components/app/ui";
import AddTransactionForm from "@/components/app/AddTransactionForm";
import EditTransactionForm from "@/components/app/EditTransactionForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import { listBookings, listTransactions, type SafeUser } from "@/lib/db";
import { presentFinancePage, type TransactionListItem } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export default async function FinancePage() {
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const transactions = listTransactions(user.id);
  const bookings = listBookings(user.id);
  const data = presentFinancePage(transactions, bookings);

  return (
    <>
      <PageHeader
        eyebrow="Finance & Commerce"
        title="Know where your money stands."
        lead="Expenses, purchases, sales and receivables in one record — so you always have a current picture of the farm's finances."
      />

      <div className={styles.statGrid}>
        <Stat value={`$${data.stats.committedBookings.toFixed(0)}`} label="Committed bookings" />
        <Stat value={`$${data.stats.totalExpenses.toFixed(0)}`} label="Total expenses" />
        <Stat value={`$${data.stats.totalIncome.toFixed(0)}`} label="Total income" />
        <Stat value={String(data.stats.transactionsCount)} label="Transactions" />
      </div>

      <Panel title="Add transaction">
        <AddTransactionForm />
      </Panel>

      <div className={styles.grid2}>
        <Panel title="Ledger">
          {data.transactions.length === 0 ? (
            <EmptyState text="No transactions recorded yet." />
          ) : (
            <TransactionsList transactions={data.transactions} />
          )}
        </Panel>

        <Panel title="Your commitments">
          {data.commitments.length === 0 ? (
            <EmptyState text="No financial commitments yet." />
          ) : (
            <ul className={styles.list}>
              {data.commitments.map((b) => (
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

      {(data.expenseAnalytics.length > 0 || data.incomeAnalytics.length > 0) ? (
        <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
          {data.expenseAnalytics.length > 0 ? (
            <Panel title="Expenses by category">
              <AnalyticsBar items={data.expenseAnalytics} />
            </Panel>
          ) : null}
          {data.incomeAnalytics.length > 0 ? (
            <Panel title="Income by category">
              <AnalyticsBar items={data.incomeAnalytics} />
            </Panel>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function TransactionsList({ transactions }: { transactions: TransactionListItem[] }) {
  return (
    <SearchBar
      items={transactions}
      keyOf={(t) => `${t.description} ${t.category} ${t.type}`}
      placeholder="Search transactions…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          <EditableList
            items={filtered}
            renderEdit={(t, cancel) => (
              <EditTransactionForm
                id={t.id}
                initial={{ date: t.date, description: t.description, amount: t.amount, type: t.type, category: t.category ?? "" }}
                onCancel={cancel}
              />
            )}
            renderNormal={(t, setEditing) => (
              <li key={t.id} className={styles.listItem}>
                <span className={styles.listTitle}>{t.description}</span>
                <span className={styles.listMeta}>
                  <span>{t.date}{t.category ? ` · ${t.category}` : ""}</span>
                  <span className={styles.badge}>{t.type}</span>
                  <RowActions id={t.id} apiPath={`/api/transactions?id=${t.id}`} onEdit={() => setEditing(t.id)} />
                </span>
              </li>
            )}
          />
        </ul>
      )}
    </SearchBar>
  );
}
