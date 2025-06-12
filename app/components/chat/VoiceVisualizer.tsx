import React, { useRef, useEffect } from 'react';
import { mapRange } from '~/utils/audio.utils';


interface VoiceVisualizerProps {
  audioData: Uint8Array | null;
  isActive: boolean;
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
  circleHideOne = false,
  circleHideTwo = false,
  circleHideThree = false,
  circleOneColor = '#000',
  circleTwoColor = '#000',
  circleThreeColor = '#000'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const animationStateRef = useRef({
    circleScales: [1, 1, 1]
  });
  
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
    
    const colors = [circleOneColor, circleTwoColor, circleThreeColor];
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
      circleScale: number
    ) => {
      if (circleScale < 0.01) return;
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = circleScale;
      
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.01) {
        const waveOffset = isActive ? 
          amplitude * Math.sin(frequency * angle + phase) +
          amplitude * 0.5 * Math.sin(frequency * 2 * angle + phase * 1.5) : 0;
        
        const r = (radius + waveOffset) * circleScale;
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
      ctx.globalAlpha = 1;
    };
    
    let phase = 0;
    const animate = () => {
      const { circleScales } = animationStateRef.current;
      
      // Update circle scales with smooth animation
      const targetScales = [
        circleHideOne ? 0 : 1,
        circleHideTwo ? 0 : 1,
        circleHideThree ? 0 : 1
      ];
      
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
        
        // Only calculate amplitude if isActive is true AND we have audioData
        if (isActive && audioData) {
          const segment = audioData.slice(
            Math.floor((i * audioData.length) / 3),
            Math.floor(((i + 1) * audioData.length) / 3)
          );
          const avg = Array.from(segment).reduce((sum, val) => sum + val, 0) / segment.length;
          amplitude = mapRange(avg, 0, 255, 0, radius * 0.2);
        }
        
        drawWaveCircle(
          centerX,
          centerY,
          radius,
          amplitude,
          frequency,
          phase + i * Math.PI / 3,
          colors[i],
          circleScales[i]
        );
      });
      
      // Only update phase if isActive is true
      if (isActive) {
        phase += 0.03;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, isActive, circleHideOne, circleHideTwo, circleHideThree]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out'
      }}
      className="size-full"
    />
  );
};

export default VoiceVisualizer;