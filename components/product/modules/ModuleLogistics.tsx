/**
 * VAN Product — Logistics & Commerce Module
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import { demoShipments, demoEquipment } from "@/lib/simulation/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Truck, Eye } from "lucide-react";
import styles from "./modules.module.css";

export default function ModuleLogistics() {
  const { openIn3D } = useProduct();

  const dispatched = demoShipments.filter((s) => s.dispatchStatus === "dispatched").length;
  const delivered = demoShipments.filter((s) => s.dispatchStatus === "delivered").length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Logistics & Commerce</h1>
          <p className={styles.pageSubtitle}>
            Shipments, transport and delivery tracking — illustrative demonstration data
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

      {/* Summary */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <Truck className={styles.statIcon} />
          <div>
            <div className={styles.statValue}>{demoShipments.length}</div>
            <div className={styles.statLabel}>Total Shipments</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Truck className={styles.statIcon} style={{ color: "#c48a47" }} />
          <div>
            <div className={styles.statValue}>{dispatched}</div>
            <div className={styles.statLabel}>Dispatched</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Truck className={styles.statIcon} style={{ color: "#285c49" }} />
          <div>
            <div className={styles.statValue}>{delivered}</div>
            <div className={styles.statLabel}>Delivered</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <Truck className={styles.statIcon} style={{ color: "#376d57" }} />
          <div>
            <div className={styles.statValue}>
              {demoShipments.reduce((sum, s) => sum + s.quantity, 0)} t
            </div>
            <div className={styles.statLabel}>Total Volume</div>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Dispatch</TableHead>
                <TableHead>Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoShipments.map((ship) => {
                const vehicle = demoEquipment.find((e) => e.id === ship.vehicleId);
                return (
                  <TableRow key={ship.id}>
                    <TableCell>{ship.id}</TableCell>
                    <TableCell>{ship.source}</TableCell>
                    <TableCell>{ship.destination}</TableCell>
                    <TableCell>{vehicle?.name || ship.vehicleId}</TableCell>
                    <TableCell>{ship.quantity} {ship.unit}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ship.dispatchStatus === "delivered"
                            ? "default"
                            : ship.dispatchStatus === "dispatched"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {ship.dispatchStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ship.deliveryStatus === "received" ? (
                        <Badge variant="default">Received</Badge>
                      ) : (
                        <Badge variant="outline">{ship.deliveryStatus}</Badge>
                      )}
                    </TableCell>
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
