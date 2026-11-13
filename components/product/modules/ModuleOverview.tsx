/**
 * VAN Product — Overview Module
 *
 * Dashboard showing farm summary, active fields, crops, operations,
 * machinery activity, inventory and financial overview.
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import {
  demoAssessments,
  demoInputs,
  demoEquipment,
  demoOperations,
  demoHarvests,
  demoStorage,
  demoShipments,
  demoTransactions,
} from "@/lib/simulation/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  Wheat,
  Tractor,
  CalendarDays,
  Package,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import styles from "./modules.module.css";

const STAT_CARDS = [
  { label: "Total Acreage", icon: Map, color: "#285c49" },
  { label: "Active Crops", icon: Wheat, color: "#c48a47" },
  { label: "Machinery Active", icon: Tractor, color: "#173d32" },
  { label: "Operations This Month", icon: CalendarDays, color: "#376d57" },
  { label: "Inventory Items", icon: Package, color: "#8a5a23" },
  { label: "Est. Profitability", icon: TrendingUp, color: "#285c49" },
];

export default function ModuleOverview() {
  const { farm, fields } = useProduct();

  const activeOps = demoOperations.filter((o) => o.status === "in-progress");
  const totalRevenue = demoTransactions
    .filter((t) => t.category === "sales-revenue")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCosts = demoTransactions
    .filter((t) => t.category !== "sales-revenue")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const profitability = totalRevenue - totalCosts;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Farm Overview</h1>
        <p className={styles.pageSubtitle}>
          {farm.name} — {farm.area} {farm.unit} across {fields.length} fields
        </p>
      </div>

      {/* Stat Cards */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <Map className={styles.statIcon} style={{ color: STAT_CARDS[0].color }} />
          <div>
            <div className={styles.statValue}>{farm.area} {farm.unit}</div>
            <div className={styles.statLabel}>Total Acreage</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Wheat className={styles.statIcon} style={{ color: STAT_CARDS[1].color }} />
          <div>
            <div className={styles.statValue}>{fields.filter((f) => f.crop).length}</div>
            <div className={styles.statLabel}>Active Crops</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Tractor className={styles.statIcon} style={{ color: STAT_CARDS[2].color }} />
          <div>
            <div className={styles.statValue}>{demoEquipment.filter((e) => e.status === "deployed").length}</div>
            <div className={styles.statLabel}>Machinery Deployed</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <CalendarDays className={styles.statIcon} style={{ color: STAT_CARDS[3].color }} />
          <div>
            <div className={styles.statValue}>{activeOps.length}</div>
            <div className={styles.statLabel}>Active Operations</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Package className={styles.statIcon} style={{ color: STAT_CARDS[4].color }} />
          <div>
            <div className={styles.statValue}>{demoInputs.length}</div>
            <div className={styles.statLabel}>Inventory Items</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <DollarSign className={styles.statIcon} style={{ color: STAT_CARDS[5].color }} />
          <div>
            <div className={`${styles.statValue} ${profitability >= 0 ? styles.positive : styles.negative}`}>
              ${profitability.toLocaleString()}
            </div>
            <div className={styles.statLabel}>Est. Profitability</div>
          </div>
        </div>
      </div>

      {/* Fields Grid */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Fields</h2>
        <div className={styles.fieldsGrid}>
          {fields.map((field) => {
            const assessment = demoAssessments.find((a) => a.id === field.assessmentId);
            const fieldOps = demoOperations.filter((o) => o.fieldId === field.id);
            return (
              <Card key={field.id} className={styles.fieldCard}>
                <CardHeader>
                  <CardTitle className={styles.fieldCardTitle}>
                    {field.name}
                    {field.crop && (
                      <Badge variant="secondary" className={styles.cropBadge}>
                        {field.crop}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className={styles.fieldCardContent}>
                  <div className={styles.fieldMeta}>
                    <span>{field.area} {field.unit}</span>
                    <span className={styles.stageBadge}>{field.cropStage}</span>
                  </div>
                  {assessment && (
                    <div className={styles.assessmentStatus}>
                      Soil test: {assessment.soilTestStatus === "completed" ? "✓ Completed" : "Pending"}
                    </div>
                  )}
                  <div className={styles.opsCount}>
                    {fieldOps.length} operations · {fieldOps.filter((o) => o.status === "in-progress").length} active
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityList}>
          {demoOperations.slice(-5).reverse().map((op) => (
            <div key={op.id} className={styles.activityItem}>
              <span className={styles.activityStatus} style={{
                background: op.status === "completed" ? "#b7c9a8" : op.status === "in-progress" ? "#e9c79a" : "#e5e9e2"
              }} />
              <div className={styles.activityContent}>
                <div className={styles.activityTitle}>
                  {op.type.replace("-", " ")} — {fields.find((f) => f.id === op.fieldId)?.name || op.fieldId}
                </div>
                <div className={styles.activityMeta}>
                  {op.scheduledDate} · {op.status.replace("-", " ")}
                </div>
              </div>
              <span className={styles.activityCost}>${op.cost.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
