/**
 * VAN Product — Shared State Context
 *
 * Manages the selected farm, field, and active module for the product dashboard.
 * Shares the same simulation data as the 3D Journey experience.
 * Module state is synced with URL search params for shareable links.
 */

"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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

const VALID_MODULES: ProductModule[] = [
  "overview", "farms", "land-intelligence", "inputs", "machinery",
  "operations", "harvest", "logistics", "finance",
];

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

  // Product cross-navigation (from 3D)
  openInProduct: (module: ProductModule, fieldId?: string) => void;
}

const ProductContext = createContext<ProductState | null>(null);

/**
 * Inner component that safely reads URL search params.
 * Wrapped in Suspense to handle Next.js data requirements.
 */
function ProductProviderInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlModule = searchParams.get("module");
  const initialModule = VALID_MODULES.includes(urlModule as ProductModule)
    ? (urlModule as ProductModule)
    : "overview";

  const [selectedFieldId, setSelectedFieldIdState] = useState<string | null>(demoFields[0]?.id || null);
  const [activeModule, setActiveModuleState] = useState<ProductModule>(initialModule);

  // Sync URL when module changes
  const setActiveModule = useCallback((module: ProductModule) => {
    setActiveModuleState(module);
    const params = new URLSearchParams(searchParams.toString());
    params.set("module", module);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Sync state when URL changes (e.g., back/forward navigation)
  useEffect(() => {
    if (urlModule && VALID_MODULES.includes(urlModule as ProductModule)) {
      setActiveModuleState(urlModule as ProductModule);
    }
  }, [urlModule]);

  const selectedField = demoFields.find((f) => f.id === selectedFieldId) || null;

  const handleSetSelectedFieldId = useCallback((id: string | null) => {
    setSelectedFieldIdState(id);
  }, []);

  const openIn3D = useCallback((context: { fieldId?: string; equipmentId?: string; stage?: string }) => {
    const params = new URLSearchParams();
    if (context.stage) params.set("stage", context.stage);
    if (context.fieldId) params.set("field", context.fieldId);
    if (context.equipmentId) params.set("object", context.equipmentId);
    const query = params.toString();
    const url = query ? `/journey?${query}` : "/journey";
    window.open(url, "_blank");
  }, []);

  const openInProduct = useCallback((module: ProductModule, fieldId?: string) => {
    const params = new URLSearchParams();
    params.set("module", module);
    if (fieldId) params.set("field", fieldId);
    router.push(`/product?${params.toString()}`);
  }, [router]);

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
        openInProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function ProductProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        Loading...
      </div>
    }>
      <ProductProviderInner>{children}</ProductProviderInner>
    </Suspense>
  );
}

export function useProduct() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used within ProductProvider");
  return ctx;
}
