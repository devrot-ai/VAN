/**
 * VAN Product — Harvest, Processing & Storage Module
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import { demoHarvests, demoStorage, demoFields } from "@/lib/simulation/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Wheat, Eye } from "lucide-react";
import styles from "./modules.module.css";

export default function ModuleHarvest() {
  const { openIn3D } = useProduct();

  const totalHarvested = demoHarvests.reduce((sum, h) => sum + h.quantity, 0);
  const totalStored = demoStorage.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Harvest, Processing & Storage</h1>
          <p className={styles.pageSubtitle}>
            Harvest lots, quality grades and storage records — illustrative demonstration data
          </p>
        </div>
        <button
          className={styles.actionBtn}
          onClick={() => openIn3D({ stage: "harvest" })}
        >
          <Eye className={styles.actionIcon} />
          View in 3D
        </button>
      </div>

      {/* Summary */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <Wheat className={styles.statIcon} />
          <div>
            <div className={styles.statValue}>{totalHarvested} t</div>
            <div className={styles.statLabel}>Total Harvested</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Wheat className={styles.statIcon} style={{ color: "#285c49" }} />
          <div>
            <div className={styles.statValue}>{totalStored} t</div>
            <div className={styles.statLabel}>In Storage</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Wheat className={styles.statIcon} style={{ color: "#c48a47" }} />
          <div>
            <div className={styles.statValue}>{demoHarvests.length}</div>
            <div className={styles.statLabel}>Harvest Lots</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Wheat className={styles.statIcon} style={{ color: "#376d57" }} />
          <div>
            <div className={styles.statValue}>{demoStorage.length}</div>
            <div className={styles.statLabel}>Storage Records</div>
          </div>
        </div>
      </div>

      {/* Harvest Lots */}
      <Card>
        <CardHeader>
          <CardTitle>Harvest Lots</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Crop</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Processing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoHarvests.map((lot) => {
                const field = demoFields.find((f) => f.id === lot.fieldId);
                return (
                  <TableRow key={lot.id}>
                    <TableCell>{lot.id}</TableCell>
                    <TableCell>{field?.name || lot.fieldId}</TableCell>
                    <TableCell>{lot.crop}</TableCell>
                    <TableCell>{lot.quantity} {lot.unit}</TableCell>
                    <TableCell>
                      <Badge
                        variant={lot.quality === "premium" ? "default" : lot.quality === "standard" ? "secondary" : "outline"}
                      >
                        {lot.quality}
                      </Badge>
                    </TableCell>
                    <TableCell>{lot.harvestDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lot.processingStatus}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Storage Records */}
      <Card className={styles.storageCard}>
        <CardHeader>
          <CardTitle>Storage Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Harvest Lot</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoStorage.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell>{rec.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{rec.storageType}</Badge>
                  </TableCell>
                  <TableCell>{rec.quantity} {rec.unit}</TableCell>
                  <TableCell>{rec.harvestLotId}</TableCell>
                  <TableCell>{rec.storageDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
