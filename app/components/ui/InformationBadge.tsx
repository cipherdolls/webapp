import { Icons } from './icons';
import Tooltip from './tooltip';

type InformationBadgeProps = {
  dontShow?: boolean;
  tooltipText?: string;
  className?: string;
};

export const InformationBadge = ({
  dontShow,
  tooltipText = 'High-speed AI for real-time apps and chatbots.',
  className = 'h-4 w-4 ',
}: InformationBadgeProps) => {
  if (dontShow) return null;

  return <Tooltip side='right' trigger={<Icons.information className={`${className} text-base-black`} />} content={tooltipText} />;
};
