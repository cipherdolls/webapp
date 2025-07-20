type ChatModelSkeletonProps = {
  count?: number;
};

export function ChatModelSkeleton({ count = 3 }: ChatModelSkeletonProps) {
  return (
    <div className='flex flex-col gap-10 pb-5'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex flex-col gap-4'>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full max-w-[200px] animate-pulse'></div>
          <div className='flex flex-col gap-3'>
            <div className='rounded-[10px] h-[110px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[110px] bg-gradient-1 w-full animate-pulse'></div>
          </div>
        </div>
      ))}
    </div>
  );
}