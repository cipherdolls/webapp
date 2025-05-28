import type { ReactNode } from 'react';
import { Icons } from './icons';
import Tooltip, { type SideType } from './tooltip';

type InformationBadgeProps = {
  dontShow?: boolean;
  tooltipText?: ReactNode;
  className?: string;
  side?: SideType;
  popoverClassName?: string;
};

export const InformationBadge = ({
  dontShow,
  tooltipText = 'High-speed AI for real-time apps and chatbots.',
  className = 'h-4 w-4 ',
  side = 'right',
  popoverClassName,
}: InformationBadgeProps) => {
  if (dontShow) return null;

  return (
    <Tooltip
      side={side}
      trigger={<Icons.information className={`${className} text-base-black`} />}
      content={tooltipText}
      popoverClassName={popoverClassName}
    />
  );
};
