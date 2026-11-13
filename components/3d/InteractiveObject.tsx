"use client";

import { useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";

/**
 * InteractiveObject — wraps any 3D object to make it clickable.
 * Uses raycasting to detect clicks and calls onSelect with object data.
 * Shows hover highlight and cursor change.
 */
export function InteractiveObject({
  name,
  type,
  data,
  children,
  onSelect,
}: {
  name: string;
  type: string;
  data?: Record<string, unknown>;
  children: React.ReactNode;
  onSelect: (name: string, type: string, data?: Record<string, unknown>) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const hovered = useRef(false);
  const originalEmissives = useRef<Map<THREE.Mesh, { color: THREE.Color; intensity: number }>>(new Map());

  const setHover = useCallback((isHovered: boolean) => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (isHovered) {
          if (!originalEmissives.current.has(child)) {
            originalEmissives.current.set(child, {
              color: mat.emissive ? mat.emissive.clone() : new THREE.Color(0x000000),
              intensity: mat.emissiveIntensity || 0,
            });
          }
          mat.emissive = new THREE.Color("#c48a47");
          mat.emissiveIntensity = 0.2;
        } else {
          const orig = originalEmissives.current.get(child);
          if (orig) {
            mat.emissive = orig.color;
            mat.emissiveIntensity = orig.intensity;
          } else {
            mat.emissive = new THREE.Color(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      }
    });
  }, []);

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = true;
    setHover(true);
  }, [setHover]);

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = false;
    setHover(false);
  }, [setHover]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(name, type, data);
  }, [name, type, data, onSelect]);

  return (
    <group
      ref={groupRef}
      userData={{ name, type, data }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children}
    </group>
  );
}
