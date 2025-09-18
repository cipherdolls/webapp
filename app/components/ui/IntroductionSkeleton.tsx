interface IntroductionSkeletonProps {
  className?: string;
}

export default function IntroductionSkeleton({ className }: IntroductionSkeletonProps) {
  return (
    <div className={`min-h-[120px] space-y-3 ${className || ''}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-neutral-04 rounded w-3/4"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-neutral-04 rounded w-full"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-neutral-04 rounded w-5/6"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-neutral-04 rounded w-2/3"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-neutral-04 rounded w-4/5"></div>
      </div>
    </div>
  );
}