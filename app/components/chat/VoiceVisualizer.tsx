import React, { useRef, useEffect } from 'react';

/* utility for mapping ranges */
const mapRange = (n: number, a: number, b: number, c: number, d: number) =>
  ((n - a) * (d - c)) / (b - a) + c;

/* ────────────────────────────────────────────────────────── */
interface Props {
  audioData: Uint8Array | null;
  isActive:  boolean;
  circleHideOne?:   boolean;
  circleHideTwo?:   boolean;
  circleHideThree?: boolean;
  circleOneColor?:   string;
  circleTwoColor?:   string;
  circleThreeColor?: string;
}

const VoiceVisualizer: React.FC<Props> = ({
  audioData,
  isActive,
  circleHideOne = false,
  circleHideTwo = false,
  circleHideThree = false,
  circleOneColor   = '#000',
  circleTwoColor   = '#000',
  circleThreeColor = '#000',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | undefined>(undefined);
  const smoothed = useRef<number[]>([0, 0, 0]);      // smoothed amplitudes
  const scales   = useRef<number[]>([1, 1, 1]);      // circle scale

  /* ------------- set up canvas once ----------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = 320;
    const DPR  = window.devicePixelRatio || 1;
    canvas.width  = SIZE * DPR;
    canvas.height = SIZE * DPR;
    ctx.scale(DPR, DPR);

    const colors = [circleOneColor, circleTwoColor, circleThreeColor];
    const radiusRatios = [1, 0.92, 0.84];
    const baseRadius   = SIZE * 0.35;
    let phase = 0;

    /* ---- draw one "wavy" circle ------------------- */
    const drawCircle = (
      cx: number, cy: number, radius: number,
      amp: number, freq: number, ph: number,
      color: string, scale: number
    ) => {
      if (scale < 0.01) return;                      // hidden
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2;
      ctx.globalAlpha = 1;                           // constant opacity
      for (let a = 0; a <= Math.PI * 2; a += 0.01) {
        const offset = isActive
          ? amp * Math.sin(freq * a + ph) +
            amp * 0.5 * Math.sin(freq * 2 * a + ph * 1.5)
          : 0;
        const r = (radius + offset) * scale;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (a === 0) ctx.moveTo(x, y);
        else         ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    };

    /* ---------------- main animation ------------------- */
    const animate = () => {
      /* 1. smooth amplitudes -------------------------------- */
      const RAW = [
        audioData?.[0] ?? 0,
        audioData?.[2] ?? audioData?.[1] ?? 0,
        audioData?.[4] ?? audioData?.[3] ?? 0,
      ];
      RAW.forEach((val, i) => {
        smoothed.current[i] =
          smoothed.current[i] * 0.85 + val * 0.15;   // IIR filter
      });

      /* 2. scale animation (appear/disappear) -------------------- */
      const targets = [
        circleHideOne   ? 0 : 1,
        circleHideTwo   ? 0 : 1,
        circleHideThree ? 0 : 1,
      ];
      targets.forEach((t, i) => {
        const diff = t - scales.current[i];
        if (Math.abs(diff) > 0.001) {
          scales.current[i] += diff * 0.04;          // easing
        }
      });

      /* 3. draw -------------------------------------------- */
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = SIZE / 2, cy = SIZE / 2;

      radiusRatios.forEach((ratio, i) => {
        const radius = baseRadius * ratio;
        const amp = mapRange(
          smoothed.current[i], 0, 255, 0, radius * 0.2
        );
        const freq = 4 + i * 2;
        drawCircle(
          cx, cy, radius,
          amp, freq, phase + i * Math.PI / 3,
          colors[i],
          scales.current[i]
        );
      });

      /* 4. phase shift to make the wave move ---------------------- */
      phase += isActive ? 0.03 : 0.015;

      raf.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [
    audioData, isActive,
    circleHideOne, circleHideTwo, circleHideThree,
    circleOneColor, circleTwoColor, circleThreeColor,
  ]);

  /* ------------- render canvas ----------------------------- */
  return (
    <canvas
      ref={canvasRef}
      className="size-full"
      style={{ transition: 'opacity .3s' }}
    />
  );
};

export default VoiceVisualizer;