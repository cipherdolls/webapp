import { Icons } from './icons';
import Tooltip from './tooltip';

type RecommendedBadgeProps = {
  recommended: boolean;
  tooltipText?: string;
  className?: string;
};

export const RecommendedBadge = ({ recommended, tooltipText = 'Recommended', className = 'h-4 w-4' }: RecommendedBadgeProps) => {
  if (!recommended) return null;

  return <Tooltip side='right' trigger={<Icons.thumb className={className} />} content={tooltipText} />;
};

export default RecommendedBadge;
