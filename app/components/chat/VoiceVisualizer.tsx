import React, { useRef, useEffect } from 'react';

/* utility for mapping ranges */
const mapRange = (n: number, a: number, b: number, c: number, d: number) => ((n - a) * (d - c)) / (b - a) + c;

interface VoiceVisualizerProps {
  audioData: Uint8Array | null;
  isActive: boolean;
  isProcessing?: boolean;
  circleHideOne?: boolean;
  circleHideTwo?: boolean;
  circleHideThree?: boolean;
  circleOneColor?: string;
  circleTwoColor?: string;
  circleThreeColor?: string;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  audioData,
  isActive,
  isProcessing = false,
  circleHideOne = false,
  circleHideTwo = false,
  circleHideThree = false,
  circleOneColor = '#000',
  circleTwoColor = '#000',
  circleThreeColor = '#000',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const audioDataRef = useRef<Uint8Array | null>(null);
  const animationStateRef = useRef({
    circleScales: [1, 1, 1],
    smoothedAmplitudes: [0, 0, 0],
    rotation: 0,
    processingPhase: 0,
  });

  useEffect(() => {
    audioDataRef.current = audioData;
  }, [audioData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#F59E0B', '#FBBF24', '#F97316'];
    const processingColors = [circleOneColor, circleTwoColor, circleThreeColor]; // Amber colors for processing
    const radiusRatios = [1, 0.92, 0.84];
    const baseRadius = size * 0.35;

    const drawWaveCircle = (
      centerX: number,
      centerY: number,
      radius: number,
      amplitude: number,
      frequency: number,
      phase: number,
      color: string,
      circleScale: number,
      circleIndex: number
    ) => {
      if (circleScale < 0.01) return;

      ctx.save();

      // Apply rotation for processing state
      if (isProcessing) {
        ctx.translate(centerX, centerY);
        ctx.rotate(animationStateRef.current.rotation + circleIndex * 0.3);
        ctx.translate(-centerX, -centerY);
      }

      ctx.beginPath();
      ctx.strokeStyle = isProcessing ? processingColors[circleIndex] : color;
      ctx.globalAlpha = circleScale;

      for (let angle = 0; angle <= Math.PI * 2; angle += 0.01) {
        let waveOffset = 0;

        // Base movement that's always present - simple and smooth
        const baseMovement = radius * 0.025 * (Math.sin(3 * angle + phase * 0.5) + 0.6 * Math.sin(5 * angle - phase * 0.3));

        if (isProcessing) {
          // Random deformation for processing state - subtle but noticeable
          const processingPhase = animationStateRef.current.processingPhase;
          waveOffset = radius * 0.03 * (
            Math.sin(4 * angle + processingPhase + circleIndex) +
            0.6 * Math.sin(6 * angle - processingPhase * 0.8) +
            0.3 * Math.cos(8 * angle + processingPhase * 1.2)
          );
        } else if (isActive && audioDataRef.current) {
          waveOffset = amplitude * Math.sin(frequency * angle + phase) + amplitude * 0.4 * Math.sin(frequency * 2 * angle + phase * 1.5);
        }

        // Динамічна товщина лінії залежно від waveOffset та позиції
        const totalOffset = Math.abs(waveOffset + baseMovement);
        const normalizedOffset = Math.min(totalOffset / (radius * 0.1), 1); // Нормалізуємо до 0-1
        const dynamicLineWidth = 1.5 + normalizedOffset * 2 + 0.5 * Math.sin(angle * 3 + phase); // Від 1.5 до 4.5
        ctx.lineWidth = Math.max(1, dynamicLineWidth);

        const r = (radius + waveOffset + baseMovement) * circleScale;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    let phase = 0;
    const animate = () => {
      const { circleScales, smoothedAmplitudes } = animationStateRef.current;

      // Update rotation and processing phase for spinning effect
      if (isProcessing) {
        animationStateRef.current.rotation += 0.008; // Spin speed
        animationStateRef.current.processingPhase += 0.003; // Phase for random deformation
      }

      // Update circle scales with smooth animation
      const targetScales = [circleHideOne ? 0 : 1, circleHideTwo ? 0 : 1, circleHideThree ? 0 : 1];

      const circleEasingFactor = 0.04;
      targetScales.forEach((target, i) => {
        const diff = target - circleScales[i];
        if (Math.abs(diff) > 0.001) {
          circleScales[i] += diff * circleEasingFactor;
        }
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = size / 2;
      const centerY = size / 2;

      radiusRatios.forEach((ratio, i) => {
        const radius = baseRadius * ratio;
        let amplitude = 0;
        let frequency = 4 + i * 2;

        if (isProcessing) {
          // Fixed amplitude for processing with slight variation
          amplitude = radius * 0.15 * (1 + 0.2 * Math.sin(animationStateRef.current.processingPhase + (i * Math.PI) / 2));
        } else if (isActive && audioDataRef.current) {
          const segment = audioDataRef.current.slice(
            Math.floor((i * audioDataRef.current.length) / 3),
            Math.floor(((i + 1) * audioDataRef.current.length) / 3)
          );
          const avg = Array.from(segment).reduce((sum, val) => sum + val, 0) / segment.length;
          const targetAmplitude = mapRange(avg, 0, 255, 0, radius * 0.25);
          const smoothingFactor = 0.15;
          smoothedAmplitudes[i] = smoothedAmplitudes[i] * (1 - smoothingFactor) + targetAmplitude * smoothingFactor;
          amplitude = smoothedAmplitudes[i];
        }

        drawWaveCircle(centerX, centerY, radius, amplitude, frequency, phase + (i * Math.PI) / 3, colors[i], circleScales[i], i);
      });

      // Update phase for wave movement
      if (isProcessing) {
        phase += 0.03; // Fastest during processing
      } else if (isActive) {
        phase += 0.015; // Medium speed when active
      } else {
        phase += 0.008; // Slow but steady movement when idle
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isProcessing, circleHideOne, circleHideTwo, circleHideThree, circleOneColor, circleTwoColor, circleThreeColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out',
      }}
      className='size-full'
    />
  );
};

export default VoiceVisualizer;
