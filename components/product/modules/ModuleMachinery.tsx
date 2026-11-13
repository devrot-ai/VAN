/**
 * VAN Product — Machinery & Infrastructure Module
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import { demoEquipment, demoTeams } from "@/lib/simulation/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tractor, Eye } from "lucide-react";
import styles from "./modules.module.css";

const EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  tractor: "Tractor",
  combine: "Combine Harvester",
  sprayer: "Sprayer",
  "seed-drill": "Seed Drill",
  loader: "Loader",
  "irrigation-pump": "Irrigation Pump",
  truck: "Truck",
  plough: "Plough",
};

export default function ModuleMachinery() {
  const { openIn3D } = useProduct();

  const deployed = demoEquipment.filter((e) => e.status === "deployed").length;
  const operational = demoEquipment.filter((e) => e.status === "operational").length;
  const maintenance = demoEquipment.filter((e) => e.status === "maintenance").length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Machinery & Infrastructure</h1>
          <p className={styles.pageSubtitle}>
            Equipment fleet and maintenance — illustrative demonstration data
          </p>
        </div>
        <button
          className={styles.actionBtn}
          onClick={() => openIn3D({ stage: "machinery" })}
        >
          <Eye className={styles.actionIcon} />
          View in 3D
        </button>
      </div>

      {/* Fleet Summary */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <Tractor className={styles.statIcon} />
          <div>
            <div className={styles.statValue}>{demoEquipment.length}</div>
            <div className={styles.statLabel}>Total Equipment</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Tractor className={styles.statIcon} style={{ color: "#285c49" }} />
          <div>
            <div className={styles.statValue}>{deployed}</div>
            <div className={styles.statLabel}>Deployed</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Tractor className={styles.statIcon} style={{ color: "#376d57" }} />
          <div>
            <div className={styles.statValue}>{operational}</div>
            <div className={styles.statLabel}>Operational</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Tractor className={styles.statIcon} style={{ color: "#c48a47" }} />
          <div>
            <div className={styles.statValue}>{maintenance}</div>
            <div className={styles.statLabel}>Maintenance</div>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Fleet</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Ownership</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoEquipment.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell>
                    <div>
                      <div className={styles.equipName}>{eq.name}</div>
                      <div className={styles.equipModel}>{eq.manufacturer} {eq.model}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{EQUIPMENT_TYPE_LABELS[eq.type] || eq.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        eq.status === "deployed"
                          ? "default"
                          : eq.status === "operational"
                          ? "secondary"
                          : eq.status === "maintenance"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {eq.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{eq.location}</TableCell>
                  <TableCell>{eq.hoursUsed.toLocaleString()}h</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        eq.maintenanceStatus === "current"
                          ? "default"
                          : eq.maintenanceStatus === "due-soon"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {eq.maintenanceStatus.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{eq.ownershipType}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Teams */}
      <Card className={styles.teamsCard}>
        <CardHeader>
          <CardTitle>Teams & Operators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.teamsGrid}>
            {demoTeams.map((team) => (
              <div key={team.id} className={styles.teamCard}>
                <div className={styles.teamName}>{team.name}</div>
                <div className={styles.teamRole}>{team.role}</div>
                <Badge
                  variant={
                    team.availability === "available"
                      ? "default"
                      : team.availability === "assigned"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {team.availability}
                </Badge>
                {team.assignedJobs.length > 0 && (
                  <div className={styles.teamJobs}>
                    Assigned: {team.assignedJobs.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
