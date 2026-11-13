"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Tractor — detailed agricultural tractor with cabin, wheels with treads,
 * engine hood, exhaust, headlights, and front loader attachment
 */
export function Tractor({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color = "#285c49",
  animate = false,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  animate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (animate && wheelRef.current) {
      wheelRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x += delta * 2;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* ── Chassis frame ── */}
      <mesh position={[0, 0.6 * scale, 0]} castShadow>
        <boxGeometry args={[2.8 * scale, 0.4 * scale, 1.2 * scale]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* ── Engine hood (front) ── */}
      <mesh position={[1.1 * scale, 1.0 * scale, 0]} castShadow>
        <boxGeometry args={[1.4 * scale, 0.8 * scale, 1.3 * scale]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Hood vent lines */}
      <mesh position={[1.1 * scale, 1.0 * scale, 0.66 * scale]}>
        <boxGeometry args={[1.2 * scale, 0.05 * scale, 0.02]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      <mesh position={[1.1 * scale, 0.85 * scale, 0.66 * scale]}>
        <boxGeometry args={[1.2 * scale, 0.05 * scale, 0.02]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* ── Cabin (enclosed) ── */}
      <mesh position={[-0.2 * scale, 1.5 * scale, 0]} castShadow>
        <boxGeometry args={[1.0 * scale, 1.0 * scale, 1.1 * scale]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Cabin roof */}
      <mesh position={[-0.2 * scale, 2.05 * scale, 0]} castShadow>
        <boxGeometry args={[1.1 * scale, 0.05 * scale, 1.2 * scale]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
      {/* Front windshield */}
      <mesh position={[-0.2 * scale, 1.55 * scale, 0.56 * scale]}>
        <boxGeometry args={[0.8 * scale, 0.6 * scale, 0.02]} />
        <meshStandardMaterial color="#8ab4d0" roughness={0.05} metalness={0.5} transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      <mesh position={[-0.2 * scale, 1.55 * scale, 0.56 * scale]}>
        <boxGeometry args={[0.8 * scale, 0.6 * scale, 0.02]} />
        <meshStandardMaterial color="#8ab4d0" roughness={0.05} metalness={0.5} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.71 * scale, 1.55 * scale, 0]}>
        <boxGeometry args={[0.02, 0.5 * scale, 0.8 * scale]} />
        <meshStandardMaterial color="#8ab4d0" roughness={0.05} metalness={0.5} transparent opacity={0.7} />
      </mesh>

      {/* ── Exhaust stack ── */}
      <mesh position={[1.6 * scale, 1.7 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.06 * scale, 0.08 * scale, 0.7 * scale, 8]} />
        <meshStandardMaterial color="#5a5a5a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Exhaust cap */}
      <mesh position={[1.6 * scale, 2.1 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.1 * scale, 0.06 * scale, 0.1 * scale, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.5} />
      </mesh>

      {/* ── Rear weight ballast ── */}
      <mesh position={[-1.2 * scale, 0.7 * scale, 0]} castShadow>
        <boxGeometry args={[0.4 * scale, 0.5 * scale, 1.0 * scale]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* ── Wheels with treads ── */}
      <group ref={wheelRef}>
        {/* Rear wheels (large with tread pattern) */}
        {[0.9, -0.9].map((z, i) => (
          <group key={`rear-${i}`} position={[-0.7 * scale, 0.55 * scale, z * scale]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.5 * scale, 0.5 * scale, 0.35 * scale, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
            </mesh>
            {/* Wheel rim */}
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3 * scale, 0.3 * scale, 0.36 * scale, 16]} />
              <meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />
            </mesh>
            {/* Tread ridges */}
            {Array.from({ length: 8 }).map((_, j) => (
              <mesh
                key={`tread-${j}`}
                position={[0, 0, (j - 3.5) * 0.04 * scale]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[0.5 * scale, 0.03 * scale, 4, 16]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Front wheels (smaller) */}
        {[0.75, -0.75].map((z, i) => (
          <group key={`front-${i}`} position={[1.0 * scale, 0.35 * scale, z * scale]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.35 * scale, 0.35 * scale, 0.28 * scale, 12]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
            </mesh>
            {/* Wheel rim */}
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2 * scale, 0.2 * scale, 0.29 * scale, 12]} />
              <meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Headlights ── */}
      {[0.4, -0.4].map((z, i) => (
        <group key={`headlight-${i}`} position={[1.8 * scale, 0.9 * scale, z * scale]}>
          <mesh>
            <sphereGeometry args={[0.08 * scale, 8, 8]} />
            <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.05, 0, 0]}>
            <cylinderGeometry args={[0.06 * scale, 0.08 * scale, 0.05 * scale, 8]} />
            <meshStandardMaterial color="#5a5a5a" metalness={0.5} />
          </mesh>
        </group>
      ))}

      {/* ── Front bumper ── */}
      <mesh position={[1.8 * scale, 0.5 * scale, 0]} castShadow>
        <boxGeometry args={[0.1 * scale, 0.3 * scale, 1.3 * scale]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* ── Step / running board ── */}
      <mesh position={[-0.2 * scale, 0.4 * scale, 0.7 * scale]} castShadow>
        <boxGeometry args={[0.8 * scale, 0.05 * scale, 0.2 * scale]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Combine Harvester — detailed harvesting machine with header, cabin,
 * grain tank, auger, wheels, and exhaust
 */
export function CombineHarvester({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* ── Main body / chassis ── */}
      <mesh position={[0, 1.0 * scale, 0]} castShadow>
        <boxGeometry args={[3.5 * scale, 0.8 * scale, 2.2 * scale]} />
        <meshStandardMaterial color="#285c49" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* ── Cabin (enclosed with glass) ── */}
      <mesh position={[-0.3 * scale, 2.0 * scale, 0]} castShadow>
        <boxGeometry args={[1.0 * scale, 1.2 * scale, 1.3 * scale]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Cabin roof */}
      <mesh position={[-0.3 * scale, 2.65 * scale, 0]} castShadow>
        <boxGeometry args={[1.1 * scale, 0.05 * scale, 1.4 * scale]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
      {/* Front windshield */}
      <mesh position={[-0.3 * scale, 2.05 * scale, 0.66 * scale]}>
        <boxGeometry args={[0.8 * scale, 0.7 * scale, 0.02]} />
        <meshStandardMaterial color="#8ab4d0" roughness={0.05} metalness={0.5} transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      <mesh position={[-0.81 * scale, 2.05 * scale, 0]}>
        <boxGeometry args={[0.02, 0.6 * scale, 0.9 * scale]} />
        <meshStandardMaterial color="#8ab4d0" roughness={0.05} metalness={0.5} transparent opacity={0.7} />
      </mesh>

      {/* ── Header / cutting bar (front) ── */}
      <mesh position={[2.2 * scale, 0.5 * scale, 0]} castShadow>
        <boxGeometry args={[1.8 * scale, 0.25 * scale, 3.5 * scale]} />
        <meshStandardMaterial color="#c48a47" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Header reel */}
      <mesh position={[3.1 * scale, 0.8 * scale, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05 * scale, 0.05 * scale, 3.5 * scale, 8]} />
        <meshStandardMaterial color="#5a5a5a" metalness={0.5} />
      </mesh>
      {/* Reel tines */}
      {[-1.5, -0.75, 0, 0.75, 1.5].map((z, i) => (
        <mesh key={`tine-${i}`} position={[3.1 * scale, 1.2 * scale, z * scale]}>
          <boxGeometry args={[0.3 * scale, 0.03 * scale, 0.03 * scale]} />
          <meshStandardMaterial color="#5a5a5a" metalness={0.5} />
        </mesh>
      ))}

      {/* ── Grain tank (top) ── */}
      <mesh position={[-0.8 * scale, 1.7 * scale, 0]} castShadow>
        <boxGeometry args={[2.2 * scale, 0.7 * scale, 1.8 * scale]} />
        <meshStandardMaterial color="#d4cbb8" roughness={0.7} />
      </mesh>
      {/* Grain tank lid */}
      <mesh position={[-0.8 * scale, 2.1 * scale, 0]} castShadow>
        <boxGeometry args={[2.3 * scale, 0.05 * scale, 1.9 * scale]} />
        <meshStandardMaterial color="#b0a898" roughness={0.6} />
      </mesh>

      {/* ── Auger / unloading pipe ── */}
      <mesh position={[-0.8 * scale, 2.6 * scale, 1.3 * scale]} rotation={[0, 0, 0.15]} castShadow>
        <cylinderGeometry args={[0.12 * scale, 0.12 * scale, 2.5 * scale, 8]} />
        <meshStandardMaterial color="#6a6050" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Auger end */}
      <mesh position={[-0.8 * scale, 2.6 * scale, 2.5 * scale]} castShadow>
        <cylinderGeometry args={[0.15 * scale, 0.12 * scale, 0.3 * scale, 8]} />
        <meshStandardMaterial color="#5a5040" metalness={0.4} />
      </mesh>

      {/* ── Exhaust stack ── */}
      <mesh position={[1.3 * scale, 1.9 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.05 * scale, 0.07 * scale, 0.8 * scale, 8]} />
        <meshStandardMaterial color="#5a5a5a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* ── Wheels ── */}
      {[
        [1.3, 0.45, 1.2],
        [1.3, 0.45, -1.2],
        [-1.3, 0.45, 1.2],
        [-1.3, 0.45, -1.2],
      ].map(([x, y, z], i) => (
        <group key={`wheel-${i}`} position={[x * scale, y * scale, z * scale]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45 * scale, 0.45 * scale, 0.3 * scale, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
          </mesh>
          {/* Rim */}
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25 * scale, 0.25 * scale, 0.31 * scale, 16]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* ── Front bumper ── */}
      <mesh position={[2.0 * scale, 0.7 * scale, 0]} castShadow>
        <boxGeometry args={[0.1 * scale, 0.3 * scale, 2.3 * scale]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Agricultural Truck — transport truck with detailed cab, trailer,
 * wheels, and cargo cover
 */
export function Truck({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color = "#285c49",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* ── Cab ── */}
      <mesh position={[1.5 * scale, 0.9 * scale, 0]} castShadow>
        <boxGeometry args={[1.4 * scale, 1.0 * scale, 1.3 * scale]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Cab roof */}
      <mesh position={[1.5 * scale, 1.45 * scale, 0]} castShadow>
        <boxGeometry args={[1.5 * scale, 0.05 * scale, 1.4 * scale]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[2.21 * scale, 1.0 * scale, 0]}>
        <boxGeometry args={[0.02, 0.5 * scale, 1.1 * scale]} />
        <meshStandardMaterial color="#8ab4d0" roughness={0.05} metalness={0.5} transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      {[0.66, -0.66].map((z, i) => (
        <mesh key={`side-win-${i}`} position={[1.5 * scale, 1.0 * scale, z * scale]}>
          <boxGeometry args={[1.0 * scale, 0.4 * scale, 0.02]} />
          <meshStandardMaterial color="#8ab4d0" roughness={0.05} metalness={0.5} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Cab door line */}
      <mesh position={[1.5 * scale, 0.9 * scale, 0.66 * scale]}>
        <boxGeometry args={[0.8 * scale, 0.02 * scale, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Mirror */}
      {[0.7, -0.7].map((z, i) => (
        <mesh key={`mirror-${i}`} position={[1.9 * scale, 1.2 * scale, z * scale]}>
          <boxGeometry args={[0.1 * scale, 0.15 * scale, 0.05]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.4} />
        </mesh>
      ))}

      {/* ── Trailer body ── */}
      <mesh position={[-1 * scale, 0.8 * scale, 0]} castShadow>
        <boxGeometry args={[3.2 * scale, 1.4 * scale, 1.7 * scale]} />
        <meshStandardMaterial color="#d4cbb8" roughness={0.7} />
      </mesh>
      {/* Trailer roof / tarp */}
      <mesh position={[-1 * scale, 1.55 * scale, 0]} castShadow>
        <boxGeometry args={[3.3 * scale, 0.08 * scale, 1.8 * scale]} />
        <meshStandardMaterial color="#8a7e6a" roughness={0.8} />
      </mesh>
      {/* Trailer side rails */}
      {[0.86, -0.86].map((z, i) => (
        <mesh key={`rail-${i}`} position={[-1 * scale, 1.5 * scale, z * scale]} castShadow>
          <boxGeometry args={[3.2 * scale, 0.05 * scale, 0.05]} />
          <meshStandardMaterial color="#6a6050" metalness={0.3} />
        </mesh>
      ))}
      {/* Trailer rear door */}
      <mesh position={[-2.61 * scale, 0.8 * scale, 0]}>
        <boxGeometry args={[0.02, 1.3 * scale, 1.6 * scale]} />
        <meshStandardMaterial color="#b0a898" roughness={0.7} />
      </mesh>

      {/* ── Chassis frame ── */}
      <mesh position={[-0.2 * scale, 0.35 * scale, 0]} castShadow>
        <boxGeometry args={[4 * scale, 0.15 * scale, 0.3 * scale]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.4} />
      </mesh>

      {/* ── Wheels ── */}
      {[
        [1.8, 0.3, 0.85],
        [1.8, 0.3, -0.85],
        [-0.5, 0.3, 0.85],
        [-0.5, 0.3, -0.85],
        [-1.5, 0.3, 0.85],
        [-1.5, 0.3, -0.85],
      ].map(([x, y, z], i) => (
        <group key={`wheel-${i}`} position={[x * scale, y * scale, z * scale]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32 * scale, 0.32 * scale, 0.22 * scale, 12]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
          </mesh>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18 * scale, 0.18 * scale, 0.23 * scale, 12]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* ── Bumper ── */}
      <mesh position={[2.2 * scale, 0.4 * scale, 0]} castShadow>
        <boxGeometry args={[0.08 * scale, 0.2 * scale, 1.4 * scale]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Sprayer — crop protection sprayer with tank, boom arms,
 * nozzles, cab, and wheels
 */
export function Sprayer({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* ── Chassis frame ── */}
      <mesh position={[0, 0.5 * scale, 0]} castShadow>
        <boxGeometry args={[2.2 * scale, 0.3 * scale, 1.2 * scale]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* ── Tank (cylindrical) ── */}
      <mesh position={[0, 1.1 * scale, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5 * scale, 0.5 * scale, 2.0 * scale, 16]} />
        <meshStandardMaterial color="#728b51" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Tank bands */}
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={`band-${i}`} position={[x * scale, 1.1 * scale, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.52 * scale, 0.02 * scale, 4, 16]} />
          <meshStandardMaterial color="#5a6a40" metalness={0.3} />
        </mesh>
      ))}

      {/* ── Cab (small) ── */}
      <mesh position={[1.0 * scale, 1.0 * scale, 0]} castShadow>
        <boxGeometry args={[0.6 * scale, 0.8 * scale, 0.8 * scale]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Cab window */}
      <mesh position={[1.31 * scale, 1.1 * scale, 0]}>
        <boxGeometry args={[0.02, 0.4 * scale, 0.6 * scale]} />
        <meshStandardMaterial color="#8ab4d0" roughness={0.05} metalness={0.5} transparent opacity={0.7} />
      </mesh>

      {/* ── Boom arms (folded) ── */}
      {[2.5, -2.5].map((z, i) => (
        <group key={`boom-${i}`}>
          <mesh position={[0, 1.6 * scale, z * scale]} castShadow>
            <boxGeometry args={[1.5 * scale, 0.08 * scale, 0.08 * scale]} />
            <meshStandardMaterial color="#5a5a5a" metalness={0.5} />
          </mesh>
          {/* Nozzles */}
          {[-0.5, -0.25, 0, 0.25, 0.5].map((x, j) => (
            <mesh key={`nozzle-${j}`} position={[x * scale, 1.55 * scale, z * scale]}>
              <sphereGeometry args={[0.04 * scale, 6, 6]} />
              <meshStandardMaterial color="#4a4a4a" metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Wheels ── */}
      {[
        [0.7, 0.3, 0.7],
        [0.7, 0.3, -0.7],
        [-0.7, 0.3, 0.7],
        [-0.7, 0.3, -0.7],
      ].map(([x, y, z], i) => (
        <group key={`wheel-${i}`} position={[x * scale, y * scale, z * scale]}>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3 * scale, 0.3 * scale, 0.2 * scale, 12]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
          </mesh>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15 * scale, 0.15 * scale, 0.21 * scale, 12]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Seed Drill — planting implement
 */
export function SeedDrill({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[0, 0.5 * scale, 0]} castShadow>
        <boxGeometry args={[1.5 * scale, 0.3 * scale, 3 * scale]} />
        <meshStandardMaterial color="#6a6050" roughness={0.7} />
      </mesh>
      {/* Seed hopper */}
      <mesh position={[0, 1 * scale, 0]} castShadow>
        <boxGeometry args={[1 * scale, 0.8 * scale, 1.5 * scale]} />
        <meshStandardMaterial color="#c48a47" roughness={0.7} />
      </mesh>
      {/* Coulters / discs */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((z, i) => (
        <mesh key={i} position={[0.5 * scale, 0.2 * scale, z * scale]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.15 * scale, 0.15 * scale, 0.05 * scale, 12]} />
          <meshStandardMaterial color="#4a4a4a" metalness={0.5} />
        </mesh>
      ))}
      {/* Wheels */}
      {[0.8, -0.8].map((z, i) => (
        <mesh key={i} position={[0, 0.2 * scale, z * scale]} castShadow>
          <cylinderGeometry args={[0.2 * scale, 0.2 * scale, 0.15 * scale, 8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Irrigation Pump — water pump with pipe
 */
export function IrrigationPump({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position}>
      {/* Pump body */}
      <mesh position={[0, 0.5 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.4 * scale, 0.5 * scale, 1 * scale, 12]} />
        <meshStandardMaterial color="#5a7a8a" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Motor on top */}
      <mesh position={[0, 1.2 * scale, 0]} castShadow>
        <boxGeometry args={[0.6 * scale, 0.5 * scale, 0.5 * scale]} />
        <meshStandardMaterial color="#3a5a6a" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Pipe */}
      <mesh position={[0.8 * scale, 0.8 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.08 * scale, 0.08 * scale, 2 * scale, 8]} />
        <meshStandardMaterial color="#6a8a9a" metalness={0.4} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.05 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.6 * scale, 0.6 * scale, 0.1 * scale, 12]} />
        <meshStandardMaterial color="#8a8070" roughness={0.8} />
      </mesh>
    </group>
  );
}
