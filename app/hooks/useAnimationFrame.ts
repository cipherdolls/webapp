// hooks/useAnimationFrame.ts
import { useCallback, useEffect, useRef } from 'react';

const useAnimationFrame = (callback: () => void, isActive = true) => {
  const callbackRef = useRef(callback);
  const frameRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) return;

    const loop = () => {
      callbackRef.current();
      frameRef.current = requestAnimationFrame(loop);
    };
    
    frameRef.current = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(frameRef.current);
  }, [isActive]);
};

export default useAnimationFrame;