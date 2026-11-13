/**
 * VAN Product — Land Intelligence Module
 *
 * Soil assessments, pH, NPK, moisture, texture, drainage and crop suitability.
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import { demoAssessments, demoFields } from "@/lib/simulation/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Microscope, Eye } from "lucide-react";
import styles from "./modules.module.css";

export default function ModuleLandIntelligence() {
  const { openIn3D } = useProduct();

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Land Intelligence</h1>
          <p className={styles.pageSubtitle}>
            Soil assessments and field intelligence — illustrative demonstration data
          </p>
        </div>
        <button
          className={styles.actionBtn}
          onClick={() => openIn3D({ stage: "land-assessment" })}
        >
          <Eye className={styles.actionIcon} />
          View in 3D
        </button>
      </div>

      <div className={styles.assessmentsGrid}>
        {demoAssessments.map((assess) => {
          const field = demoFields.find((f) => f.id === assess.fieldId);
          return (
            <Card key={assess.id} className={styles.assessmentCard}>
              <CardHeader>
                <CardTitle className={styles.assessmentTitle}>
                  {field?.name || assess.fieldId}
                  <Badge
                    variant={assess.soilTestStatus === "completed" ? "default" : "secondary"}
                    className={styles.statusBadge}
                  >
                    {assess.soilTestStatus === "completed" ? "Completed" : "Pending"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assess.soilTestStatus === "completed" ? (
                  <div className={styles.soilDataGrid}>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>pH</span>
                      <span className={styles.soilDataValue}>{assess.ph}</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Organic Carbon</span>
                      <span className={styles.soilDataValue}>{assess.organicCarbon}%</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Nitrogen (N)</span>
                      <span className={styles.soilDataValue}>{assess.nitrogen} kg/ha</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Phosphorus (P)</span>
                      <span className={styles.soilDataValue}>{assess.phosphorus} kg/ha</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Potassium (K)</span>
                      <span className={styles.soilDataValue}>{assess.potassium} kg/ha</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Moisture</span>
                      <span className={styles.soilDataValue}>{assess.moisture}%</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Texture</span>
                      <span className={styles.soilDataValue}>{assess.texture}</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Drainage</span>
                      <span className={styles.soilDataValue}>{assess.drainage}</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Compaction</span>
                      <span className={styles.soilDataValue}>{assess.compaction || "None"}</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Evidence</span>
                      <span className={styles.soilDataValue}>{assess.evidenceSource}</span>
                    </div>
                    <div className={styles.soilDataItem}>
                      <span className={styles.soilDataLabel}>Test Date</span>
                      <span className={styles.soilDataValue}>{assess.testDate}</span>
                    </div>
                    <div className={styles.soilDataItemFull}>
                      <span className={styles.soilDataLabel}>Crop Suitability</span>
                      <div className={styles.suitabilityTags}>
                        {assess.suitability.map((crop) => (
                          <Badge key={crop} variant="secondary">{crop}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.pendingAssessment}>
                    <Microscope className={styles.pendingIcon} />
                    <p>Soil sampling is pending for this field. Once samples are collected and analyzed, the full assessment will be available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
