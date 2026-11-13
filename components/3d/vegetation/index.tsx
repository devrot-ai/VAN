"use client";

/**
 * Vegetation — trees, crops, hedgerows, and field workers
 */

/**
 * Simple tree — trunk + canopy
 */
export function Tree({
  position,
  scale = 1,
  canopyColor = "#3a6b35",
}: {
  position: [number, number, number];
  scale?: number;
  canopyColor?: string;
}) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.15 * scale, 0.2 * scale, 2 * scale, 8]} />
        <meshStandardMaterial color="#6b4e2a" roughness={0.9} />
      </mesh>
      {/* Canopy — layered spheres */}
      <mesh position={[0, 2.5 * scale, 0]} castShadow>
        <sphereGeometry args={[1 * scale, 8, 8]} />
        <meshStandardMaterial color={canopyColor} roughness={0.85} />
      </mesh>
      <mesh position={[0.4 * scale, 2.8 * scale, 0.2 * scale]} castShadow>
        <sphereGeometry args={[0.7 * scale, 8, 8]} />
        <meshStandardMaterial color={canopyColor} roughness={0.85} />
      </mesh>
      <mesh position={[-0.3 * scale, 2.6 * scale, -0.3 * scale]} castShadow>
        <sphereGeometry args={[0.6 * scale, 8, 8]} />
        <meshStandardMaterial color={canopyColor} roughness={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Hedgerow — a row of connected bushes
 */
export function Hedgerow({
  position,
  length = 10,
  rotation = 0,
}: {
  position: [number, number, number];
  length?: number;
  rotation?: number;
}) {
  const count = Math.floor(length / 1.5);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[i * 1.5 - length / 2 + 0.75, 0.6, 0]}
          castShadow
        >
          <sphereGeometry args={[0.6, 8, 6]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Crop plants — small instanced plants for a field
 */
export function CropPlants({
  position,
  rows = 6,
  cols = 10,
  height = 0.4,
  color = "#5a9a4a",
}: {
  position: [number, number, number];
  rows?: number;
  cols?: number;
  height?: number;
  color?: string;
}) {
  const rowSpacing = 1.5;
  const colSpacing = 1.2;
  const totalW = (cols - 1) * colSpacing;
  const totalD = (rows - 1) * rowSpacing;

  return (
    <group position={position}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <group
            key={`${r}-${c}`}
            position={[
              c * colSpacing - totalW / 2,
              height / 2,
              r * rowSpacing - totalD / 2,
            ]}
          >
            {/* Stem */}
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.03, height, 4]} />
              <meshStandardMaterial color="#4a7a3a" />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, height * 0.3, 0]} castShadow>
              <sphereGeometry args={[0.12, 6, 4]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            <mesh position={[0, height * 0.6, 0]} castShadow>
              <sphereGeometry args={[0.1, 6, 4]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

/**
 * Mature crop — taller, golden wheat-like plants
 */
export function MatureCrop({
  position,
  rows = 6,
  cols = 10,
}: {
  position: [number, number, number];
  rows?: number;
  cols?: number;
}) {
  const rowSpacing = 1.5;
  const colSpacing = 1.2;
  const totalW = (cols - 1) * colSpacing;
  const totalD = (rows - 1) * rowSpacing;

  return (
    <group position={position}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <group
            key={`${r}-${c}`}
            position={[
              c * colSpacing - totalW / 2,
              0.8,
              r * rowSpacing - totalD / 2,
            ]}
          >
            {/* Stem */}
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.03, 1.6, 4]} />
              <meshStandardMaterial color="#8a7a4a" />
            </mesh>
            {/* Wheat head */}
            <mesh position={[0, 0.9, 0]} castShadow>
              <sphereGeometry args={[0.1, 6, 4]} />
              <meshStandardMaterial color="#c4a84a" roughness={0.7} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

/**
 * Field worker — simple human figure
 */
export function FieldWorker({
  position,
  color = "#c48a47",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.7, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#d4a574" roughness={0.8} />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 8]} />
        <meshStandardMaterial color="#e8d8b8" roughness={0.8} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.08, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 6]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>
      <mesh position={[0.08, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 6]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Water channel / irrigation ditch
 */
export function WaterChannel({
  position,
  length = 15,
  rotation = 0,
}: {
  position: [number, number, number];
  length?: number;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.1, length]} />
        <meshStandardMaterial color="#4a8aaa" roughness={0.3} metalness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Banks */}
      <mesh position={[-0.35, 0.08, 0]}>
        <boxGeometry args={[0.1, 0.15, length]} />
        <meshStandardMaterial color="#7a6a4a" roughness={0.9} />
      </mesh>
      <mesh position={[0.35, 0.08, 0]}>
        <boxGeometry args={[0.1, 0.15, length]} />
        <meshStandardMaterial color="#7a6a4a" roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Weather station — anemometer + sensor mast
 */
export function WeatherStation({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Mast */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 5, 8]} />
        <meshStandardMaterial color="#8a8a8a" metalness={0.5} />
      </mesh>
      {/* Anemometer cups */}
      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.4} />
      </mesh>
      {/* Sensor box */}
      <mesh position={[0.15, 3.5, 0]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.5} />
      </mesh>
      {/* Solar panel */}
      <mesh position={[0.2, 4, 0]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.03, 0.3]} />
        <meshStandardMaterial color="#1a2a4a" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}
