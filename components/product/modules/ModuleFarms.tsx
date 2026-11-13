/**
 * VAN Product — Farms & Fields Module
 *
 * Browse farms and individual fields, view field boundaries and profiles.
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import { demoAssessments, demoOperations } from "@/lib/simulation/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Map, Eye } from "lucide-react";
import styles from "./modules.module.css";

const CROP_STAGES = ["bare", "prepared", "planted", "emerging", "growing", "mature", "harvested"];

export default function ModuleFarms() {
  const { farm, fields, selectedFieldId, setSelectedFieldId, openIn3D } = useProduct();

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Farms & Fields</h1>
        <p className={styles.pageSubtitle}>{farm.name} — {farm.location}</p>
      </div>

      {/* Farm Summary */}
      <Card className={styles.summaryCard}>
        <CardHeader>
          <CardTitle>{farm.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.farmSummaryGrid}>
            <div>
              <span className={styles.summaryLabel}>Location</span>
              <span className={styles.summaryValue}>{farm.location}</span>
            </div>
            <div>
              <span className={styles.summaryLabel}>Total Area</span>
              <span className={styles.summaryValue}>{farm.area} {farm.unit}</span>
            </div>
            <div>
              <span className={styles.summaryLabel}>Fields</span>
              <span className={styles.summaryValue}>{fields.length}</span>
            </div>
            <div>
              <span className={styles.summaryLabel}>Active Crops</span>
              <span className={styles.summaryValue}>{fields.filter((f) => f.crop && f.cropStage !== "bare").length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fields List */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Fields</h2>
        <div className={styles.fieldsList}>
          {fields.map((field) => {
            const isSelected = selectedFieldId === field.id;
            const assessment = demoAssessments.find((a) => a.id === field.assessmentId);
            const fieldOps = demoOperations.filter((o) => o.fieldId === field.id);
            return (
              <div
                key={field.id}
                className={`${styles.fieldRow} ${isSelected ? styles.fieldRowSelected : ""}`}
                onClick={() => setSelectedFieldId(field.id)}
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
              >
                <div className={styles.fieldRowLeft}>
                  <Map className={styles.fieldRowIcon} />
                  <div>
                    <div className={styles.fieldRowName}>
                      {field.name}
                      {field.crop && (
                        <Badge variant="secondary" className={styles.cropBadge}>
                          {field.crop}
                        </Badge>
                      )}
                    </div>
                    <div className={styles.fieldRowMeta}>
                      {field.area} {field.unit} · Stage: {field.cropStage}
                      {assessment && ` · Soil: ${assessment.soilTestStatus === "completed" ? "Tested" : "Pending"}`}
                    </div>
                  </div>
                </div>
                <div className={styles.fieldRowRight}>
                  <span className={styles.stageIndicator}>
                    {CROP_STAGES.indexOf(field.cropStage) + 1}/{CROP_STAGES.length}
                  </span>
                  <span className={styles.opsCount}>{fieldOps.length} ops</span>
                  <button
                    className={styles.explore3DBtn}
                    onClick={(e) => { e.stopPropagation(); openIn3D({ fieldId: field.id, stage: "operations" }); }}
                  >
                    <Eye className={styles.explore3DIcon} />
                    3D
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Field Detail */}
      {selectedFieldId && (() => {
        const field = fields.find((f) => f.id === selectedFieldId);
        if (!field) return null;
        const assessment = demoAssessments.find((a) => a.id === field.assessmentId);
        const fieldOps = demoOperations.filter((o) => o.fieldId === field.id);
        return (
          <Card className={styles.fieldDetailCard}>
            <CardHeader>
              <CardTitle>
                {field.name}
                <Badge variant="outline" className={styles.stageBadge}>{field.cropStage}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.detailGrid}>
                <div>
                  <span className={styles.detailLabel}>Area</span>
                  <span className={styles.detailValue}>{field.area} {field.unit}</span>
                </div>
                <div>
                  <span className={styles.detailLabel}>Crop</span>
                  <span className={styles.detailValue}>{field.crop || "None"}</span>
                </div>
                <div>
                  <span className={styles.detailLabel}>Growth Stage</span>
                  <span className={styles.detailValue}>{field.cropStage}</span>
                </div>
                <div>
                  <span className={styles.detailLabel}>Soil Assessment</span>
                  <span className={styles.detailValue}>
                    {assessment?.soilTestStatus === "completed" ? "Completed" : "Not completed"}
                  </span>
                </div>
              </div>
              {fieldOps.length > 0 && (
                <div className={styles.detailSection}>
                  <h4>Operations</h4>
                  {fieldOps.map((op) => (
                    <div key={op.id} className={styles.detailOp}>
                      <span className={styles.detailOpType}>{op.type.replace("-", " ")}</span>
                      <span className={styles.detailOpStatus}>{op.status.replace("-", " ")}</span>
                      <span className={styles.detailOpDate}>{op.scheduledDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
