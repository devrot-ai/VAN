"use client";

/**
 * World — composes all 3D elements into one connected agricultural world.
 * Each zone corresponds to a stage in the agricultural journey.
 * Key objects are wrapped in InteractiveObject for click selection.
 */

import { Terrain, FieldRows, SoilMarkers } from "./Terrain";
import {
  Warehouse,
  Silo,
  ProcessingFacility,
  ColdStorage,
  Workshop,
  MarketBuilding,
} from "../buildings";
import {
  Tractor,
  CombineHarvester,
  Truck,
  Sprayer,
  SeedDrill,
  IrrigationPump,
} from "../machinery";
import {
  Tree,
  Hedgerow,
  CropPlants,
  MatureCrop,
  FieldWorker,
  WaterChannel,
  WeatherStation,
} from "../vegetation";
import { InteractiveObject } from "../InteractiveObject";

export function World({
  onSelectObject,
}: {
  onSelectObject?: (name: string, type: string, data?: Record<string, unknown>) => void;
}) {
  return (
    <group>
      {/* ─── Ground & Roads ─── */}
      <Terrain />

      {/* ─── Stage 1: Land Assessment (center) ─── */}
      <group name="stage-land-assessment">
        <SoilMarkers position={[0, 0, 0]} count={5} />
        <FieldRows position={[0, 0, 0]} count={6} length={12} color="#7daa6e" height={0.2} />
        {onSelectObject && (
          <InteractiveObject
            name="Weather Station"
            type="equipment"
            data={{ id: "eq-weather-01" }}
            onSelect={onSelectObject}
          >
            <WeatherStation position={[8, 0, -4]} />
          </InteractiveObject>
        )}
        <Hedgerow position={[0, 0, -8]} length={18} />
        <Tree position={[-10, 0, -6]} scale={0.8} />
        <Tree position={[10, 0, -7]} scale={0.9} />
        <Tree position={[-8, 0, 6]} scale={0.7} />
      </group>

      {/* ─── Stage 2: Inputs & Procurement (west) ─── */}
      <group name="stage-inputs">
        {onSelectObject && (
          <InteractiveObject
            name="Main Seed Depot"
            type="warehouse"
            data={{ id: "warehouse-seed" }}
            onSelect={onSelectObject}
          >
            <Warehouse position={[-38, 0, -2]} scale={1} />
          </InteractiveObject>
        )}
        <Warehouse position={[-32, 0, 3]} scale={0.8} color="#c8c0b0" />
        {onSelectObject && (
          <InteractiveObject
            name="VAN Delivery Truck"
            type="truck"
            data={{ id: "eq-005" }}
            onSelect={onSelectObject}
          >
            <Truck position={[-28, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.7} />
          </InteractiveObject>
        )}
        <Tree position={[-42, 0, 5]} scale={0.7} />
        <Tree position={[-26, 0, -4]} scale={0.6} />
        {/* Input bags / crates */}
        {[
          [-35, 0.3, 5],
          [-34, 0.3, 5.5],
          [-36, 0.3, 5.2],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.5]} />
            <meshStandardMaterial color="#c48a47" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ─── Stage 3: Machinery Yard (south-east) ─── */}
      <group name="stage-machinery">
        {onSelectObject && (
          <InteractiveObject
            name="Machinery Workshop"
            type="workshop"
            data={{ id: "workshop-01" }}
            onSelect={onSelectObject}
          >
            <Workshop position={[5, 0, 14]} scale={1} />
          </InteractiveObject>
        )}
        {onSelectObject && (
          <InteractiveObject
            name="John Deere 8R 410"
            type="tractor"
            data={{ id: "eq-001" }}
            onSelect={onSelectObject}
          >
            <Tractor position={[-4, 0, 12]} rotation={[0, 0.3, 0]} scale={0.8} />
          </InteractiveObject>
        )}
        {onSelectObject && (
          <InteractiveObject
            name="Case IH Magnum 340"
            type="tractor"
            data={{ id: "eq-004" }}
            onSelect={onSelectObject}
          >
            <Tractor position={[8, 0, 13]} rotation={[0, -0.2, 0]} scale={0.8} color="#3a6b35" />
          </InteractiveObject>
        )}
        {onSelectObject && (
          <InteractiveObject
            name="John Deere 784 Sprayer"
            type="sprayer"
            data={{ id: "eq-003" }}
            onSelect={onSelectObject}
          >
            <Sprayer position={[-2, 0, 16]} rotation={[0, 0.5, 0]} scale={0.7} />
          </InteractiveObject>
        )}
        <SeedDrill position={[6, 0, 16]} rotation={[0, -0.3, 0]} scale={0.7} />
        <IrrigationPump position={[10, 0, 16]} scale={0.8} />
        <Tree position={[-8, 0, 16]} scale={0.6} />
        <Tree position={[12, 0, 17]} scale={0.7} />
      </group>

      {/* ─── Stage 4: Farm Operations (east) ─── */}
      <group name="stage-operations">
        <CropPlants position={[10, 0, -10]} rows={5} cols={8} height={0.5} color="#5a9a4a" />
        <MatureCrop position={[16, 0, -6]} rows={4} cols={6} />
        <Tractor position={[8, 0, -12]} rotation={[0, 0.5, 0]} scale={0.7} animate />
        <IrrigationPump position={[18, 0, -14]} scale={0.7} />
        <WaterChannel position={[14, 0, -16]} length={10} rotation={0.2} />
        <FieldWorker position={[6, 0, -8]} color="#c48a47" />
        <FieldWorker position={[12, 0, -14]} color="#728b51" />
        <WeatherStation position={[18, 0, -4]} />
        <Hedgerow position={[10, 0, -18]} length={16} />
        <Tree position={[22, 0, -16]} scale={0.8} />
        <Tree position={[4, 0, -16]} scale={0.7} />
      </group>

      {/* ─── Stage 5: Harvest, Processing, Storage (north-west) ─── */}
      <group name="stage-harvest">
        {onSelectObject && (
          <InteractiveObject
            name="Claas Lexion 8900"
            type="combine"
            data={{ id: "eq-002" }}
            onSelect={onSelectObject}
          >
            <CombineHarvester position={[-22, 0, -16]} rotation={[0, 0.3, 0]} scale={0.8} />
          </InteractiveObject>
        )}
        <Truck position={[-18, 0, -12]} rotation={[0, -0.5, 0]} scale={0.7} />
        {onSelectObject && (
          <InteractiveObject
            name="Processing Facility"
            type="processing"
            data={{ id: "facility-01" }}
            onSelect={onSelectObject}
          >
            <ProcessingFacility position={[-30, 0, -22]} scale={0.9} />
          </InteractiveObject>
        )}
        {onSelectObject && (
          <InteractiveObject
            name="Grain Silo A"
            type="silo"
            data={{ id: "storage-001" }}
            onSelect={onSelectObject}
          >
            <Silo position={[-26, 0, -26]} scale={0.9} />
          </InteractiveObject>
        )}
        {onSelectObject && (
          <InteractiveObject
            name="Grain Silo B"
            type="silo"
            data={{ id: "storage-002" }}
            onSelect={onSelectObject}
          >
            <Silo position={[-24, 0, -26]} scale={0.8} />
          </InteractiveObject>
        )}
        {onSelectObject && (
          <InteractiveObject
            name="Cold Storage"
            type="cold-storage"
            data={{ id: "storage-003" }}
            onSelect={onSelectObject}
          >
            <ColdStorage position={[-34, 0, -18]} scale={0.8} />
          </InteractiveObject>
        )}
        <Warehouse position={[-20, 0, -24]} scale={0.8} color="#c8c0b0" />
        <Truck position={[-16, 0, -22]} rotation={[0, Math.PI / 2, 0]} scale={0.6} />
        <FieldWorker position={[-24, 0, -14]} color="#c48a47" />
        <FieldWorker position={[-28, 0, -18]} color="#728b51" />
        <Hedgerow position={[-25, 0, -28]} length={16} />
        <Tree position={[-38, 0, -24]} scale={0.7} />
        <Tree position={[-14, 0, -26]} scale={0.6} />
      </group>

      {/* ─── Stage 6: Finance & Market (north) ─── */}
      <group name="stage-finance">
        {onSelectObject && (
          <InteractiveObject
            name="Market & Distribution Centre"
            type="market"
            data={{ id: "market-01" }}
            onSelect={onSelectObject}
          >
            <MarketBuilding position={[0, 0, -30]} scale={1} />
          </InteractiveObject>
        )}
        <Truck position={[-6, 0, -28]} rotation={[0, Math.PI / 3, 0]} scale={0.6} />
        <Truck position={[6, 0, -26]} rotation={[0, -Math.PI / 4, 0]} scale={0.6} />
        <Warehouse position={[-8, 0, -34]} scale={0.7} />
        <Tree position={[-10, 0, -26]} scale={0.6} />
        <Tree position={[10, 0, -32]} scale={0.7} />
        <Tree position={[8, 0, -36]} scale={0.6} />
        <FieldWorker position={[-4, 0, -27]} color="#5f6a61" />
      </group>

      {/* ─── Scenic trees around the perimeter ─── */}
      <Tree position={[-15, 0, 8]} scale={0.8} />
      <Tree position={[15, 0, 8]} scale={0.7} />
      <Tree position={[-20, 0, -5]} scale={0.9} />
      <Tree position={[20, 0, 5]} scale={0.8} />
      <Tree position={[-10, 0, -15]} scale={0.7} />
      <Tree position={[5, 0, -18]} scale={0.6} />
      <Tree position={[-5, 0, 18]} scale={0.8} />
      <Tree position={[12, 0, 18]} scale={0.7} />
    </group>
  );
}
