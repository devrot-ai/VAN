"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { JourneyStateProvider, useJourneyState } from "@/lib/simulation/JourneyState";
import { LOCATION_TO_STAGE } from "@/lib/simulation/types";
import { journeyStages, worldLocations } from "@/lib/simulation/demoData";
import {
  demoFarmer,
  demoFarm,
  demoFields,
  demoAssessments,
  demoInputs,
  demoEquipment,
  demoOperations,
  demoHarvests,
  demoStorage,
  demoShipments,
  demoTransactions,
} from "@/lib/simulation/demoData";
import type { WorldCategory, JourneyStage } from "@/lib/simulation/types";
import styles from "./journey.module.css";

// Lazy-load the 3D canvas — it's client-only and heavy
const JourneyCanvas = dynamic(
  () => import("@/components/3d/JourneyCanvas"),
  { ssr: false, loading: () => <div className={styles.loading3d}>Loading 3D world...</div> }
);

// Category labels and icons for the filter panel
const CATEGORY_INFO: Record<WorldCategory, { label: string; icon: string }> = {
  "fields": { label: "Fields", icon: "🌾" },
  "soil-assessment": { label: "Soil Assessment", icon: "🔬" },
  "inputs": { label: "Inputs & Supply", icon: "📦" },
  "machinery": { label: "Machinery", icon: "🚜" },
  "workshop": { label: "Workshop", icon: "🔧" },
  "operations": { label: "Farm Operations", icon: "🌱" },
  "irrigation": { label: "Irrigation", icon: "💧" },
  "harvest": { label: "Harvesting", icon: "🌾" },
  "processing": { label: "Processing", icon: "🏭" },
  "storage": { label: "Grain Storage", icon: "🏗️" },
  "cold-storage": { label: "Cold Storage", icon: "❄️" },
  "logistics": { label: "Logistics", icon: "🚛" },
  "market": { label: "Market", icon: "🏪" },
  "sensors": { label: "Sensors", icon: "📡" },
};

export default function JourneyPage() {
  return (
    <JourneyStateProvider>
      <JourneyPageInner />
    </JourneyStateProvider>
  );
}

