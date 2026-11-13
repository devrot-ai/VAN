"use client";

/**
 * Buildings — warehouse, silo, processing facility, cold storage, workshop, market
 * Each building has architectural detail: windows, vents, structural elements, proper roofs
 */

export function Warehouse({
  position,
  scale = 1,
  color = "#d4cbb8",
  roofColor = "#8a7e6a",
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  roofColor?: string;
}) {
  const w = 6 * scale;
  const h = 3 * scale;
  const d = 4 * scale;

  return (
    <group position={position}>
      {/* ── Foundation ── */}
      <mesh position={[0, 0.1 * scale, 0]} receiveShadow>
        <boxGeometry args={[w + 0.2 * scale, 0.2 * scale, d + 0.2 * scale]} />
        <meshStandardMaterial color="#8a8070" roughness={0.9} />
      </mesh>

      {/* ── Main body ── */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* ── Gable roof ── */}
      <mesh position={[0, h + 0.8 * scale, 0]} castShadow>
        <cylinderGeometry args={[0, w / 2 + 0.3 * scale, d + 0.4 * scale, 4, 1, false, Math.PI * 0.5]} />
        <meshStandardMaterial color={roofColor} roughness={0.7} />
      </mesh>
      {/* Roof ridge */}
      <mesh position={[0, h + 1.2 * scale, 0]} castShadow>
        <boxGeometry args={[0.2 * scale, 0.1 * scale, d + 0.4 * scale]} />
        <meshStandardMaterial color="#6a6050" roughness={0.7} />
      </mesh>

      {/* ── Loading bay door (front) ── */}
      <mesh position={[0, 1.5 * scale, d / 2 + 0.01]}>
        <boxGeometry args={[2 * scale, 3 * scale, 0.05]} />
        <meshStandardMaterial color="#4a4030" roughness={0.9} />
      </mesh>
      {/* Door frame */}
      <mesh position={[0, 1.5 * scale, d / 2 + 0.03]}>
        <boxGeometry args={[2.2 * scale, 0.1 * scale, 0.05]} />
        <meshStandardMaterial color="#6a6050" metalness={0.3} />
      </mesh>
      <mesh position={[-1 * scale, 1.5 * scale, d / 2 + 0.03]}>
        <boxGeometry args={[0.1 * scale, 3 * scale, 0.05]} />
        <meshStandardMaterial color="#6a6050" metalness={0.3} />
      </mesh>
      <mesh position={[1 * scale, 1.5 * scale, d / 2 + 0.03]}>
        <boxGeometry args={[0.1 * scale, 3 * scale, 0.05]} />
        <meshStandardMaterial color="#6a6050" metalness={0.3} />
      </mesh>

      {/* ── Windows (side) ── */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={`window-${i}`} position={[x * scale, 2 * scale, d / 2 + 0.02]}>
          <boxGeometry args={[0.6 * scale, 0.8 * scale, 0.03]} />
          <meshStandardMaterial color="#8ab4d0" roughness={0.1} metalness={0.4} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* ── VAN label stripe ── */}
      <mesh position={[0, h - 0.4 * scale, d / 2 + 0.02]}>
        <boxGeometry args={[w * 0.5, 0.25 * scale, 0.04]} />
        <meshStandardMaterial color="#173d32" roughness={0.6} />
      </mesh>

      {/* ── Vent (roof) ── */}
      <mesh position={[0, h + 0.3 * scale, 0]} castShadow>
        <boxGeometry args={[0.8 * scale, 0.6 * scale, 0.8 * scale]} />
        <meshStandardMaterial color="#6a6050" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function Silo({
  position,
  scale = 1,
  color = "#e0d8c8",
  topColor = "#173d32",
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  topColor?: string;
}) {
  const r = 1.2 * scale;
  const h = 6 * scale;

  return (
    <group position={position}>
      {/* ── Foundation ── */}
      <mesh position={[0, 0.1 * scale, 0]} receiveShadow>
        <cylinderGeometry args={[r + 0.3 * scale, r + 0.3 * scale, 0.2 * scale, 16]} />
        <meshStandardMaterial color="#8a8070" roughness={0.9} />
      </mesh>

      {/* ── Cylinder body ── */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, h, 20]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>

      {/* ── Horizontal bands ── */}
      {[1, 2.5, 4, 5.5].map((y, i) => (
        <mesh key={`band-${i}`} position={[0, y * scale, 0]}>
          <torusGeometry args={[r + 0.01 * scale, 0.03 * scale, 4, 20]} />
          <meshStandardMaterial color="#c0b8a8" roughness={0.7} />
        </mesh>
      ))}

      {/* ── Dome top ── */}
      <mesh position={[0, h, 0]} castShadow>
        <sphereGeometry args={[r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={topColor} roughness={0.6} />
      </mesh>

      {/* ── Vent on top ── */}
      <mesh position={[0, h + 0.5 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.15 * scale, 0.2 * scale, 0.5 * scale, 8]} />
        <meshStandardMaterial color="#6a6050" metalness={0.4} />
      </mesh>

      {/* ── Ladder ── */}
      <mesh position={[r + 0.05, h / 2, 0]}>
        <boxGeometry args={[0.05, h, 0.3 * scale]} />
        <meshStandardMaterial color="#6a6050" metalness={0.3} />
      </mesh>
      {/* Ladder rungs */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`rung-${i}`} position={[r + 0.08, (0.5 + i * 0.5) * scale, 0]}>
          <boxGeometry args={[0.06, 0.03, 0.35 * scale]} />
          <meshStandardMaterial color="#5a5040" />
        </mesh>
      ))}

      {/* ── Access door (base) ── */}
      <mesh position={[0, 0.8 * scale, r + 0.01]}>
        <boxGeometry args={[0.6 * scale, 1.6 * scale, 0.03]} />
        <meshStandardMaterial color="#5a5040" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function ProcessingFacility({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const w = 8 * scale;
  const h = 3.5 * scale;
  const d = 5 * scale;

  return (
    <group position={position}>
      {/* Main building */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#c8c0b0" roughness={0.8} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, h + 0.2 * scale, 0]} castShadow>
        <boxGeometry args={[w + 0.3 * scale, 0.2 * scale, d + 0.3 * scale]} />
        <meshStandardMaterial color="#7a7060" roughness={0.7} />
      </mesh>
      {/* Conveyor / chute on side */}
      <mesh position={[w / 2 + 1.5 * scale, 2 * scale, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[3 * scale, 0.3 * scale, 1 * scale]} />
        <meshStandardMaterial color="#6a6050" roughness={0.7} />
      </mesh>
      {/* Loading bay doors */}
      <mesh position={[-w / 2 - 0.01, 1.5 * scale, 0]}>
        <boxGeometry args={[0.05, 2.5 * scale, 2 * scale]} />
        <meshStandardMaterial color="#4a4030" roughness={0.9} />
      </mesh>
      {/* Chimney / vent */}
      <mesh position={[2 * scale, h + 1.5 * scale, -d / 3]} castShadow>
        <cylinderGeometry args={[0.3 * scale, 0.3 * scale, 3 * scale, 8]} />
        <meshStandardMaterial color="#8a8070" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function ColdStorage({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const w = 5 * scale;
  const h = 3 * scale;
  const d = 4 * scale;

  return (
    <group position={position}>
      {/* Insulated body — white panels */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, h + 0.15 * scale, 0]} castShadow>
        <boxGeometry args={[w + 0.2 * scale, 0.15 * scale, d + 0.2 * scale]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.5} />
      </mesh>
      {/* Refrigeration unit on top */}
      <mesh position={[1.5 * scale, h + 0.8 * scale, 0]} castShadow>
        <boxGeometry args={[1.2 * scale, 1.2 * scale, 1 * scale]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 1.3 * scale, d / 2 + 0.01]}>
        <boxGeometry args={[1.2 * scale, 2.6 * scale, 0.05]} />
        <meshStandardMaterial color="#707070" roughness={0.6} />
      </mesh>
      {/* "COLD STORAGE" stripe */}
      <mesh position={[0, h - 0.4 * scale, d / 2 + 0.02]}>
        <boxGeometry args={[w * 0.7, 0.25 * scale, 0.04]} />
        <meshStandardMaterial color="#285c49" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function Workshop({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const w = 5 * scale;
  const h = 3 * scale;
  const d = 4 * scale;

  return (
    <group position={position}>
      {/* Building */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#b0a898" roughness={0.8} />
      </mesh>
      {/* Gable roof */}
      <mesh position={[0, h + 0.8 * scale, 0]} castShadow>
        <cylinderGeometry args={[0, 3 * scale, d + 0.3 * scale, 4, 1, false, Math.PI]} />
        <meshStandardMaterial color="#7a6e5e" roughness={0.7} />
      </mesh>
      {/* Large bay door */}
      <mesh position={[0, 1.5 * scale, d / 2 + 0.01]}>
        <boxGeometry args={[2.5 * scale, 3 * scale, 0.05]} />
        <meshStandardMaterial color="#4a4030" roughness={0.9} />
      </mesh>
      {/* Tool rack outside */}
      <mesh position={[w / 2 + 0.5 * scale, 1 * scale, 0]}>
        <boxGeometry args={[0.1 * scale, 2 * scale, 1.5 * scale]} />
        <meshStandardMaterial color="#6a5e4e" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function MarketBuilding({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const w = 7 * scale;
  const h = 3.5 * scale;
  const d = 5 * scale;

  return (
    <group position={position}>
      {/* Main building */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#d8d0c0" roughness={0.75} />
      </mesh>
      {/* Flat roof with overhang */}
      <mesh position={[0, h + 0.1 * scale, 0]} castShadow>
        <boxGeometry args={[w + 1 * scale, 0.2 * scale, d + 1 * scale]} />
        <meshStandardMaterial color="#6a6050" roughness={0.7} />
      </mesh>
      {/* Large windows */}
      {[-1.5, 0, 1.5].map((xOff, i) => (
        <mesh key={i} position={[xOff * scale, 2 * scale, d / 2 + 0.01]}>
          <boxGeometry args={[1 * scale, 1.5 * scale, 0.05]} />
          <meshStandardMaterial color="#8ab4d0" roughness={0.2} metalness={0.3} />
        </mesh>
      ))}
      {/* VAN sign */}
      <mesh position={[0, h + 0.5 * scale, d / 2 + 0.05]}>
        <boxGeometry args={[2 * scale, 0.5 * scale, 0.05]} />
        <meshStandardMaterial color="#173d32" roughness={0.5} />
      </mesh>
      {/* Loading dock */}
      <mesh position={[-w / 2 - 0.5 * scale, 1 * scale, 0]}>
        <boxGeometry args={[1 * scale, 0.2 * scale, 3 * scale]} />
        <meshStandardMaterial color="#8a8070" roughness={0.8} />
      </mesh>
    </group>
  );
}
