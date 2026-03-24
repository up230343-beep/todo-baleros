/**
 * BearingDisassembly
 *
 * Efecto de des-ensamble tipo Apple:
 * - PNG con fondo transparente → no hay caja blanca
 * - AnimatePresence mode="sync"  → crossfade real, no swap brusco
 * - Escala sutil en cada frame   → da la ilusión de movimiento 3D
 * - Preload de todos los frames al montar
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Package } from "lucide-react";
import framesConfig from "@/data/bearingFramesConfig.json";
import { categories } from "@/data/bearings";

// Reverse map: "DEEP GROOVE BALL BEARING" → "deep-groove"
const DB_TO_SLUG: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.dbCategory, c.id])
);

// Curva de aceleración premium (igual que Apple)
const EASE = [0.22, 1, 0.36, 1] as const;

// ms que cada frame permanece visible antes de avanzar
const FRAME_HOLD = 1400;
// ms que dura el crossfade
const FADE_MS = 700;

interface Props {
  categoryId: string;
  playing?: boolean;
  className?: string;
}

export default function BearingDisassembly({
  categoryId,
  playing = false,
  className = "",
}: Props) {
  const slug   = DB_TO_SLUG[categoryId] ?? categoryId;
  const config = (framesConfig as Record<string, { frameCount: number; frames: string[] }>)[slug];

  const [idx, setIdx]         = useState(0);
  const dirRef                = useRef<1 | -1>(1);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Preload de frames ──────────────────────────────────────────
  useEffect(() => {
    if (!config) return;
    config.frames.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [config]);

  // ── Motor de animación ─────────────────────────────────────────
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!config) return;
    clearTimer();

    if (playing) {
      // Avanza frame a frame (ping-pong)
      const advance = () => {
        setIdx((prev) => {
          const next = prev + dirRef.current;
          if (next >= config.frameCount - 1) dirRef.current = -1;
          if (next <= 0)                     dirRef.current =  1;
          return Math.max(0, Math.min(config.frameCount - 1, next));
        });
        timerRef.current = setTimeout(advance, FRAME_HOLD);
      };
      timerRef.current = setTimeout(advance, FRAME_HOLD);
    } else {
      // Vuelve al frame 0 rápido pero suave
      if (idx !== 0) {
        const rewind = () => {
          setIdx((prev) => {
            if (prev <= 0) return 0;
            timerRef.current = setTimeout(rewind, FRAME_HOLD * 0.35);
            return prev - 1;
          });
        };
        timerRef.current = setTimeout(rewind, FRAME_HOLD * 0.35);
      }
    }

    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, config]);

  // ── Sin datos: placeholder ──────────────────────────────────────
  if (!config || config.frames.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <div className="p-6 rounded-full bg-gray-100">
          <Package className="w-12 h-12 text-gray-300" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
          Vista técnica no disponible
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/*
        mode="sync" hace que el frame entrante y el saliente
        convivan simultáneamente → crossfade real.
      */}
      <AnimatePresence mode="sync">
        <motion.img
          key={idx}
          src={config.frames[idx]}
          alt={`${slug} frame ${idx + 1}`}
          draggable={false}

          // Entra: aparece desde ligeramente más pequeño + opacidad 0
          initial={{ opacity: 0, scale: 0.96 }}
          // En pantalla: tamaño real + completamente opaco
          animate={{ opacity: 1, scale: 1 }}
          // Sale: se desvanece yendo ligeramente hacia afuera
          exit={{ opacity: 0, scale: 1.04 }}

          transition={{ duration: FADE_MS / 1000, ease: EASE }}

          className="absolute inset-0 w-full h-full object-contain"
          style={{ pointerEvents: "none" }}
        />
      </AnimatePresence>
    </div>
  );
}
