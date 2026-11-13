"use client";

import { Suspense, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { World } from "./world";
import { useJourneyState } from "@/lib/simulation/JourneyState";
import styles from "./JourneyCanvas.module.css";

// ─── Camera Controller ───────────────────────────────────────────

function CameraController({
  targetPosition,
  targetLookAt,
  animating,
}: {
  targetPosition: THREE.Vector3;
  targetLookAt: THREE.Vector3;
  animating: boolean;
}) {
  const { camera, controls } = useThree();
  const startPos = useRef(new THREE.Vector3());
  const startLook = useRef(new THREE.Vector3());
  const progress = useRef(0);
  const active = useRef(false);

  useFrame(() => {
    if (!animating || !active.current) return;

    progress.current += 0.012;
    if (progress.current >= 1) {
      progress.current = 1;
      active.current = false;
    }

    const t = 1 - Math.pow(1 - progress.current, 3); // ease out cubic

    camera.position.lerpVectors(startPos.current, targetPosition, t);
    const currentLook = new THREE.Vector3();
    currentLook.lerpVectors(startLook.current, targetLookAt, t);

    if (controls) {
      const orbitControls = controls as THREE.EventDispatcher & {
        target: THREE.Vector3;
        update: () => void;
      };
      orbitControls.target.copy(currentLook);
      orbitControls.update();
    }
  });

  // Start animation when target changes
  const prevTarget = useRef(targetPosition);
  if (
    animating &&
    prevTarget.current.distanceTo(targetPosition) > 0.1
  ) {
    startPos.current.copy(camera.position);
    if (controls) {
      const orbitControls = controls as THREE.EventDispatcher & {
        target: THREE.Vector3;
      };
      startLook.current.copy(orbitControls.target);
    } else {
      startLook.current.set(0, 0, 0);
    }
    progress.current = 0;
    active.current = true;
    prevTarget.current.copy(targetPosition);
  }

  return null;
}

// ─── Loading HUD inside canvas ───────────────────────────────────

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className={styles.loader}>
        <div className={styles.loaderRing} />
        <span>Loading 3D world...</span>
        <span className={styles.loaderPct}>{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

// ─── Main Canvas ─────────────────────────────────────────────────

export default function JourneyCanvas() {
  const {
    mode,
    activeStage,
    selectObject,
    visibleCategories,
    cameraTarget,
    cameraLookAt,
    animating,
  } = useJourneyState();

  return (
    <div className={styles.canvasContainer}>
      <Canvas
        camera={{ position: [30, 25, 30], fov: 45, near: 0.1, far: 500 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        onCreated={() => {
          const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          if (prefersReduced) {
            // Disable auto-rotation
          }
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} color="#e8e4d8" />
        <directionalLight
          position={[30, 40, 20]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={120}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          color="#fff8e8"
        />
        <hemisphereLight
          args={["#87ceeb", "#8faa7d", 0.4]}
        />

        {/* Fog for depth */}
        <fog attach="fog" args={["#d8d4c8", 60, 150]} />

        {/* Sky background */}
        <color attach="background" args={["#d8d4c8"]} />

        {/* World */}
        <Suspense fallback={<Loader />}>
          <World
            onSelectObject={selectObject}
            visibleCategories={visibleCategories}
          />
        </Suspense>

        {/* Camera animation */}
        <CameraController
          targetPosition={cameraTarget}
          targetLookAt={cameraLookAt}
          animating={animating}
        />

        {/* Controls */}
        <OrbitControls
          makeDefault
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={10}
          maxDistance={80}
          enableDamping
          dampingFactor={0.08}
          zoomSpeed={0.8}
          rotateSpeed={0.6}
        />
      </Canvas>

      {/* Demo badge */}
      <div className={styles.demoBadge}>
        Illustrative 3D demonstration — not a live operation
      </div>
    </div>
  );
}
