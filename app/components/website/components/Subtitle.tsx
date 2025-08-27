import React from 'react';
import { cn } from '~/utils/cn';

const Subtitle = ({ children, pulseClassName, className }: { children: React.ReactNode; pulseClassName?: string; className?: string }) => {
  return (
    <div className={`inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200/50 mb-4 ${className}`}>
      <div className={cn('w-2 h-2 bg-gradient-to-r  rounded-full animate-pulse', pulseClassName)}></div>
      <span>{children}</span>
    </div>
  );
};

export default Subtitle;
