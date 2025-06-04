import React, { useRef, useEffect } from 'react';
import { mapRange } from '~/utils/audio.utils';

interface VoiceVisualizerProps {
  audioData: Uint8Array | null;
  isActive: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ audioData, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const animationStateRef = useRef({
    scale: isActive ? 1 : 0,
    targetScale: isActive ? 1 : 0
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
    
    const colors = ['#ffffff', '#ffffff', '#ffffff'];
    // Reduced gaps between circles
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
      scale: number
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.01) {
        const waveOffset = 
          amplitude * Math.sin(frequency * angle + phase) +
          amplitude * 0.5 * Math.sin(frequency * 2 * angle + phase * 1.5);
        
        // Apply scale to both radius and wave offset
        const r = (radius + waveOffset) * scale;
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
    };
    
    let phase = 0;
    const animate = () => {
      // Update scale with smooth animation
      const { scale, targetScale } = animationStateRef.current;
      const scaleDiff = targetScale - scale;

      const easingFactor = targetScale > scale ? 0.15 : 0.05;

      if (Math.abs(scaleDiff) > 0.001) {
        animationStateRef.current.scale += scaleDiff * easingFactor;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = size / 2;
      const centerY = size / 2;
      
      radiusRatios.forEach((ratio, i) => {
        const radius = baseRadius * ratio;
        let amplitude = 0;
        let frequency = 4 + i * 2;
        
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
          animationStateRef.current.scale
        );
      });
      
      phase += 0.03;
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioData, isActive]);
  
  // Update target scale when isActive changes
  useEffect(() => {
    animationStateRef.current.targetScale = isActive ? 1 : 0;
  }, [isActive]);
  
  return (
    <canvas
      ref={canvasRef}
      className="size-full"
    />
  );
};

export default VoiceVisualizer;