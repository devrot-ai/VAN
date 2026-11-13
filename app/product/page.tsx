/**
 * VAN Product — Main Page
 *
 * Renders the active module based on state.
 */

"use client";

import { useProduct } from "@/lib/product/ProductState";
import ModuleOverview from "@/components/product/modules/ModuleOverview";
import ModuleFarms from "@/components/product/modules/ModuleFarms";
import ModuleLandIntelligence from "@/components/product/modules/ModuleLandIntelligence";
import ModuleInputs from "@/components/product/modules/ModuleInputs";
import ModuleMachinery from "@/components/product/modules/ModuleMachinery";
import ModuleOperations from "@/components/product/modules/ModuleOperations";
import ModuleHarvest from "@/components/product/modules/ModuleHarvest";
import ModuleLogistics from "@/components/product/modules/ModuleLogistics";
import ModuleFinance from "@/components/product/modules/ModuleFinance";

const MODULE_COMPONENTS = {
  "overview": ModuleOverview,
  "farms": ModuleFarms,
  "land-intelligence": ModuleLandIntelligence,
  "inputs": ModuleInputs,
  "machinery": ModuleMachinery,
  "operations": ModuleOperations,
  "harvest": ModuleHarvest,
  "logistics": ModuleLogistics,
  "finance": ModuleFinance,
} as const;

export default function ProductPage() {
  const { activeModule } = useProduct();
  const ModuleComponent = MODULE_COMPONENTS[activeModule] || ModuleOverview;

  return <ModuleComponent />;
}
