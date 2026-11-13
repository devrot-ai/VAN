"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { journeyStages } from "@/lib/simulation/demoData";
import type { JourneyStage } from "@/lib/simulation/types";
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
import styles from "./journey.module.css";

// Lazy-load the 3D canvas — it's client-only and heavy
const JourneyCanvas = dynamic(
  () => import("@/components/3d/JourneyCanvas"),
  { ssr: false, loading: () => <div className={styles.loading3d}>Loading 3D world...</div> }
);

export default function JourneyPageClient() {
  const [activeStage, setActiveStage] = useState<JourneyStage>("land-assessment");
  const [playing, setPlaying] = useState(false);
  const [selectedObject, setSelectedObject] = useState<{ name: string; type: string; data?: Record<string, unknown> } | null>(null);
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stageIndex = journeyStages.findIndex((s) => s.id === activeStage);
  const currentStage = journeyStages[stageIndex];

  const handleSelectObject = useCallback((name: string, type: string, data?: Record<string, unknown>) => {
    setSelectedObject({ name, type, data });
  }, []);

  // Look up simulation data for selected object
  const selectedObjectData = selectedObject?.data ? (() => {
    const id = selectedObject.data.id as string;
    if (!id) return null;
    // Equipment lookup
    const eq = demoEquipment.find(e => e.id === id);
    if (eq) return { type: "equipment" as const, data: eq };
    // Storage lookup
    const st = demoStorage.find(s => s.id === id);
    if (st) return { type: "storage" as const, data: st };
    // Shipment lookup
    const sh = demoShipments.find(s => s.id === id);
    if (sh) return { type: "shipment" as const, data: sh };
    return null;
  })() : null;

  const goToStage = useCallback((id: JourneyStage) => {
    setActiveStage(id);
    setSelectedObject(null);
  }, []);

  const playJourney = useCallback(() => {
    setPlaying(true);
    let idx = 0;
    goToStage(journeyStages[idx].id);
    playTimer.current = setInterval(() => {
      idx++;
      if (idx >= journeyStages.length) {
        setPlaying(false);
        if (playTimer.current) clearInterval(playTimer.current);
        return;
      }
      goToStage(journeyStages[idx].id);
    }, 4000);
  }, [goToStage]);

  const pauseJourney = useCallback(() => {
    setPlaying(false);
    if (playTimer.current) clearInterval(playTimer.current);
  }, []);

  const restartJourney = useCallback(() => {
    pauseJourney();
    setTimeout(() => playJourney(), 100);
  }, [pauseJourney, playJourney]);

  useEffect(() => {
    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, []);

  // ─── Info panel content based on stage ───

  const renderStageDetails = () => {
    switch (activeStage) {
      case "land-assessment":
        return (
          <div className={styles.detailSection}>
            <h4>Soil Assessment Results</h4>
            <p className={styles.demoNote}>Illustrative demonstration data</p>
            {demoAssessments.map((a) => (
              <div key={a.id} className={styles.detailCard}>
                <div className={styles.detailCardHeader}>
                  <strong>Field Assessment</strong>
                  <span className={styles.badge}>{a.soilTestStatus}</span>
                </div>
                {a.soilTestStatus === "completed" && (
                  <div className={styles.detailGrid}>
                    <div>pH: <strong>{a.ph}</strong></div>
                    <div>Organic Carbon: <strong>{a.organicCarbon}%</strong></div>
                    <div>Nitrogen: <strong>{a.nitrogen} kg/ha</strong></div>
                    <div>Phosphorus: <strong>{a.phosphorus} kg/ha</strong></div>
                    <div>Potassium: <strong>{a.potassium} kg/ha</strong></div>
                    <div>Moisture: <strong>{a.moisture}%</strong></div>
                    <div>Texture: <strong>{a.texture}</strong></div>
                    <div>Drainage: <strong>{a.drainage}</strong></div>
                  </div>
                )}
                {a.suitability.length > 0 && (
                  <div className={styles.suitability}>
                    Suitable for: {a.suitability.join(", ")}
                  </div>
                )}
                <div className={styles.evidence}>
                  Evidence: {a.evidenceSource}
                </div>
              </div>
            ))}
          </div>
        );

      case "inputs":
        return (
          <div className={styles.detailSection}>
            <h4>Input Inventory</h4>
            <p className={styles.demoNote}>Illustrative demonstration data</p>
            {demoInputs.map((item) => (
              <div key={item.id} className={styles.detailCard}>
                <div className={styles.detailCardHeader}>
                  <strong>{item.name}</strong>
                  <span className={`${styles.badge} ${styles.badgeStock}`}>{item.stockStatus}</span>
                </div>
                <div className={styles.detailGrid}>
                  <div>Category: <strong>{item.category}</strong></div>
                  <div>Quantity: <strong>{item.quantity} {item.unit}</strong></div>
                  <div>Warehouse: <strong>{item.warehouse}</strong></div>
                  <div>Application: <strong>{item.intendedApplication}</strong></div>
                </div>
              </div>
            ))}
          </div>
        );

      case "machinery":
        return (
          <div className={styles.detailSection}>
            <h4>Equipment Fleet</h4>
            <p className={styles.demoNote}>Illustrative demonstration data</p>
            {demoEquipment.map((eq) => (
              <div key={eq.id} className={styles.detailCard}>
                <div className={styles.detailCardHeader}>
                  <strong>{eq.name}</strong>
                  <span className={styles.badge}>{eq.status}</span>
                </div>
                <div className={styles.detailGrid}>
                  <div>Type: <strong>{eq.type}</strong></div>
                  <div>Manufacturer: <strong>{eq.manufacturer}</strong></div>
                  <div>Hours: <strong>{eq.hoursUsed}</strong></div>
                  <div>Maintenance: <strong>{eq.maintenanceStatus}</strong></div>
                  <div>Ownership: <strong>{eq.ownershipType}</strong></div>
                  {eq.currentActivity && (
                    <div>Activity: <strong>{eq.currentActivity}</strong></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case "operations":
        return (
          <div className={styles.detailSection}>
            <h4>Active Operations</h4>
            <p className={styles.demoNote}>Illustrative demonstration data</p>
            {demoOperations.map((op) => (
              <div key={op.id} className={styles.detailCard}>
                <div className={styles.detailCardHeader}>
                  <strong>{op.type}</strong>
                  <span className={styles.badge}>{op.status}</span>
                </div>
                <div className={styles.detailGrid}>
                  <div>Field: <strong>{op.fieldId}</strong></div>
                  <div>Date: <strong>{op.scheduledDate}</strong></div>
                  <div>Cost: <strong>{op.currency} {op.cost.toLocaleString()}</strong></div>
                  <div>Notes: <strong>{op.notes}</strong></div>
                </div>
              </div>
            ))}
          </div>
        );

      case "harvest":
        return (
          <div className={styles.detailSection}>
            <h4>Harvest & Storage</h4>
            <p className={styles.demoNote}>Illustrative demonstration data</p>
            {demoHarvests.map((h) => (
              <div key={h.id} className={styles.detailCard}>
                <div className={styles.detailCardHeader}>
                  <strong>{h.crop} — {h.quantity} {h.unit}</strong>
                  <span className={styles.badge}>{h.quality}</span>
                </div>
                <div className={styles.detailGrid}>
                  <div>Field: <strong>{h.fieldId}</strong></div>
                  <div>Date: <strong>{h.harvestDate}</strong></div>
                  <div>Processing: <strong>{h.processingStatus}</strong></div>
                </div>
              </div>
            ))}
            <h4 style={{ marginTop: "16px" }}>Storage</h4>
            {demoStorage.map((s) => (
              <div key={s.id} className={styles.detailCard}>
                <div className={styles.detailGrid}>
                  <div>Location: <strong>{s.location}</strong></div>
                  <div>Quantity: <strong>{s.quantity} {s.unit}</strong></div>
                  <div>Type: <strong>{s.storageType}</strong></div>
                </div>
              </div>
            ))}
            <h4 style={{ marginTop: "16px" }}>Shipments</h4>
            {demoShipments.map((s) => (
              <div key={s.id} className={styles.detailCard}>
                <div className={styles.detailCardHeader}>
                  <strong>{s.source} → {s.destination}</strong>
                  <span className={styles.badge}>{s.dispatchStatus}</span>
                </div>
                <div className={styles.detailGrid}>
                  <div>Quantity: <strong>{s.quantity} {s.unit}</strong></div>
                  <div>Dispatched: <strong>{s.dispatchDate}</strong></div>
                </div>
              </div>
            ))}
          </div>
        );

      case "finance":
        return (
          <div className={styles.detailSection}>
            <h4>Financial Summary</h4>
            <p className={styles.demoNote}>Illustrative demonstration data — synthetic sample numbers</p>
            <div className={styles.financeSummary}>
              <div className={styles.financeRow}>
                <span>Total Input Costs</span>
                <strong>-{Math.abs(demoTransactions.filter(t => t.category === "input-cost").reduce((s, t) => s + t.amount, 0)).toLocaleString()} USD</strong>
              </div>
              <div className={styles.financeRow}>
                <span>Machinery Costs</span>
                <strong>-{Math.abs(demoTransactions.filter(t => t.category === "machinery-cost").reduce((s, t) => s + t.amount, 0)).toLocaleString()} USD</strong>
              </div>
              <div className={styles.financeRow}>
                <span>Labour Costs</span>
                <strong>-{Math.abs(demoTransactions.filter(t => t.category === "labour-cost").reduce((s, t) => s + t.amount, 0)).toLocaleString()} USD</strong>
              </div>
              <div className={styles.financeRow}>
                <span>Harvest & Operations</span>
                <strong>-{Math.abs(demoTransactions.filter(t => ["harvest-cost", "storage-cost", "transport-cost"].includes(t.category)).reduce((s, t) => s + t.amount, 0)).toLocaleString()} USD</strong>
              </div>
              <div className={`${styles.financeRow} ${styles.financeTotal}`}>
                <span>Sales Revenue</span>
                <strong>+{demoTransactions.filter(t => t.category === "sales-revenue").reduce((s, t) => s + t.amount, 0).toLocaleString()} USD</strong>
              </div>
              <div className={`${styles.financeRow} ${styles.financeNet}`}>
                <span>Estimated Profitability</span>
                <strong>
                  {(
                    demoTransactions.filter(t => t.category === "sales-revenue").reduce((s, t) => s + t.amount, 0) +
                    demoTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)
                  ).toLocaleString()} USD
                </strong>
              </div>
            </div>
            <h4 style={{ marginTop: "16px" }}>Transactions</h4>
            {demoTransactions.map((t) => (
              <div key={t.id} className={styles.detailCard}>
                <div className={styles.detailCardHeader}>
                  <strong>{t.description}</strong>
                  <span className={styles.badge}>{t.status}</span>
                </div>
                <div className={styles.detailGrid}>
                  <div>Category: <strong>{t.category}</strong></div>
                  <div>Amount: <strong style={{ color: t.amount >= 0 ? "#285c49" : "#b91c1c" }}>
                    {t.amount >= 0 ? "+" : ""}{t.amount.toLocaleString()} {t.currency}
                  </strong></div>
                  <div>Date: <strong>{t.date}</strong></div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={styles.journeyPage}>
      {/* Header */}
      <div className={styles.journeyHeader}>
        <span className="eyebrow">Interactive Experience</span>
        <h1 className={styles.journeyTitle}>The Agricultural Journey</h1>
        <p className={styles.journeyLead}>
          Explore how VAN connects every stage — from understanding the land to delivering produce to market.
          Select a stage below to navigate the 3D world.
        </p>
      </div>

      {/* Stage Timeline */}
      <div className={styles.stageTimeline}>
        {journeyStages.map((stage, i) => (
          <button
            key={stage.id}
            className={`${styles.stageBtn} ${activeStage === stage.id ? styles.stageBtnActive : ""}`}
            onClick={() => goToStage(stage.id)}
            aria-label={`Go to stage ${stage.index}: ${stage.name}`}
          >
            <span className={styles.stageIndex}>{stage.index}</span>
            <span className={styles.stageName}>{stage.shortName}</span>
          </button>
        ))}
      </div>

      {/* Main content: 3D + Info Panel */}
      <div className={styles.journeyContent}>
        {/* 3D Canvas */}
        <div className={styles.canvasArea}>
          <JourneyCanvas activeStage={activeStage} onSelectObject={handleSelectObject} />

          {/* Journey Controls */}
          <div className={styles.journeyControls}>
            {!playing ? (
              <button className={styles.ctrlBtn} onClick={playJourney} aria-label="Play full journey">
                ▶ Experience the full journey
              </button>
            ) : (
              <button className={styles.ctrlBtn} onClick={pauseJourney} aria-label="Pause journey">
                ⏸ Pause
              </button>
            )}
            {playing && (
              <button className={styles.ctrlBtnSmall} onClick={restartJourney} aria-label="Restart journey">
                ↺ Restart
              </button>
            )}
            <button
              className={styles.ctrlBtnSmall}
              onClick={() => {
                const idx = (stageIndex + 1) % journeyStages.length;
                goToStage(journeyStages[idx].id);
              }}
              aria-label="Next stage"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.infoPanelHeader}>
            <span className={styles.infoPanelIndex}>{currentStage.index}</span>
            <h2 className={styles.infoPanelTitle}>{currentStage.name}</h2>
          </div>
          <p className={styles.infoPanelDesc}>{currentStage.description}</p>

          <div className={styles.infoPanelSections}>
            <div className={styles.infoPanelBlock}>
              <h4>What VAN supplies</h4>
              <p>{currentStage.whatVANSupplies}</p>
            </div>
            <div className={styles.infoPanelBlock}>
              <h4>What the farmer receives</h4>
              <p>{currentStage.whatFarmerReceives}</p>
            </div>
            <div className={styles.infoPanelBlock}>
              <h4>What is recorded</h4>
              <p>{currentStage.whatIsRecorded}</p>
            </div>
          </div>

          {renderStageDetails()}

          {currentStage.nextStep && (
            <button
              className={styles.nextStageBtn}
              onClick={() => goToStage(currentStage.nextStep!)}
            >
              Next: {journeyStages.find((s) => s.id === currentStage.nextStep)?.shortName} →
            </button>
          )}
        </div>
      </div>

      {/* Selected object info */}
      {selectedObject && (
        <div className={styles.objectInfo}>
          <div className={styles.objectInfoHeader}>
            <strong>{selectedObject.name}</strong>
            <span className={styles.objectType}>{selectedObject.type}</span>
          </div>
          {selectedObjectData?.type === "equipment" && (
            <div className={styles.objectData}>
              <p className={styles.demoNote}>Illustrative demonstration data</p>
              <div className={styles.detailGrid}>
                <div>Manufacturer: <strong>{selectedObjectData.data.manufacturer}</strong></div>
                <div>Model: <strong>{selectedObjectData.data.model}</strong></div>
                <div>Status: <strong><span className={styles.badge}>{selectedObjectData.data.status}</span></strong></div>
                <div>Location: <strong>{selectedObjectData.data.location}</strong></div>
                <div>Hours: <strong>{selectedObjectData.data.hoursUsed}</strong></div>
                <div>Maintenance: <strong>{selectedObjectData.data.maintenanceStatus}</strong></div>
                <div>Ownership: <strong>{selectedObjectData.data.ownershipType}</strong></div>
                {selectedObjectData.data.currentActivity && (
                  <div>Activity: <strong>{selectedObjectData.data.currentActivity}</strong></div>
                )}
              </div>
            </div>
          )}
          {selectedObjectData?.type === "storage" && (
            <div className={styles.objectData}>
              <p className={styles.demoNote}>Illustrative demonstration data</p>
              <div className={styles.detailGrid}>
                <div>Location: <strong>{selectedObjectData.data.location}</strong></div>
                <div>Quantity: <strong>{selectedObjectData.data.quantity} {selectedObjectData.data.unit}</strong></div>
                <div>Type: <strong>{selectedObjectData.data.storageType}</strong></div>
                <div>Stored: <strong>{selectedObjectData.data.storageDate}</strong></div>
              </div>
            </div>
          )}
          {selectedObjectData?.type === "shipment" && (
            <div className={styles.objectData}>
              <p className={styles.demoNote}>Illustrative demonstration data</p>
              <div className={styles.detailGrid}>
                <div>From: <strong>{selectedObjectData.data.source}</strong></div>
                <div>To: <strong>{selectedObjectData.data.destination}</strong></div>
                <div>Quantity: <strong>{selectedObjectData.data.quantity} {selectedObjectData.data.unit}</strong></div>
                <div>Status: <strong><span className={styles.badge}>{selectedObjectData.data.dispatchStatus}</span></strong></div>
              </div>
            </div>
          )}
          {!selectedObjectData && (
            <div className={styles.objectData}>
              <p>{selectedObject.name} — {selectedObject.type}</p>
              <p className={styles.demoNote}>Part of the VAN agricultural operation</p>
            </div>
          )}
          <button className={styles.closeBtn} onClick={() => setSelectedObject(null)}>✕ Close</button>
        </div>
      )}
    </div>
  );
}
