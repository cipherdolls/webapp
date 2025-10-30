import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Root as PopoverRoot, Trigger as PopoverTrigger, Content as PopoverContent } from './popover';
import { cn } from '~/utils/cn';

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

type ResponsiveSide = {
  default: TooltipSide;
  sm?: TooltipSide;
  md?: TooltipSide;
  lg?: TooltipSide;
  xl?: TooltipSide;
  '2xl'?: TooltipSide;
};

export type SideType = TooltipSide | ResponsiveSide;

type TooltipProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  side?: TooltipSide | ResponsiveSide;
  align?: 'start' | 'center' | 'end';
  popoverClassName?: string;
  variant?: 'light' | 'dark' | 'error';
  className?: string;
};

export const Tooltip = ({
  trigger,
  content,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration = 200,
  side = 'top',
  align = 'center',
  popoverClassName,
  variant = 'dark',
  className,
}: TooltipProps) => {
  const isResponsiveSide = typeof side === 'object';
  const defaultSide = isResponsiveSide ? side.default : side;

  const [currentSide, setCurrentSide] = React.useState<TooltipSide>(defaultSide);

  React.useEffect(() => {
    if (!isResponsiveSide) {
      setCurrentSide(side as TooltipSide);
      return;
    }

    const responsiveSide = side as ResponsiveSide;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536 && responsiveSide['2xl']) {
        setCurrentSide(responsiveSide['2xl']);
      } else if (width >= 1280 && responsiveSide.xl) {
        setCurrentSide(responsiveSide.xl);
      } else if (width >= 1024 && responsiveSide.lg) {
        setCurrentSide(responsiveSide.lg);
      } else if (width >= 768 && responsiveSide.md) {
        setCurrentSide(responsiveSide.md);
      } else if (width >= 640 && responsiveSide.sm) {
        setCurrentSide(responsiveSide.sm);
      } else {
        setCurrentSide(responsiveSide.default);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [side, isResponsiveSide]);

  return (
    <>
      <div className='block md:hidden'>
        <MobileView
          trigger={trigger}
          content={content}
          side={currentSide}
          align={align}
          popoverClassName={popoverClassName}
          variant={variant}
        />
      </div>

      <div className='hidden md:inline-block'>
        <DesktopView
          trigger={trigger}
          content={content}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
          delayDuration={delayDuration}
          side={currentSide}
          align={align}
          variant={variant}
          className={className}
        />
      </div>
    </>
  );
};

const MobileView = ({
  trigger,
  content,
  side,
  align,
  popoverClassName,
  variant
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
  side: TooltipSide;
  align: 'start' | 'center' | 'end';
  popoverClassName?: string;
  variant?: 'light' | 'dark' | 'error';
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }

      closeTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 30000);
    }
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <PopoverRoot open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild={true}>
        <span onClick={handleTriggerClick} style={{ cursor: 'pointer' }}>
          {trigger}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={5}
        unstyled
        className={cn(
          'z-50 overflow-hidden rounded-[10px] backdrop-blur-xl bg-neutral-03 p-1.5 sm:px-3 sm:py-2 font-semibold text-label text-base-black animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 focus:outline-none break-words whitespace-normal',
          variant === 'light' && 'bg-white/80 border  border-neutral-04',
          variant === 'error' && 'bg-specials-danger/10 text-specials-danger border border-specials-danger',
          popoverClassName
        )}
      >
        {content}
      </PopoverContent>
    </PopoverRoot>
  );
};

const DesktopView = ({
  trigger,
  content,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  side,
  align,
  variant,
  className,
}: Omit<TooltipProps, 'side'> & { side: TooltipSide }) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delayDuration={delayDuration}>
        <TooltipPrimitive.Trigger asChild>
          <span>{trigger}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={cn(
              'z-50 break-words backdrop-blur-xl shadow rounded-[10px] border-neutral-03 bg-neutral-03 px-3 py-2 font-semibold text-label text-base-black animate-tooltip-toggle fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              variant === 'light' && 'bg-white/80  border-neutral-04',
              variant === 'error' && 'bg-specials-danger/10 text-specials-danger border-specials-danger',
              className
            )}
            sideOffset={5}
          >
            {content}
            {side === 'top' && (
              <div className={cn('-z-10 absolute -bottom-3 left-1/2 transform rotate-180 -translate-x-1/2 w-0 h-0 border-6 border-transparent border-b-neutral-03 pointer-events-none',
                  variant === 'light' && 'border-b-white/80',
                  variant === 'error' && 'border-b-specials-danger'
                )}
              />
            )}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
