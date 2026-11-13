"use client";

/**
 * JourneyState — shared state context for the two-mode 3D experience.
 *
 * Manages:
 * - Active mode (explore / journey)
 * - Active journey stage and sub-step
 * - Selected object
 * - Visible world categories (explore mode)
 * - Selected location (explore mode)
 * - Playback state and journey completion
 * - Camera animation trigger
 * - Cross-mode navigation
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import * as THREE from "three";
import type { JourneyStage, JourneyMode, WorldCategory } from "@/lib/simulation/types";
import { LOCATION_TO_STAGE } from "@/lib/simulation/types";
import { journeyStages, worldLocations } from "@/lib/simulation/demoData";
import type { WorldLocation } from "@/lib/simulation/types";

interface JourneyStateValue {
  // Mode
  mode: JourneyMode;
  setMode: (mode: JourneyMode) => void;

  // Journey mode
  activeStage: JourneyStage;
  setActiveStage: (stage: JourneyStage) => void;
  activeSubStep: string;
  setActiveSubStep: (subStep: string) => void;
  playing: boolean;
  journeyCompleted: boolean;
  startPlaying: () => void;
  pausePlaying: () => void;
  restartPlaying: () => void;
  markJourneyComplete: () => void;
  clearJourneyComplete: () => void;
  stageIndex: number;

  // Cross-mode navigation
  navigateToStageFromExplore: (stage: JourneyStage) => void;
  navigateToExploreFromJourney: () => void;

  // Explore mode
  selectedLocation: WorldLocation | null;
  setSelectedLocation: (loc: WorldLocation | null) => void;
  visibleCategories: Set<WorldCategory>;
  toggleCategory: (cat: WorldCategory) => void;
  showAllCategories: () => void;
  hideAllCategories: () => void;

  // Shared
  selectedObject: { name: string; type: string; data?: Record<string, unknown> } | null;
  selectObject: (name: string, type: string, data?: Record<string, unknown>) => void;
  clearSelection: () => void;

  // Camera
  cameraTarget: THREE.Vector3;
  cameraLookAt: THREE.Vector3;
  animating: boolean;
  triggerCameraMove: (pos: THREE.Vector3, lookAt: THREE.Vector3) => void;
  resetCamera: () => void;
}

const JourneyStateContext = createContext<JourneyStateValue | null>(null);

const ALL_CATEGORIES: WorldCategory[] = [
  "fields", "soil-assessment", "inputs", "machinery", "workshop",
  "operations", "irrigation", "harvest", "processing", "storage",
  "cold-storage", "logistics", "market", "sensors",
];

const OVERVIEW_CAMERA = new THREE.Vector3(40, 35, 40);
const OVERVIEW_LOOKAT = new THREE.Vector3(0, 0, -5);

export function JourneyStateProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<JourneyMode>("journey");
  const [activeStage, setActiveStageState] = useState<JourneyStage>("land-assessment");
  const [activeSubStep, setActiveSubStepState] = useState<string>("");
  const [playing, setPlaying] = useState(false);
  const [journeyCompleted, setJourneyCompleted] = useState(false);
  const [selectedObject, setSelectedObject] = useState<{ name: string; type: string; data?: Record<string, unknown> } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<WorldLocation | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Set<WorldCategory>>(
    () => new Set(ALL_CATEGORIES)
  );
  const [cameraTarget, setCameraTarget] = useState(() => OVERVIEW_CAMERA.clone());
  const [cameraLookAt, setCameraLookAt] = useState(() => OVERVIEW_LOOKAT.clone());
  const [animating, setAnimating] = useState(false);
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stageIndex = journeyStages.findIndex((s) => s.id === activeStage);

  // ─── Camera ───
  const triggerCameraMove = useCallback((pos: THREE.Vector3, lookAt: THREE.Vector3) => {
    setCameraTarget(pos.clone());
    setCameraLookAt(lookAt.clone());
    setAnimating(true);
    setTimeout(() => setAnimating(false), 2200);
  }, []);

  // ─── Mode switching ───
  const setMode = useCallback((m: JourneyMode) => {
    setModeState(m);
    if (m === "explore") {
      triggerCameraMove(OVERVIEW_CAMERA.clone(), OVERVIEW_LOOKAT.clone());
    } else {
      const stage = journeyStages.find((s) => s.id === activeStage);
      if (stage) {
        triggerCameraMove(
          new THREE.Vector3(...stage.cameraPosition),
          new THREE.Vector3(...stage.cameraLookAt)
        );
      }
    }
  }, [activeStage, triggerCameraMove]);

  // ─── Cross-mode navigation ───
  const navigateToStageFromExplore = useCallback((stage: JourneyStage) => {
    setActiveStageState(stage);
    setSelectedObject(null);
    setSelectedLocation(null);
    const s = journeyStages.find((st) => st.id === stage);
    if (s) {
      // Set first sub-step
      if (s.subSteps && s.subSteps.length > 0) {
        setActiveSubStepState(s.subSteps[0].id);
      }
      triggerCameraMove(
        new THREE.Vector3(...s.cameraPosition),
        new THREE.Vector3(...s.cameraLookAt)
      );
    }
    setModeState("journey");
  }, [triggerCameraMove]);

  const navigateToExploreFromJourney = useCallback(() => {
    setSelectedObject(null);
    setModeState("explore");
    triggerCameraMove(OVERVIEW_CAMERA.clone(), OVERVIEW_LOOKAT.clone());
  }, [triggerCameraMove]);

  // ─── Reset camera ───
  const resetCamera = useCallback(() => {
    if (mode === "explore") {
      triggerCameraMove(OVERVIEW_CAMERA.clone(), OVERVIEW_LOOKAT.clone());
      setSelectedLocation(null);
    } else {
      const stage = journeyStages.find((s) => s.id === activeStage);
      if (stage) {
        triggerCameraMove(
          new THREE.Vector3(...stage.cameraPosition),
          new THREE.Vector3(...stage.cameraLookAt)
        );
      }
    }
  }, [mode, activeStage, triggerCameraMove]);

  // ─── Stage navigation ───
  const handleSetActiveStage = useCallback((stage: JourneyStage) => {
    setActiveStageState(stage);
    setSelectedObject(null);
    const s = journeyStages.find((st) => st.id === stage);
    if (s) {
      // Auto-set first sub-step
      if (s.subSteps && s.subSteps.length > 0) {
        setActiveSubStepState(s.subSteps[0].id);
      }
      triggerCameraMove(
        new THREE.Vector3(...s.cameraPosition),
        new THREE.Vector3(...s.cameraLookAt)
      );
    }
  }, [triggerCameraMove]);

  const handleSetActiveSubStep = useCallback((subStep: string) => {
    setActiveSubStepState(subStep);
  }, []);

  // ─── Playback ───
  const startPlaying = useCallback(() => {
    setPlaying(true);
    setJourneyCompleted(false);
    let idx = 0;
    handleSetActiveStage(journeyStages[idx].id);
    playTimer.current = setInterval(() => {
      idx++;
      if (idx >= journeyStages.length) {
        setPlaying(false);
        setJourneyCompleted(true);
        if (playTimer.current) clearInterval(playTimer.current);
        return;
      }
      handleSetActiveStage(journeyStages[idx].id);
    }, 5000);
  }, [handleSetActiveStage]);

  const pausePlaying = useCallback(() => {
    setPlaying(false);
    if (playTimer.current) clearInterval(playTimer.current);
  }, []);

  const restartPlaying = useCallback(() => {
    pausePlaying();
    setJourneyCompleted(false);
    setTimeout(() => startPlaying(), 100);
  }, [pausePlaying, startPlaying]);

  const markJourneyComplete = useCallback(() => {
    setJourneyCompleted(true);
    setPlaying(false);
    if (playTimer.current) clearInterval(playTimer.current);
  }, []);

  const clearJourneyComplete = useCallback(() => {
    setJourneyCompleted(false);
  }, []);

  useEffect(() => {
    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, []);

  // ─── Object selection ───
  const selectObject = useCallback((name: string, type: string, data?: Record<string, unknown>) => {
    setSelectedObject({ name, type, data });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedObject(null);
  }, []);

  // ─── Category filtering ───
  const toggleCategory = useCallback((cat: WorldCategory) => {
    setVisibleCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const showAllCategories = useCallback(() => {
    setVisibleCategories(new Set(ALL_CATEGORIES));
  }, []);

  const hideAllCategories = useCallback(() => {
    setVisibleCategories(new Set());
  }, []);

  // ─── Location selection ───
  const handleSetSelectedLocation = useCallback((loc: WorldLocation | null) => {
    setSelectedLocation(loc);
    if (loc) {
      triggerCameraMove(
        new THREE.Vector3(...loc.cameraPosition),
        new THREE.Vector3(...loc.cameraLookAt)
      );
    }
  }, [triggerCameraMove]);

  const value: JourneyStateValue = {
    mode,
    setMode,
    activeStage,
    setActiveStage: handleSetActiveStage,
    activeSubStep,
    setActiveSubStep: handleSetActiveSubStep,
    playing,
    journeyCompleted,
    startPlaying,
    pausePlaying,
    restartPlaying,
    markJourneyComplete,
    clearJourneyComplete,
    stageIndex,
    navigateToStageFromExplore,
    navigateToExploreFromJourney,
    selectedLocation,
    setSelectedLocation: handleSetSelectedLocation,
    visibleCategories,
    toggleCategory,
    showAllCategories,
    hideAllCategories,
    selectedObject,
    selectObject,
    clearSelection,
    cameraTarget,
    cameraLookAt,
    animating,
    triggerCameraMove,
    resetCamera,
  };

  return (
    <JourneyStateContext.Provider value={value}>
      {children}
    </JourneyStateContext.Provider>
  );
}

export function useJourneyState(): JourneyStateValue {
  const ctx = useContext(JourneyStateContext);
  if (!ctx) throw new Error("useJourneyState must be used within JourneyStateProvider");
  return ctx;
}

// Export for use in page.tsx
export { LOCATION_TO_STAGE };
