import { cn } from '~/utils/cn';

const FreeToUseBadge = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 py-1 pl-1 pr-1.5 rounded-full text-label text-white font-semibold shadow-lg',
        className
      )}
    >
      🎁
      <span>Free to use</span>
    </div>
  );
};

export default FreeToUseBadge;
