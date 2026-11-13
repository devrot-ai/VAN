/**
 * VAN Product — Farm Operations Module
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import { demoOperations, demoFields, demoEquipment, demoTeams } from "@/lib/simulation/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CalendarDays, Eye } from "lucide-react";
import styles from "./modules.module.css";

const OP_STATUS_COLORS: Record<string, string> = {
  "planned": "#e5e9e2",
  "in-progress": "#e9c79a",
  "completed": "#b7c9a8",
  "cancelled": "#d4a5a5",
};

export default function ModuleOperations() {
  const { openIn3D } = useProduct();

  const inProgress = demoOperations.filter((o) => o.status === "in-progress").length;
  const completed = demoOperations.filter((o) => o.status === "completed").length;
  const planned = demoOperations.filter((o) => o.status === "planned").length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Farm Operations</h1>
          <p className={styles.pageSubtitle}>
            Operational calendar and activity management — illustrative demonstration data
          </p>
        </div>
        <button
          className={styles.actionBtn}
          onClick={() => openIn3D({ stage: "operations" })}
        >
          <Eye className={styles.actionIcon} />
          View in 3D
        </button>
      </div>

      {/* Summary */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <CalendarDays className={styles.statIcon} />
          <div>
            <div className={styles.statValue}>{demoOperations.length}</div>
            <div className={styles.statLabel}>Total Operations</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <CalendarDays className={styles.statIcon} style={{ color: "#c48a47" }} />
          <div>
            <div className={styles.statValue}>{inProgress}</div>
            <div className={styles.statLabel}>In Progress</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <CalendarDays className={styles.statIcon} style={{ color: "#285c49" }} />
          <div>
            <div className={styles.statValue}>{completed}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <CalendarDays className={styles.statIcon} style={{ color: "#5f6a61" }} />
          <div>
            <div className={styles.statValue}>{planned}</div>
            <div className={styles.statLabel}>Planned</div>
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operation</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoOperations.map((op) => {
                const field = demoFields.find((f) => f.id === op.fieldId);
                const equip = demoEquipment.find((e) => e.id === op.equipmentId);
                const team = demoTeams.find((t) => t.id === op.teamId);
                return (
                  <TableRow key={op.id}>
                    <TableCell>
                      <div className={styles.opType}>{op.type.replace("-", " ")}</div>
                      {op.notes && <div className={styles.opNotes}>{op.notes}</div>}
                    </TableCell>
                    <TableCell>{field?.name || op.fieldId}</TableCell>
                    <TableCell>{op.scheduledDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={op.status === "completed" ? "default" : op.status === "in-progress" ? "secondary" : "outline"}
                      >
                        {op.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{equip?.name || "—"}</TableCell>
                    <TableCell>{team?.name || "—"}</TableCell>
                    <TableCell>${op.cost.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
