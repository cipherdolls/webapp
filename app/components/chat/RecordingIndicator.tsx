import React, { useEffect, useRef, memo } from 'react';
import { cn } from '~/utils/cn';

interface RecordingIndicatorProps {
  stream: MediaStream | null;
  className?: string;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = memo(({ stream, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    secondsRef.current = 0;

    const formatTime = (secs: number) => {
      const mins = Math.floor(secs / 60);
      const s = secs % 60;
      return `${mins}:${s.toString().padStart(2, '0')}`;
    };

    if (timerRef.current) {
      timerRef.current.textContent = formatTime(0);
    }

    const interval = setInterval(() => {
      secondsRef.current += 1;
      if (timerRef.current) {
        timerRef.current.textContent = formatTime(secondsRef.current);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      secondsRef.current = 0;
    };
  }, []);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    let animationId: number | null = null;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const barCount = 20;
    const barWidth = 3;
    const barGap = 2;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const binsPerBar = Math.floor(dataArray.length / barCount);

      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < binsPerBar; j++) {
          sum += dataArray[i * binsPerBar + j];
        }
        const avg = sum / binsPerBar / 255;
        const barHeight = Math.max(4, avg * canvas.height);

        const x = i * (barWidth + barGap);
        const y = (canvas.height - barHeight) / 2;

        ctx.fillStyle = '#171717';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1.5);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      source.disconnect();
      audioContext.close();
    };
  }, [stream]);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className='flex items-center gap-2'>
        <span className='relative flex h-2 w-2'>
          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75' />
          <span className='relative inline-flex rounded-full h-2 w-2 bg-red-500' />
        </span>
        <span ref={timerRef} className='text-body-md text-base-black tabular-nums min-w-[36px]'>
          0:00
        </span>
      </div>

      <canvas ref={canvasRef} width={100} height={24} className='h-6' />
    </div>
  );
});

RecordingIndicator.displayName = 'RecordingIndicator';

export default RecordingIndicator;
