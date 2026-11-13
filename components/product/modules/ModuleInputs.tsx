/**
 * VAN Product — Inputs & Procurement Module
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import { demoInputs } from "@/lib/simulation/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Package, Eye } from "lucide-react";
import styles from "./modules.module.css";

const CATEGORY_ICONS: Record<string, string> = {
  seed: "🌱",
  fertiliser: "🧪",
  "crop-protection": "🛡️",
  "soil-amendment": "🪨",
  irrigation: "💧",
  "spare-parts": "⚙️",
};

export default function ModuleInputs() {
  const { openIn3D } = useProduct();

  const categories = [...new Set(demoInputs.map((i) => i.category))];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Inputs & Procurement</h1>
          <p className={styles.pageSubtitle}>
            Seeds, fertilisers, crop protection and supplies — illustrative demonstration data
          </p>
        </div>
        <button
          className={styles.actionBtn}
          onClick={() => openIn3D({ stage: "inputs" })}
        >
          <Eye className={styles.actionIcon} />
          View in 3D
        </button>
      </div>

      {/* Category Summary */}
      <div className={styles.categorySummary}>
        {categories.map((cat) => {
          const items = demoInputs.filter((i) => i.category === cat);
          const inStock = items.filter((i) => i.stockStatus === "in-stock").length;
          return (
            <Card key={cat} className={styles.categoryCard}>
              <CardContent>
                <div className={styles.categoryIcon}>{CATEGORY_ICONS[cat] || "📦"}</div>
                <div className={styles.categoryName}>{cat.replace("-", " ")}</div>
                <div className={styles.categoryCount}>{items.length} items</div>
                <Badge variant={inStock === items.length ? "default" : "secondary"}>
                  {inStock}/{items.length} in stock
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoInputs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className={styles.productName}>
                      {CATEGORY_ICONS[item.category] || "📦"} {item.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category.replace("-", " ")}</Badge>
                  </TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>{item.warehouse}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.stockStatus === "in-stock"
                          ? "default"
                          : item.stockStatus === "low"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {item.stockStatus.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.supplier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