function JourneyPageInner() {
  const state = useJourneyState();
  const currentStage = journeyStages[state.stageIndex];
  const currentSubStep = currentStage.subSteps?.find((s) => s.id === state.activeSubStep);

  // Look up simulation data for selected object
  const selectedObjectData = state.selectedObject?.data ? (() => {
    const id = state.selectedObject.data.id as string;
    if (!id) return null;
    const eq = demoEquipment.find((e) => e.id === id);
    if (eq) return { type: "equipment" as const, data: eq };
    const st = demoStorage.find((s) => s.id === id);
    if (st) return { type: "storage" as const, data: st };
    const sh = demoShipments.find((s) => s.id === id);
    if (sh) return { type: "shipment" as const, data: sh };
    return null;
  })() : null;

  const renderStageDetails = () => {
    switch (state.activeStage) {
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
                <strong>-{Math.abs(demoTransactions.filter((t) => t.category === "input-cost").reduce((s, t) => s + t.amount, 0)).toLocaleString()} USD</strong>
              </div>
              <div className={styles.financeRow}>
                <span>Machinery Costs</span>
                <strong>-{Math.abs(demoTransactions.filter((t) => t.category === "machinery-cost").reduce((s, t) => s + t.amount, 0)).toLocaleString()} USD</strong>
              </div>
              <div className={styles.financeRow}>
                <span>Labour Costs</span>
                <strong>-{Math.abs(demoTransactions.filter((t) => t.category === "labour-cost").reduce((s, t) => s + t.amount, 0)).toLocaleString()} USD</strong>
              </div>
              <div className={styles.financeRow}>
                <span>Harvest & Operations</span>
                <strong>-{Math.abs(demoTransactions.filter((t) => ["harvest-cost", "storage-cost", "transport-cost"].includes(t.category)).reduce((s, t) => s + t.amount, 0)).toLocaleString()} USD</strong>
              </div>
              <div className={`${styles.financeRow} ${styles.financeTotal}`}>
                <span>Sales Revenue</span>
                <strong>+{demoTransactions.filter((t) => t.category === "sales-revenue").reduce((s, t) => s + t.amount, 0).toLocaleString()} USD</strong>
              </div>
              <div className={`${styles.financeRow} ${styles.financeNet}`}>
                <span>Estimated Profitability</span>
                <strong>
                  {(
                    demoTransactions.filter((t) => t.category === "sales-revenue").reduce((s, t) => s + t.amount, 0) +
                    demoTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
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

      default:
        return null;
    }
  };

  return (
    <div className={styles.journeyPage}>
      {/* ─── Header ─── */}
      <div className={styles.journeyHeader}>
        <span className="eyebrow">Interactive Experience</span>
        <h1 className={styles.journeyTitle}>The Agricultural Journey</h1>
        <p className={styles.journeyLead}>
          Explore how VAN connects every stage — from understanding the land to delivering produce to market.
        </p>
      </div>

      {/* ─── Mode Selector ─── */}
      <div className={styles.modeSelector}>
        <button
          className={`${styles.modeCard} ${state.mode === "explore" ? styles.modeCardActive : ""}`}
          onClick={() => state.setMode("explore")}
          aria-pressed={state.mode === "explore"}
        >
          <div className={styles.modeIcon}>🌍</div>
          <div className={styles.modeContent}>
            <div className={styles.modeTitle}>Explore the World</div>
            <div className={styles.modeDesc}>
              Freely explore every facility, asset, and operational area of VAN's agricultural infrastructure.
            </div>
          </div>
        </button>
        <button
          className={`${styles.modeCard} ${state.mode === "journey" ? styles.modeCardActive : ""}`}
          onClick={() => state.setMode("journey")}
          aria-pressed={state.mode === "journey"}
        >
          <div className={styles.modeIcon}>🔄</div>
          <div className={styles.modeContent}>
            <div className={styles.modeTitle}>Experience the Journey</div>
            <div className={styles.modeDesc}>
              Follow one crop through the entire agricultural lifecycle, from soil assessment to market delivery.
            </div>
          </div>
        </button>
      </div>

      {/* ─── Mode-Specific Controls ─── */}
      {state.mode === "journey" && (
        /* ─── Journey Mode: Stage Timeline ─── */
        <div className={styles.stageTimeline}>
          {journeyStages.map((stage) => (
            <button
              key={stage.id}
              className={`${styles.stageBtn} ${state.activeStage === stage.id ? styles.stageBtnActive : ""}`}
              onClick={() => state.setActiveStage(stage.id)}
              aria-label={`Go to stage ${stage.index}: ${stage.name}`}
            >
              <span className={styles.stageIndex}>{stage.index}</span>
              <span className={styles.stageName}>{stage.shortName}</span>
            </button>
          ))}
        </div>
      )}

      {state.mode === "explore" && (
        /* ─── Explore Mode: Category Filters ─── */
        <div className={styles.categoryFilters}>
          <div className={styles.categoryFilterHeader}>
            <span>Filter by category</span>
            <div className={styles.categoryFilterActions}>
              <button className={styles.filterActionBtn} onClick={state.showAllCategories}>Show all</button>
              <button className={styles.filterActionBtn} onClick={state.hideAllCategories}>Hide all</button>
            </div>
          </div>
          <div className={styles.categoryGrid}>
            {Object.entries(CATEGORY_INFO).map(([cat, info]) => (
              <button
                key={cat}
                className={`${styles.categoryChip} ${state.visibleCategories.has(cat as WorldCategory) ? styles.categoryChipActive : ""}`}
                onClick={() => state.toggleCategory(cat as WorldCategory)}
                aria-pressed={state.visibleCategories.has(cat as WorldCategory)}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
              </button>
            ))}
          </div>
          {state.visibleCategories.size === 0 && (
            <div className={styles.emptyState}>
              All categories hidden. <button onClick={state.showAllCategories}>Show all</button>
            </div>
          )}
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className={styles.journeyContent}>
        {/* 3D Canvas */}
        <div className={styles.canvasArea}>
          <JourneyCanvas />

          {/* Journey Controls (journey mode) */}
          {state.mode === "journey" && (
            <div className={styles.journeyControls}>
              {!state.playing ? (
                <button className={styles.ctrlBtn} onClick={state.startPlaying} aria-label="Play full journey">
                  ▶ Experience the full journey
                </button>
              ) : (
                <button className={styles.ctrlBtn} onClick={state.pausePlaying} aria-label="Pause journey">
                  ⏸ Pause
                </button>
              )}
              {state.playing && (
                <button className={styles.ctrlBtnSmall} onClick={state.restartPlaying} aria-label="Restart journey">
                  ↺ Restart
                </button>
              )}
              <button
                className={styles.ctrlBtnSmall}
                onClick={() => {
                  const idx = (state.stageIndex + 1) % journeyStages.length;
                  state.setActiveStage(journeyStages[idx].id);
                }}
                aria-label="Next stage"
              >
                Next →
              </button>
              <button
                className={styles.ctrlBtnSmall}
                onClick={state.resetCamera}
                aria-label="Reset camera view"
              >
                ⊙ Reset View
              </button>
            </div>
          )}

          {/* Explore Controls */}
          {state.mode === "explore" && (
            <div className={styles.journeyControls}>
              <button
                className={styles.ctrlBtnSmall}
                onClick={state.resetCamera}
                aria-label="Reset camera view"
              >
                ⊙ Overview
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        {state.mode === "journey" && (
          /* ─── Journey Info Panel ─── */
          <div className={styles.infoPanel}>
            <div className={styles.infoPanelHeader}>
              <span className={styles.infoPanelIndex}>{currentStage.index}</span>
              <h2 className={styles.infoPanelTitle}>{currentStage.name}</h2>
            </div>
            <p className={styles.infoPanelDesc}>{currentStage.description}</p>

            {/* Sub-step progress */}
            {currentStage.subSteps && currentStage.subSteps.length > 0 && (
              <div className={styles.subStepsSection}>
                <h4 className={styles.subStepsTitle}>Stage activities</h4>
                <div className={styles.subStepsList}>
                  {currentStage.subSteps.map((sub, idx) => {
                    const isActive = sub.id === state.activeSubStep;
                    const isCompleted = idx < currentStage.subSteps.findIndex((s) => s.id === state.activeSubStep);
                    return (
                      <button
                        key={sub.id}
                        className={`${styles.subStepItem} ${isActive ? styles.subStepActive : ""} ${isCompleted ? styles.subStepCompleted : ""}`}
                        onClick={() => state.setActiveSubStep(sub.id)}
                        aria-pressed={isActive}
                      >
                        <span className={styles.subStepNumber}>
                          {isCompleted ? "✓" : String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className={styles.subStepContent}>
                          <span className={styles.subStepName}>{sub.name}</span>
                          {isActive && <span className={styles.subStepDesc}>{sub.description}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

            {/* Cross-mode: Explore this infrastructure */}
            <button
              className={styles.crossModeBtn}
              onClick={state.navigateToExploreFromJourney}
            >
              🌍 Explore this infrastructure
            </button>

            {currentStage.nextStep && (
              <button
                className={styles.nextStageBtn}
                onClick={() => state.setActiveStage(currentStage.nextStep!)}
              >
                Next: {journeyStages.find((s) => s.id === currentStage.nextStep)?.shortName} →
              </button>
            )}
          </div>
        )}

        {state.mode === "explore" && (
          /* ─── Explore Location List ─── */
          <div className={styles.infoPanel}>
            <h3 className={styles.explorePanelTitle}>Locations</h3>
            <p className={styles.explorePanelDesc}>
              Select a location to explore. Click objects in the 3D world for details.
            </p>
            <div className={styles.locationList}>
              {worldLocations.map((loc) => (
                <button
                  key={loc.id}
                  className={`${styles.locationItem} ${state.selectedLocation?.id === loc.id ? styles.locationItemActive : ""}`}
                  onClick={() => state.setSelectedLocation(loc)}
                >
                  <div className={styles.locationItemHeader}>
                    <span className={styles.locationItemName}>{loc.name}</span>
                    <span className={styles.locationCategory}>{CATEGORY_INFO[loc.category]?.icon} {loc.category}</span>
                  </div>
                  <p className={styles.locationItemDesc}>{loc.description.slice(0, 100)}…</p>
                </button>
              ))}
            </div>

            {/* Selected location details */}
            {state.selectedLocation && (
              <div className={styles.locationDetail}>
                <h4>{state.selectedLocation.name}</h4>
                <p>{state.selectedLocation.description}</p>
                <div className={styles.infoPanelBlock}>
                  <h4>What VAN does here</h4>
                  <p>{state.selectedLocation.whatVANDoes}</p>
                </div>
                {state.selectedLocation.connections.length > 0 && (
                  <div className={styles.locationConnections}>
                    <h4>Connected to</h4>
                    <div className={styles.connectionList}>
                      {state.selectedLocation.connections.map((connId) => {
                        const conn = worldLocations.find((l) => l.id === connId);
                        return conn ? (
                          <button
                            key={conn.id}
                            className={styles.connectionChip}
                            onClick={() => state.setSelectedLocation(conn)}
                          >
                            {CATEGORY_INFO[conn.category]?.icon} {conn.name}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                {/* Cross-mode: Experience in journey */}
                {(() => {
                  const stage = LOCATION_TO_STAGE[state.selectedLocation!.category];
                  return stage ? (
                    <button
                      className={styles.crossModeBtn}
                      onClick={() => state.navigateToStageFromExplore(stage as JourneyStage)}
                    >
                      🔄 Experience in journey
                    </button>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Journey Completion Screen ─── */}
      {state.journeyCompleted && state.mode === "journey" && (
        <div className={styles.completionOverlay}>
          <div className={styles.completionCard}>
            <div className={styles.completionHeader}>
              <span className="eyebrow">Illustrative demonstration data</span>
              <h2 className={styles.completionTitle}>One complete agricultural journey.</h2>
              <p className={styles.completionLead}>
                From soil assessment to market delivery — here is the complete summary of this fictional crop cycle.
              </p>
            </div>

            <div className={styles.completionGrid}>
              {/* Farm info */}
              <div className={styles.completionBlock}>
                <h4>Farm & Farmer</h4>
                <div className={styles.completionData}>
                  <div>Farmer: <strong>{demoFarmer.name}</strong></div>
                  <div>Farm: <strong>{demoFarm.name}</strong></div>
                  <div>Area: <strong>{demoFarm.area} {demoFarm.unit}</strong></div>
                  <div>Fields: <strong>{demoFields.length}</strong></div>
                </div>
              </div>

              {/* Land assessment */}
              <div className={styles.completionBlock}>
                <h4>Land Assessment</h4>
                <div className={styles.completionData}>
                  {demoAssessments.filter((a) => a.soilTestStatus === "completed").map((a) => (
                    <div key={a.id}>
                      <div>pH: <strong>{a.ph}</strong></div>
                      <div>Organic Carbon: <strong>{a.organicCarbon}%</strong></div>
                      <div>Nitrogen: <strong>{a.nitrogen} kg/ha</strong></div>
                      <div>Texture: <strong>{a.texture}</strong></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className={styles.completionBlock}>
                <h4>Inputs Supplied</h4>
                <div className={styles.completionData}>
                  {demoInputs.slice(0, 3).map((inp) => (
                    <div key={inp.id}>{inp.name}: <strong>{inp.quantity} {inp.unit}</strong></div>
                  ))}
                </div>
              </div>

              {/* Machinery */}
              <div className={styles.completionBlock}>
                <h4>Machinery Utilised</h4>
                <div className={styles.completionData}>
                  {demoEquipment.filter((e) => e.status === "deployed").map((eq) => (
                    <div key={eq.id}>{eq.name}: <strong>{eq.currentActivity || eq.location}</strong></div>
                  ))}
                </div>
              </div>

              {/* Operations */}
              <div className={styles.completionBlock}>
                <h4>Operations Completed</h4>
                <div className={styles.completionData}>
                  {demoOperations.filter((op) => op.status === "completed").map((op) => (
                    <div key={op.id}>{op.type}: <strong>{op.notes}</strong></div>
                  ))}
                </div>
              </div>

              {/* Harvest */}
              <div className={styles.completionBlock}>
                <h4>Harvest & Processing</h4>
                <div className={styles.completionData}>
                  {demoHarvests.map((h) => (
                    <div key={h.id}>
                      <div>{h.crop}: <strong>{h.quantity} {h.unit}</strong></div>
                      <div>Quality: <strong>{h.quality}</strong></div>
                      <div>Processing: <strong>{h.processingStatus}</strong></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage & Shipment */}
              <div className={styles.completionBlock}>
                <h4>Storage & Shipment</h4>
                <div className={styles.completionData}>
                  {demoStorage.map((s) => (
                    <div key={s.id}>{s.location}: <strong>{s.quantity} {s.unit}</strong></div>
                  ))}
                  {demoShipments.map((s) => (
                    <div key={s.id}>{s.source} → {s.destination}: <strong>{s.dispatchStatus}</strong></div>
                  ))}
                </div>
              </div>

              {/* Financial summary */}
              <div className={styles.completionBlock}>
                <h4>Financial Summary</h4>
                <div className={styles.completionData}>
                  <div>Total Costs: <strong style={{ color: "#b91c1c" }}>
                    -{Math.abs(demoTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)).toLocaleString()} USD
                  </strong></div>
                  <div>Sales Revenue: <strong style={{ color: "#285c49" }}>
                    +{demoTransactions.filter((t) => t.category === "sales-revenue").reduce((s, t) => s + t.amount, 0).toLocaleString()} USD
                  </strong></div>
                  <div className={styles.completionNet}>
                    Estimated Result: <strong>
                      {(
                        demoTransactions.filter((t) => t.category === "sales-revenue").reduce((s, t) => s + t.amount, 0) +
                        demoTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
                      ).toLocaleString()} USD
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.completionActions}>
              <button className={styles.completionBtnPrimary} onClick={state.restartPlaying}>
                ↺ Replay Journey
              </button>
              <button className={styles.completionBtn} onClick={state.navigateToExploreFromJourney}>
                🌍 Explore the World
              </button>
              <Link href="/" className={styles.completionBtnLink}>
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Selected Object Info (both modes) ─── */}
      {state.selectedObject && (
        <div className={styles.objectInfo}>
          <div className={styles.objectInfoHeader}>
            <strong>{state.selectedObject.name}</strong>
            <span className={styles.objectType}>{state.selectedObject.type}</span>
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
              <p>{state.selectedObject.name} — {state.selectedObject.type}</p>
              <p className={styles.demoNote}>Part of the VAN agricultural operation</p>
            </div>
          )}
          <button className={styles.closeBtn} onClick={state.clearSelection}>✕ Close</button>
        </div>
      )}
    </div>
  );
}
