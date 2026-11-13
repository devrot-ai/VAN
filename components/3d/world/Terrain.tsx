"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Terrain — the ground plane with subtle undulation and field zones.
 * Each zone has a distinct colour representing its role in the agricultural world.
 */

const ZONES = [
  // [x, z, width, depth, color, name]
  [0, 0, 20, 16, "#8faa7d", "assessment-field"], // Stage 1: Land assessment
  [-35, 0, 16, 14, "#a89878", "inputs-depot"], // Stage 2: Inputs
  [0, 10, 18, 10, "#9e9080", "machinery-yard"], // Stage 3: Machinery
  [10, -10, 20, 14, "#7daa6e", "operations-field"], // Stage 4: Operations
  [-25, -20, 20, 14, "#c4a86a", "harvest-area"], // Stage 5: Harvest
  [0, -30, 16, 12, "#b0a890", "finance-market"], // Stage 6: Finance
];

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -5]} receiveShadow>
        <planeGeometry args={[120, 100]} />
        <meshStandardMaterial color="#a8b896" />
      </mesh>

      {/* Field zones */}
      {ZONES.map(([x, z, w, d, color], i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[Number(x), 0.01, Number(z)]}
          receiveShadow
        >
          <planeGeometry args={[Number(w), Number(d)]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
      ))}

      {/* Roads connecting zones */}
      {/* Main horizontal road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5]} receiveShadow>
        <planeGeometry args={[80, 3]} />
        <meshStandardMaterial color="#c8bfa8" roughness={0.95} />
      </mesh>
      {/* Vertical road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.02, -5]} receiveShadow>
        <planeGeometry args={[3, 40]} />
        <meshStandardMaterial color="#c8bfa8" roughness={0.95} />
      </mesh>
      {/* Cross road to harvest */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0.02, -12]} receiveShadow>
        <planeGeometry args={[20, 3]} />
        <meshStandardMaterial color="#c8bfa8" roughness={0.95} />
      </mesh>
      {/* Road to finance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -22]} receiveShadow>
        <planeGeometry args={[3, 12]} />
        <meshStandardMaterial color="#c8bfa8" roughness={0.95} />
      </mesh>

      {/* Field boundary lines — simplified, using just numbers */}
      {ZONES.map(([x, z, w, d], i) => (
        <mesh
          key={`border-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[Number(x), 0.03, Number(z)]}
        >
          <ringGeometry args={[0, 0, Math.max(Number(w), Number(d)) * 0.71, 4, 1, Math.PI * 2]} />
          <meshStandardMaterial color="#6b7a5a" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Field rows — visual crop rows on a field zone
 */
export function FieldRows({
  position,
  count = 8,
  length = 14,
  color = "#6da85a",
  height = 0.3,
}: {
  position: [number, number, number];
  count?: number;
  length?: number;
  color?: string;
  height?: number;
}) {
  const spacing = 1.2;
  const totalWidth = count * spacing;
  const startX = -totalWidth / 2 + spacing / 2;

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[startX + i * spacing, height / 2, 0]}
          castShadow
        >
          <boxGeometry args={[0.6, height, length]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Soil sample markers — small cones indicating soil test points
 */
export function SoilMarkers({
  position,
  count = 5,
}: {
  position: [number, number, number];
  count?: number;
}) {
  const points = [
    [-4, 0, -3],
    [2, 0, -4],
    [-1, 0, 2],
    [5, 0, 1],
    [-3, 0, 4],
  ];

  return (
    <group position={position}>
      {points.slice(0, count).map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Marker post */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
            <meshStandardMaterial color="#c48a47" />
          </mesh>
          {/* Flag */}
          <mesh position={[0.15, 0.9, 0]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.4, 0.25, 0.02]} />
            <meshStandardMaterial color="#173d32" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
