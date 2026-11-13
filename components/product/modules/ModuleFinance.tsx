/**
 * VAN Product — Finance Module
 *
 * Financial picture of the selected farm and crop cycle.
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import { demoTransactions } from "@/lib/simulation/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DollarSign, TrendingUp, TrendingDown, Eye } from "lucide-react";
import styles from "./modules.module.css";

const CATEGORY_LABELS: Record<string, string> = {
  "input-cost": "Input Cost",
  "machinery-cost": "Machinery Cost",
  "labour-cost": "Labour Cost",
  "harvest-cost": "Harvest Cost",
  "storage-cost": "Storage Cost",
  "transport-cost": "Transport Cost",
  "sales-revenue": "Sales Revenue",
  "other": "Other",
};

export default function ModuleFinance() {
  const { openIn3D } = useProduct();

  const revenues = demoTransactions
    .filter((t) => t.category === "sales-revenue")
    .reduce((sum, t) => sum + t.amount, 0);
  const costs = demoTransactions
    .filter((t) => t.category !== "sales-revenue")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const profitability = revenues - costs;
  const pending = demoTransactions.filter((t) => t.status === "pending").reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Group costs by category
  const costByCategory: Record<string, number> = {};
  demoTransactions
    .filter((t) => t.category !== "sales-revenue")
    .forEach((t) => {
      costByCategory[t.category] = (costByCategory[t.category] || 0) + Math.abs(t.amount);
    });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Finance</h1>
          <p className={styles.pageSubtitle}>
            Crop-cycle financial summary — illustrative demonstration data
          </p>
        </div>
        <button
          className={styles.actionBtn}
          onClick={() => openIn3D({ stage: "finance" })}
        >
          <Eye className={styles.actionIcon} />
          View in 3D
        </button>
      </div>

      {/* Financial Summary */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <TrendingUp className={styles.statIcon} style={{ color: "#285c49" }} />
          <div>
            <div className={`${styles.statValue} ${styles.positive}`}>${revenues.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Revenue</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <TrendingDown className={styles.statIcon} style={{ color: "#b91c1c" }} />
          <div>
            <div className={`${styles.statValue} ${styles.negative}`}>${costs.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Costs</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <DollarSign className={styles.statIcon} style={{ color: profitability >= 0 ? "#285c49" : "#b91c1c" }} />
          <div>
            <div className={`${styles.statValue} ${profitability >= 0 ? styles.positive : styles.negative}`}>
              ${profitability.toLocaleString()}
            </div>
            <div className={styles.statLabel}>Est. Profitability</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <DollarSign className={styles.statIcon} style={{ color: "#c48a47" }} />
          <div>
            <div className={styles.statValue}>${pending.toLocaleString()}</div>
            <div className={styles.statLabel}>Outstanding</div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className={styles.financeGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.costBreakdown}>
              {Object.entries(costByCategory).map(([cat, amount]) => {
                const pct = costs > 0 ? (amount / costs) * 100 : 0;
                return (
                  <div key={cat} className={styles.costItem}>
                    <div className={styles.costItemHeader}>
                      <span className={styles.costItemLabel}>{CATEGORY_LABELS[cat] || cat}</span>
                      <span className={styles.costItemValue}>${amount.toLocaleString()}</span>
                    </div>
                    <div className={styles.costBar}>
                      <div
                        className={styles.costBarFill}
                        style={{ width: `${pct}%`, background: "#285c49" }}
                      />
                    </div>
                    <span className={styles.costItemPct}>{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Profitability Note */}
        <Card className={styles.profitCard}>
          <CardHeader>
            <CardTitle>Crop-Cycle Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.profitResult}>
              <div className={styles.profitNumber}>
                {profitability >= 0 ? "+" : ""}${profitability.toLocaleString()}
              </div>
              <div className={styles.profitLabel}>
                {profitability >= 0 ? "Positive" : "Negative"} crop-cycle result
              </div>
              <p className={styles.profitNote}>
                This is an illustrative estimate based on demonstration data. Actual profitability depends on many
                factors including weather, market prices, and operational efficiency.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className={styles.transactionsCard}>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{CATEGORY_LABELS[tx.category] || tx.category}</Badge>
                  </TableCell>
                  <TableCell
                    className={tx.amount >= 0 ? styles.amountPositive : styles.amountNegative}
                  >
                    {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.status === "settled"
                          ? "default"
                          : tx.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
