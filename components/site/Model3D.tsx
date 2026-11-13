"use client";

import { useEffect, useRef } from "react";
import styles from "./Model3D.module.css";

/**
 * Lightweight, hand-built CSS-3D "working models" — one diorama per step of
 * the farming year. Real perspective + preserve-3d, drag to rotate, gentle
 * idle sway. Deliberately no 3D engine: the scenes are authored primitives
 * in the site palette, so they read as scale models, not stock three.js.
 */

const U = 7; // px per model unit

type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function clamp(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

/** Mix a colour toward white (t > 0) or toward ink (t < 0). */
function shade(hex: string, t: number): string {
  const c = hexToRgb(hex);
  const target = t >= 0 ? 255 : 15;
  const k = Math.abs(t);
  const r = clamp(c.r + (target - c.r) * k);
  const g = clamp(c.g + (target - c.g) * k);
  const b = clamp(c.b + (target - c.b) * k);
  return `rgb(${r}, ${g}, ${b})`;
}

export type BoxProps = {
  x: number; // right
  y: number; // up (0 = ground)
  z: number; // toward viewer
  w: number;
  h: number;
  d: number;
  c: string;
  rx?: number;
  ry?: number;
  rz?: number;
};

function Box({ x, y, z, w, d, h, c, rx = 0, ry = 0, rz = 0 }: BoxProps) {
  const W = w * U;
  const D = d * U;
  const H = h * U;
  const hw = W / 2;
  const hd = D / 2;
  const hh = H / 2;
  const face = (bg: string, width: number, height: number, t: string):
    React.CSSProperties => ({
      width,
      height,
      background: bg,
      transform: `translate(-50%, -50%) ${t}`,
    });
  return (
    <div
      className={styles.box}
      style={{
        transform: `translate3d(${x * U}px, ${-y * U}px, ${z * U}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
      }}
    >
      <div
        className={styles.face}
        style={face(shade(c, 0.16), W, H, `translateZ(${hd}px)`)}
      />
      <div
        className={styles.face}
        style={face(shade(c, -0.2), W, H, `translateZ(-${hd}px) rotateY(180deg)`)}
      />
      <div
        className={styles.face}
        style={face(shade(c, -0.3), D, H, `rotateY(90deg) translateZ(${hw}px)`)}
      />
      <div
        className={styles.face}
        style={face(shade(c, -0.12), D, H, `rotateY(-90deg) translateZ(${hw}px)`)}
      />
      <div
        className={styles.face}
        style={face(shade(c, 0.3), W, D, `rotateX(90deg) translateZ(${hh}px)`)}
      />
      <div
        className={styles.face}
        style={face(shade(c, -0.4), W, D, `rotateX(-90deg) translateZ(${hh}px)`)}
      />
    </div>
  );
}

type PipelineLabelProps = {
  x: number;
  y: number;
  z: number;
  index: string;
  title: string;
  detail: string;
  accent: string;
};

function PipelineLabel({
  x,
  y,
  z,
  index,
  title,
  detail,
  accent,
}: PipelineLabelProps) {
  return (
    <div
      className={styles.pipelineLabel}
      style={{
        transform: `translate3d(${x * U}px, ${-y * U}px, ${z * U}px) translate(-50%, -50%)`,
        borderTopColor: accent,
      }}
      aria-hidden="true"
    >
      <span className={styles.pipelineLabelIndex}>{index}</span>
      <strong className={styles.pipelineLabelTitle}>{title}</strong>
      <span className={styles.pipelineLabelDetail}>{detail}</span>
    </div>
  );
}

export type ModelKind =
  | "plan"
  | "prepare"
  | "grow"
  | "harvest"
  | "sell"
  | "pipeline";

const INK = "#173d32";
const GREEN = "#285c49";
const FIELD = "#b7c9a8";
const FIELD_D = "#8faa7d";
const HARVEST = "#c48a47";
const HARVEST_INK = "#8a5a23";
const CREAM = "#f7f4e8";
const ROAD = "#ded5c0";

function Scene({ kind }: { kind: ModelKind }) {
  const ground = (c: string) => (
    <Box x={0} y={0.5} z={0} w={27} d={21} h={1} c={c} />
  );

  switch (kind) {
    case "plan":
      return (
        <>
          {ground("#f3f2ea")}
          {/* field map on the table */}
          <Box x={0} y={1.3} z={0} w={17} d={11.5} h={0.6} c="#e7ecdf" />
          <Box x={-4} y={1.95} z={-2.4} w={6} d={0.4} h={0.55} c={FIELD} />
          <Box x={4.6} y={1.95} z={1.8} w={4.6} d={0.4} h={0.55} c={HARVEST} />
          {/* pencil */}
          <Box x={-6} y={1.85} z={4.3} w={9} d={0.5} h={0.5} c={HARVEST} ry={14} />
          <Box x={-2.4} y={1.9} z={4.85} w={1.1} d={0.52} h={0.5} c={CREAM} ry={14} />
          {/* two location pins */}
          <Box x={-4.6} y={2.6} z={-3.6} w={0.7} d={0.7} h={1.6} c={HARVEST_INK} />
          <Box x={3.4} y={2.6} z={3} w={0.7} d={0.7} h={1.6} c={HARVEST_INK} />
          {/* compass block */}
          <Box x={6.4} y={2} z={3.9} w={1} d={1} h={1.2} c={GREEN} />
          {/* index flag: post + numbered plate */}
          <Box x={-8.2} y={3.4} z={-5} w={0.3} d={0.3} h={3.8} c={INK} />
          <Box x={-7} y={4.7} z={-5} w={2.4} d={1.4} h={0.35} c={CREAM} />
          <Box x={-7} y={4.55} z={-4.7} w={0.7} d={0.8} h={0.36} c={GREEN} ry={0} />
        </>
      );

    case "prepare":
      return (
        <>
          {ground("#e2e9d6")}
          {/* tilled furrows */}
          {[-8, -4, 0, 4, 8].map((fx, i) => (
            <Box
              key={fx}
              x={fx}
              y={1.15}
              z={-1}
              w={0.8}
              d={13}
              h={0.6}
              c={i % 2 === 0 ? FIELD_D : FIELD}
            />
          ))}
          {/* tractor */}
          <Box x={-1.2} y={2.1} z={2.6} w={4.8} d={3.2} h={2.1} c={GREEN} />
          <Box x={-2} y={3.9} z={2.6} w={2.1} d={2.7} h={2.4} c={INK} />
          <Box x={1.9} y={3.5} z={1.4} w={0.5} d={0.5} h={1.6} c="#20312a" />
          {/* plough behind */}
          <Box x={-5.6} y={1.7} z={2.6} w={3.4} d={0.9} h={0.8} c={HARVEST} rz={16} />
          {/* wheels (near side) */}
          <Box x={1.9} y={1.4} z={4.15} w={2.4} d={1} h={2.2} c="#26362e" />
          <Box x={-3.4} y={1.2} z={4.15} w={2} d={0.9} h={1.9} c="#26362e" />
          {/* wheels (far side) */}
          <Box x={1.9} y={1.4} z={1.05} w={2.4} d={1} h={2.2} c="#1b2a24" />
          <Box x={-3.4} y={1.2} z={1.05} w={2} d={0.9} h={1.9} c="#1b2a24" />
        </>
      );

    case "grow":
      return (
        <>
          {ground("#dfe8d6")}
          {/* crop rows */}
          {[-4.6, -2.3, 0, 2.3, 4.6].map((rz, i) => (
            <Box
              key={rz}
              x={-1}
              y={1.35}
              z={rz}
              w={15}
              d={1.1}
              h={1.4}
              c={i % 2 === 0 ? FIELD_D : "#a8bf8c"}
            />
          ))}
          {/* hedgerow at the back */}
          <Box x={0} y={1.5} z={-6.6} w={19} d={1} h={1.4} c={GREEN} />
          {/* weather station */}
          <Box x={7.4} y={3.4} z={4} w={0.4} d={0.4} h={4.4} c="#20312a" />
          <Box x={7.4} y={5.9} z={4} w={1.5} d={1.5} h={1.3} c={FIELD} />
          <Box x={7.9} y={6.6} z={4} w={1.9} d={0.5} h={0.3} c={HARVEST} />
          {/* a waymark flag */}
          <Box x={-7.6} y={2.9} z={5} w={0.3} d={0.3} h={3.2} c={INK} />
          <Box x={-6.7} y={4} z={5} w={2} d={1.2} h={0.35} c={CREAM} />
        </>
      );

    case "harvest":
      return (
        <>
          {ground("#f2e9d6")}
          {/* stubble rows */}
          {[-4.5, 0, 4.5].map((rz, i) => (
            <Box
              key={i}
              x={0}
              y={1.05}
              z={rz}
              w={19}
              d={0.7}
              h={0.4}
              c="#cdb98d"
            />
          ))}
          {/* combine */}
          <Box x={-0.4} y={2.5} z={0} w={6.8} d={3.2} h={2.6} c={GREEN} />
          <Box x={-1.4} y={4.3} z={0} w={3.2} d={2.6} h={1.9} c={CREAM} />
          <Box x={-3.3} y={4.1} z={0} w={1.7} d={2.4} h={2.2} c={INK} />
          <Box x={3.6} y={1.6} z={0} w={2.6} d={3.6} h={1.1} c={HARVEST} />
          <Box x={3.6} y={2.7} z={0} w={0.5} d={3.8} h={0.4} c={HARVEST_INK} />
          {/* wheels near side */}
          <Box x={2.6} y={1.4} z={1.7} w={2.6} d={1.1} h={2.4} c="#26362e" />
          <Box x={-3.7} y={1.15} z={1.7} w={1.9} d={0.9} h={1.8} c="#26362e" />
          {/* wheels far side */}
          <Box x={2.6} y={1.4} z={-1.7} w={2.6} d={1.1} h={2.4} c="#1b2a24" />
          <Box x={-3.7} y={1.15} z={-1.7} w={1.9} d={0.9} h={1.8} c="#1b2a24" />
          {/* grain trailer */}
          <Box x={-7.4} y={2.3} z={0} w={4.6} d={2.8} h={2.4} c={CREAM} />
          <Box x={-7.4} y={3.8} z={0} w={4} d={2.3} h={0.8} c="#e9c79a" />
          <Box x={-7.4} y={1.1} z={1.5} w={1.5} d={0.8} h={1.4} c="#26362e" />
          <Box x={-7.4} y={1.1} z={-1.5} w={1.5} d={0.8} h={1.4} c="#1b2a24" />
        </>
      );

    case "sell":
      return (
        <>
          {ground("#f2f0e4")}
          {/* grain silo */}
          <Box x={6.6} y={4} z={0.6} w={3} d={3} h={7} c="#f4f0e2" />
          <Box x={6.6} y={6.9} z={0.6} w={3.15} d={3.15} h={0.55} c={GREEN} />
          <Box x={6.6} y={7.55} z={0.6} w={3.15} d={3.15} h={0.4} c={INK} />
          {/* warehouse */}
          <Box x={-5.4} y={2.6} z={0} w={7} d={5} h={4} c="#ece7d8" />
          <Box x={-5.4} y={4.9} z={0} w={7.6} d={5.6} h={0.5} c="#e9c79a" />
          <Box x={-5.4} y={2.1} z={2.6} w={2.6} d={0.2} h={2.6} c={GREEN} />
          {/* collection truck */}
          <Box x={0.9} y={2} z={4.2} w={1.9} d={1.9} h={2} c={GREEN} />
          <Box x={-1.3} y={2.2} z={4.2} w={3} d={2} h={2.3} c={CREAM} />
          <Box x={1.7} y={1} z={4.95} w={1.4} d={0.8} h={1.4} c="#26362e" />
          <Box x={-1.8} y={1} z={4.95} w={1.4} d={0.8} h={1.4} c="#26362e" />
          <Box x={1.7} y={1} z={3.45} w={1.4} d={0.8} h={1.4} c="#1b2a24" />
          <Box x={-1.8} y={1} z={3.45} w={1.4} d={0.8} h={1.4} c="#1b2a24" />
          {/* the record that ties it together */}
          <Box x={4.1} y={2.3} z={5.1} w={2.6} d={0.2} h={3.4} c="#fdfdf8" />
          <Box x={4.1} y={3.4} z={5.1} w={2} d={0.24} h={0.4} c={GREEN} />
        </>
      );

    case "pipeline": {
      /** A numbered zone flag, planted on the farm road, as in the register. */
      const flag = (x: number) => (
        <>
          <Box x={x} y={4.2} z={10.6} w={0.3} d={0.3} h={4} c={INK} />
          <Box x={x} y={6.0} z={10.6} w={2.6} d={1.5} h={0.35} c={CREAM} />
          <Box x={x} y={5.85} z={10.9} w={1.0} d={0.4} h={0.36} c={GREEN} />
        </>
      );
      /** A chevron on the road, pointing the season along. */
      const arrow = (x: number) => (
        <>
          <Box x={x - 0.6} y={2.33} z={8.95} w={1.34} d={0.2} h={0.25} c={HARVEST} ry={27} />
          <Box x={x - 0.6} y={2.33} z={9.55} w={1.34} d={0.2} h={0.25} c={HARVEST} ry={-27} />
        </>
      );
      const labels = [
        { x: -30, index: "01", title: "Plan", detail: "Field record", accent: FIELD },
        { x: -16.5, index: "02", title: "Prepare", detail: "Resources", accent: HARVEST },
        { x: -2.5, index: "03", title: "Grow", detail: "Live signals", accent: GREEN },
        { x: 11.5, index: "04", title: "Harvest", detail: "Move the load", accent: HARVEST },
        { x: 27.5, index: "05", title: "Sell", detail: "Money + market", accent: GREEN },
      ];
      return (
        <>
          {/* plinth */}
          <Box x={0} y={0.5} z={0} w={72} d={32} h={1} c="#e9e4d6" />
          {/* five zone grounds, left to right */}
          <Box x={-30} y={1.35} z={0} w={12} d={30} h={0.7} c="#f4f3ec" />
          <Box x={-16.5} y={1.35} z={0} w={15} d={30} h={0.7} c="#e3e9d7" />
          <Box x={-2.5} y={1.35} z={0} w={13} d={30} h={0.7} c="#dfe8d5" />
          <Box x={11.5} y={1.35} z={0} w={15} d={30} h={0.7} c="#f2e9d6" />
          <Box x={27.5} y={1.35} z={0} w={17} d={30} h={0.7} c="#efeee2" />
          {/* the farm road joining them */}
          <Box x={0} y={1.95} z={9.25} w={62} d={3.5} h={0.5} c={ROAD} />
          {/* numbered flags 01–05 */}
          {flag(-30)}
          {flag(-16.5)}
          {flag(-2.5)}
          {flag(11.5)}
          {flag(27.5)}
          {/* chevrons between the zones */}
          {arrow(-23.5)}
          {arrow(-8.5)}
          {arrow(4.5)}
          {arrow(18.5)}
          {/* back hedgerow */}
          <Box x={0} y={2.3} z={-14} w={70} d={1.2} h={1.4} c={GREEN} />
          {/* 01 plan — map board, marked plots, pencil, compass */}
          <Box x={-30} y={2.0} z={-2} w={8} d={6} h={0.6} c="#e7ecdf" />
          <Box x={-32.2} y={2.45} z={-3.4} w={3.4} d={0.4} h={0.55} c={FIELD} />
          <Box x={-28.4} y={2.45} z={0.4} w={2.4} d={0.4} h={0.55} c={HARVEST} />
          <Box x={-25.2} y={2.3} z={-0.5} w={1} d={1} h={1.2} c={GREEN} />
          <Box x={-27.8} y={1.95} z={3.0} w={5} d={0.4} h={0.4} c={HARVEST} ry={12} />
          <Box x={-25.25} y={1.95} z={3.55} w={0.8} d={0.42} h={0.4} c={CREAM} ry={12} />
          {/* 02 prepare — furrows and the tractor working them */}
          {[-22, -19, -16, -13, -10].map((fx, i) => (
            <Box
              key={fx}
              x={fx}
              y={1.55}
              z={-1}
              w={0.9}
              d={11}
              h={0.6}
              c={i % 2 === 0 ? FIELD_D : FIELD}
            />
          ))}
          <Box x={-17.7} y={2.8} z={2.6} w={4.8} d={3.2} h={2.1} c={GREEN} />
          <Box x={-18.5} y={4.6} z={2.6} w={2.1} d={2.7} h={2.4} c={INK} />
          <Box x={-14.6} y={4.2} z={1.9} w={0.5} d={0.5} h={1.6} c="#20312a" />
          <Box x={-22.1} y={2.4} z={2.6} w={3.4} d={0.9} h={0.8} c={HARVEST} rz={16} />
          <Box x={-14.6} y={2.1} z={4.15} w={2.4} d={1} h={2.2} c="#26362e" />
          <Box x={-19.9} y={1.9} z={4.15} w={2} d={0.9} h={1.9} c="#26362e" />
          <Box x={-14.6} y={2.1} z={1.05} w={2.4} d={1} h={2.2} c="#1b2a24" />
          <Box x={-19.9} y={1.9} z={1.05} w={2} d={0.9} h={1.9} c="#1b2a24" />
          {/* 03 grow — crop rows, hedgerow, weather station, waymark */}
          {[-5.2, -2.6, 0, 2.6, 5.2].map((rz, i) => (
            <Box
              key={rz}
              x={-2.5}
              y={2.05}
              z={rz}
              w={11.5}
              d={1.1}
              h={1.4}
              c={i % 2 === 0 ? FIELD_D : "#a8bf8c"}
            />
          ))}
          <Box x={-2.5} y={2.2} z={-7.5} w={12.5} d={1} h={1.4} c={GREEN} />
          <Box x={2.9} y={4.1} z={4} w={0.4} d={0.4} h={4.4} c="#20312a" />
          <Box x={2.9} y={6.6} z={4} w={1.5} d={1.5} h={1.3} c={FIELD} />
          <Box x={3.4} y={7.3} z={4} w={1.9} d={0.5} h={0.3} c={HARVEST} />
          <Box x={-7.6} y={3.6} z={5} w={0.3} d={0.3} h={3.2} c={INK} />
          <Box x={-6.7} y={4.7} z={5} w={2} d={1.2} h={0.35} c={CREAM} />
          {/* 04 harvest — stubble, combine, grain trailer */}
          {[-4.5, 0, 4.5].map((rz, i) => (
            <Box key={i} x={11.5} y={1.75} z={rz} w={13} d={0.7} h={0.4} c="#cdb98d" />
          ))}
          <Box x={13.1} y={3.2} z={0} w={6.8} d={3.2} h={2.6} c={GREEN} />
          <Box x={12.1} y={5.0} z={0} w={3.2} d={2.6} h={1.9} c={CREAM} />
          <Box x={10.2} y={4.8} z={0} w={1.7} d={2.4} h={2.2} c={INK} />
          <Box x={17.1} y={2.3} z={0} w={2.6} d={3.6} h={1.1} c={HARVEST} />
          <Box x={17.1} y={3.3} z={0} w={0.5} d={3.8} h={0.4} c={HARVEST_INK} />
          <Box x={16.1} y={2.1} z={1.7} w={2.6} d={1.1} h={2.4} c="#26362e" />
          <Box x={9.8} y={1.85} z={1.7} w={1.9} d={0.9} h={1.8} c="#26362e" />
          <Box x={16.1} y={2.1} z={-1.7} w={2.6} d={1.1} h={2.4} c="#1b2a24" />
          <Box x={9.8} y={1.85} z={-1.7} w={1.9} d={0.9} h={1.8} c="#1b2a24" />
          <Box x={6.5} y={3.0} z={0} w={4.6} d={2.8} h={2.4} c={CREAM} />
          <Box x={6.5} y={4.5} z={0} w={4} d={2.3} h={0.8} c="#e9c79a" />
          <Box x={6.5} y={1.8} z={1.5} w={1.5} d={0.8} h={1.4} c="#26362e" />
          <Box x={6.5} y={1.8} z={-1.5} w={1.5} d={0.8} h={1.4} c="#1b2a24" />
          {/* 05 sell — silo, warehouse, collection truck, the record */}
          <Box x={23.6} y={4.7} z={0.6} w={3} d={3} h={7} c="#f4f0e2" />
          <Box x={23.6} y={7.6} z={0.6} w={3.15} d={3.15} h={0.55} c={GREEN} />
          <Box x={23.6} y={8.25} z={0.6} w={3.15} d={3.15} h={0.4} c={INK} />
          <Box x={31.6} y={3.3} z={0} w={7} d={5} h={4} c="#ece7d8" />
          <Box x={31.6} y={5.6} z={0} w={7.6} d={5.6} h={0.5} c="#e9c79a" />
          <Box x={31.6} y={2.8} z={2.61} w={2.6} d={0.2} h={2.6} c={GREEN} />
          <Box x={22.9} y={2.7} z={4.2} w={1.9} d={1.9} h={2} c={GREEN} />
          <Box x={20.7} y={2.9} z={4.2} w={3} d={2} h={2.3} c={CREAM} />
          <Box x={23.7} y={1.7} z={4.95} w={1.4} d={0.8} h={1.4} c="#26362e" />
          <Box x={20.2} y={1.7} z={4.95} w={1.4} d={0.8} h={1.4} c="#26362e" />
          <Box x={23.7} y={1.7} z={3.45} w={1.4} d={0.8} h={1.4} c="#1b2a24" />
          <Box x={20.2} y={1.7} z={3.45} w={1.4} d={0.8} h={1.4} c="#1b2a24" />
          <Box x={33.8} y={3.0} z={5.1} w={2.6} d={0.2} h={3.4} c="#fdfdf8" />
          <Box x={33.8} y={4.1} z={5.1} w={2} d={0.24} h={0.4} c={GREEN} />
          {/* Facing labels make the five connected stages legible at a glance. */}
          {labels.map((label) => (
            <PipelineLabel
              key={label.index}
              x={label.x}
              y={8.9}
              z={11.8}
              index={label.index}
              title={label.title}
              detail={label.detail}
              accent={label.accent}
            />
          ))}
        </>
      );
    }
  }
}

const MODEL_LABEL: Record<ModelKind, string> = {
  plan: "Field plan on a table, with pins, a pencil and a compass",
  prepare: "Tractor ploughing furrows, drawing a plough behind",
  grow: "Crop rows with a weather station and hedgerow",
  harvest: "Combine harvester filling a grain trailer",
  sell: "Silo, warehouse, collection truck and the season record",
  pipeline:
    "Scale model of the complete farm workflow: plan, prepare, grow, harvest and sell, with connected records joining every stage",
};

export default function Model3D({ kind }: { kind: ModelKind }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!stage || !world) return;

    let on = false;
    let lastX = 0;
    let lastY = 0;
    let ry = 0;
    let rx = 0;

    const apply = () => {
      world.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };

    const down = (e: PointerEvent) => {
      on = true;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.classList.add(styles.paused);
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic or invalid pointer ids are fine to ignore */
      }
    };

    const move = (e: PointerEvent) => {
      if (!on) return;
      ry += (e.clientX - lastX) * 0.45;
      rx = Math.max(
        -14,
        Math.min(10, rx + (e.clientY - lastY) * 0.22),
      );
      lastX = e.clientX;
      lastY = e.clientY;
      apply();
    };

    const up = () => {
      on = false;
      stage.classList.remove(styles.paused);
    };

    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("lostpointercapture", up);

    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("lostpointercapture", up);
    };
  }, []);

  const wide = kind === "pipeline";

  return (
    <div
      ref={stageRef}
      className={wide ? `${styles.stage} ${styles.stageWide}` : styles.stage}
      role="img"
      aria-label={MODEL_LABEL[kind]}
      data-kind={kind}
    >
      <div className={wide ? `${styles.orbit} ${styles.orbitWide}` : styles.orbit}>
        <div
          className={wide ? `${styles.origin} ${styles.originWide}` : styles.origin}
          ref={worldRef}
        >
          {wide ? (
            <div className={styles.scalerWide}>
              <Scene kind={kind} />
            </div>
          ) : (
            <Scene kind={kind} />
          )}
        </div>
      </div>
      <span className={styles.hint}>Drag to turn ↻</span>
    </div>
  );
}
