import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Root as PopoverRoot, Trigger as PopoverTrigger, Content as PopoverContent } from './popover';

type TooltipProps = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
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
}: TooltipProps) => {
  return (
    <>
      <div className='block md:hidden'>
        <MobileView trigger={trigger} content={content} side={side} align={align} />
      </div>

      <div className='hidden md:block'>
        <DesktopView
          trigger={trigger}
          content={content}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
          delayDuration={delayDuration}
          side={side}
          align={align}
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
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
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

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <PopoverRoot open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <span>{trigger}</span>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={5}
        unstyled
        className='z-50 overflow-hidden rounded-[10px] bg-neutral-03 px-3 py-2 font-semibold text-label text-base-black animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 focus:outline-none min-[500px]:w-full w-2/3'
      >
        {content}
      </PopoverContent>
    </PopoverRoot>
  );
};

const DesktopView = ({ trigger, content, open, defaultOpen, onOpenChange, delayDuration, side, align }: TooltipProps) => {
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
            className='z-50 overflow-hidden rounded-[10px] bg-neutral-03 px-3 py-2 font-semibold text-label text-base-black animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
            sideOffset={5}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
