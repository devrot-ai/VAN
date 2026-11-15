"use client";

import { useState, useMemo } from "react";
import { EmptyState, badgeClass } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";
import Link from "next/link";

type SortField = "crop_type" | "status" | "planned_planting_date" | "planned_harvest_date";
type SortDir = "asc" | "desc";

export default function CropCyclesFilters({ cycles, farms, fields, fieldMap, farmMap }: {
  cycles: any[];
  farms: any[];
  fields: any[];
  fieldMap: Map<number, any>;
  farmMap: Map<number, any>;
}) {
  const [search, setSearch] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [cropFilter, setCropFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("planned_planting_date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Derive unique crop types from cycles for the crop filter
  const cropTypes = useMemo(() => {
    const crops = new Set(cycles.map((c: any) => c.crop_type).filter(Boolean));
    return Array.from(crops).sort();
  }, [cycles]);

  // Filtered and sorted cycles
  const filteredCycles = useMemo(() => {
    let result = [...cycles];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c: any) =>
        (c.crop_type || "").toLowerCase().includes(q) ||
        (c.variety || "").toLowerCase().includes(q) ||
        (c.season || "").toLowerCase().includes(q)
      );
    }

    // Farm filter
    if (farmFilter) {
      const farmId = Number(farmFilter);
      result = result.filter((c: any) => {
        const field = fieldMap.get(c.field_id);
        return field?.farm_id === farmId;
      });
    }

    // Field filter
    if (fieldFilter) {
      const fieldId = Number(fieldFilter);
      result = result.filter((c: any) => c.field_id === fieldId);
    }

    // Crop filter
    if (cropFilter) {
      result = result.filter((c: any) => c.crop_type === cropFilter);
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((c: any) => c.status === statusFilter);
    }

    // Sort
    result.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortField) {
        case "crop_type":
          cmp = (a.crop_type || "").localeCompare(b.crop_type || "");
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
        case "planned_planting_date":
          cmp = (a.planned_planting_date || "9999").localeCompare(b.planned_planting_date || "9999");
          break;
        case "planned_harvest_date":
          cmp = (a.planned_harvest_date || "9999").localeCompare(b.planned_harvest_date || "9999");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [cycles, search, farmFilter, fieldFilter, cropFilter, statusFilter, sortField, sortDir, fieldMap]);

  // Filter fields by selected farm for the field dropdown
  const availableFields = useMemo(() => {
    if (!farmFilter) return fields;
    const farmId = Number(farmFilter);
    return fields.filter((f: any) => f.farm_id === farmId);
  }, [fields, farmFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <>
      {/* Filters bar */}
      <div style={{
        padding: "var(--space-4) var(--space-5)",
        borderBottom: "1px solid var(--line)",
        display: "flex",
        gap: "var(--space-3)",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search crops, varieties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.45rem 0.65rem",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm)",
            font: "inherit",
            fontSize: "var(--text-sm)",
            minWidth: 180,
          }}
        />

        {/* Farm filter */}
        <select
          value={farmFilter}
          onChange={(e) => { setFarmFilter(e.target.value); setFieldFilter(""); }}
          style={{
            padding: "0.45rem 0.65rem",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm)",
            font: "inherit",
            fontSize: "var(--text-sm)",
            background: "#fff",
          }}
        >
          <option value="">All farms</option>
          {farms.map((f: any) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        {/* Field filter */}
        <select
          value={fieldFilter}
          onChange={(e) => setFieldFilter(e.target.value)}
          style={{
            padding: "0.45rem 0.65rem",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm)",
            font: "inherit",
            fontSize: "var(--text-sm)",
            background: "#fff",
          }}
        >
          <option value="">All fields</option>
          {availableFields.map((f: any) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        {/* Crop filter */}
        <select
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
          style={{
            padding: "0.45rem 0.65rem",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm)",
            font: "inherit",
            fontSize: "var(--text-sm)",
            background: "#fff",
          }}
        >
          <option value="">All crops</option>
          {cropTypes.map((crop) => (
            <option key={crop} value={crop}>{crop}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "0.45rem 0.65rem",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm)",
            font: "inherit",
            fontSize: "var(--text-sm)",
            background: "#fff",
          }}
        >
          <option value="">All statuses</option>
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="harvesting">Harvesting</option>
          <option value="harvested">Harvested</option>
          <option value="closed">Closed</option>
        </select>

        {/* Results count */}
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: "auto" }}>
          {filteredCycles.length} of {cycles.length} cycles
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Crop</th>
              <th>Variety</th>
              <th>Field</th>
              <th>Season</th>
              <th>Area</th>
              <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("planned_planting_date")}>
                Planting{sortIndicator("planned_planting_date")}
              </th>
              <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("planned_harvest_date")}>
                Harvest{sortIndicator("planned_harvest_date")}
              </th>
              <th>Stage</th>
              <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("status")}>
                Status{sortIndicator("status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCycles.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState text="No crop cycles match your filters. Try adjusting your search or filters." />
                </td>
              </tr>
            ) : (
              filteredCycles.map((cycle: any) => {
                const field = fieldMap.get(cycle.field_id);
                return (
                  <tr key={cycle.id}>
                    <td>
                      <Link href={`/app/crop-planning/${cycle.id}`} className={styles.listLink}>
                        {cycle.crop_type}
                      </Link>
                    </td>
                    <td>{cycle.variety || "—"}</td>
                    <td>{field ? field.name : "—"}</td>
                    <td>{cycle.season || "—"}</td>
                    <td>{cycle.cultivated_area_ha ? `${cycle.cultivated_area_ha} ha` : "—"}</td>
                    <td>{cycle.planned_planting_date ? formatDate(cycle.planned_planting_date) : "—"}</td>
                    <td>{cycle.planned_harvest_date ? formatDate(cycle.planned_harvest_date) : "—"}</td>
                    <td>{cycle.current_stage || "—"}</td>
                    <td><span className={badgeClass(cycle.status)}>{cycle.status}</span></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}
