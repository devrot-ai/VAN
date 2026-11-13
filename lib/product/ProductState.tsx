/**
 * VAN Product — Shared State Context
 *
 * Manages the selected farm, field, and active module for the product dashboard.
 * Shares the same simulation data as the 3D Journey experience.
 */

"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { DemoFarmer, DemoFarm, DemoField } from "@/lib/simulation/types";
import { demoFarmer, demoFarm, demoFields } from "@/lib/simulation/demoData";

export type ProductModule =
  | "overview"
  | "farms"
  | "land-intelligence"
  | "inputs"
  | "machinery"
  | "operations"
  | "harvest"
  | "logistics"
  | "finance";

interface ProductState {
  // Farmer & Farm
  farmer: DemoFarmer;
  farm: DemoFarm;
  fields: DemoField[];

  // Selection
  selectedFieldId: string | null;
  selectedField: DemoField | null;
  setSelectedFieldId: (id: string | null) => void;

  // Navigation
  activeModule: ProductModule;
  setActiveModule: (module: ProductModule) => void;

  // 3D cross-navigation
  openIn3D: (context: { fieldId?: string; equipmentId?: string; stage?: string }) => void;
}

const ProductContext = createContext<ProductState | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [selectedFieldId, setSelectedFieldIdState] = useState<string | null>(demoFields[0]?.id || null);
  const [activeModule, setActiveModuleState] = useState<ProductModule>("overview");

  const selectedField = demoFields.find((f) => f.id === selectedFieldId) || null;

  const handleSetSelectedFieldId = useCallback((id: string | null) => {
    setSelectedFieldIdState(id);
  }, []);

  const setActiveModule = useCallback((module: ProductModule) => {
    setActiveModuleState(module);
  }, []);

  const openIn3D = useCallback((context: { fieldId?: string; equipmentId?: string; stage?: string }) => {
    // Build query params for /journey page
    const params = new URLSearchParams();
    if (context.stage) params.set("stage", context.stage);
    if (context.fieldId) params.set("field", context.fieldId);
    if (context.equipmentId) params.set("object", context.equipmentId);
    const query = params.toString();
    const url = query ? `/journey?${query}` : "/journey";
    window.open(url, "_blank");
  }, []);

  return (
    <ProductContext.Provider
      value={{
        farmer: demoFarmer,
        farm: demoFarm,
        fields: demoFields,
        selectedFieldId,
        selectedField,
        setSelectedFieldId: handleSetSelectedFieldId,
        activeModule,
        setActiveModule,
        openIn3D,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used within ProductProvider");
  return ctx;
}
