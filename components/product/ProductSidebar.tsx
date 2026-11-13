/**
 * VAN Product — Sidebar Navigation
 *
 * Persistent sidebar with module navigation, farm/field selector,
 * and link to the 3D Journey experience.
 */

"use client";

import Link from "next/link";
import { useProduct, type ProductModule } from "@/lib/product/ProductState";
import {
  LayoutDashboard,
  Map,
  Microscope,
  Package,
  Tractor,
  CalendarDays,
  Wheat,
  Truck,
  DollarSign,
  Globe,
  ChevronRight,
} from "lucide-react";
import styles from "./ProductLayout.module.css";

const MODULES: { id: ProductModule; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "farms", label: "Farms & Fields", icon: Map },
  { id: "land-intelligence", label: "Land Intelligence", icon: Microscope },
  { id: "inputs", label: "Inputs & Procurement", icon: Package },
  { id: "machinery", label: "Machinery", icon: Tractor },
  { id: "operations", label: "Farm Operations", icon: CalendarDays },
  { id: "harvest", label: "Harvest & Storage", icon: Wheat },
  { id: "logistics", label: "Logistics", icon: Truck },
  { id: "finance", label: "Finance", icon: DollarSign },
];

export default function ProductSidebar() {
  const { activeModule, setActiveModule, farm, fields, selectedFieldId, setSelectedFieldId } = useProduct();

  return (
    <aside className={styles.sidebar}>
      {/* Logo & Title */}
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.sidebarLogo}>
          <span className={styles.logoMark} />
          <span className={styles.logoWord}>VAN</span>
        </Link>
        <span className={styles.productBadge}>Product Demo</span>
      </div>

      {/* Farm Selector */}
      <div className={styles.farmSelector}>
        <div className={styles.farmName}>{farm.name}</div>
        <div className={styles.farmMeta}>{farm.area} {farm.unit} · {fields.length} fields</div>
        <select
          className={styles.fieldSelect}
          value={selectedFieldId || ""}
          onChange={(e) => setSelectedFieldId(e.target.value || null)}
          aria-label="Select field"
        >
          {fields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} — {f.area} {f.unit}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Product modules">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              onClick={() => setActiveModule(mod.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={styles.navIcon} />
              <span className={styles.navLabel}>{mod.label}</span>
              {isActive && <ChevronRight className={styles.navChevron} />}
            </button>
          );
        })}
      </nav>

      {/* 3D Journey Link */}
      <div className={styles.sidebarFooter}>
        <Link href="/journey" className={styles.journeyLink}>
          <Globe className={styles.journeyIcon} />
          <span>Explore in 3D</span>
        </Link>
      </div>
    </aside>
  );
}
