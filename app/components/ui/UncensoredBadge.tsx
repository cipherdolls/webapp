import { ShieldOff } from 'lucide-react';
import Tooltip from './tooltip';

type UncensoredBadgeProps = {
  censored: boolean;
  tooltipText?: string;
  className?: string;
};

export const UncensoredBadge = ({ censored, tooltipText = 'Uncensored', className = 'size-4' }: UncensoredBadgeProps) => {
  if (censored) return null;

  return (
    <Tooltip
      side='right'
      trigger={
        <span className={`inline-flex ${className}`}>
          <ShieldOff className='h-full w-full text-specials-danger' />
        </span>
      }
      content={tooltipText}
    />
  );
};

export default UncensoredBadge;
