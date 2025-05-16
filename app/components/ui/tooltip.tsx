import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

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
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  delayDuration = 200,
  side = 'top',
  align = 'center',
}: TooltipProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen || false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange]
  );

  const handleTouchStart = React.useCallback(() => {
    handleOpenChange(true);
  }, [handleOpenChange]);

  const handleTouchEnd = React.useCallback(() => {
    setTimeout(() => {
      handleOpenChange(false);
    }, 1500);
  }, [handleOpenChange]);

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={open} onOpenChange={handleOpenChange} delayDuration={delayDuration}>
        <TooltipPrimitive.Trigger asChild>
          <span onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {trigger}
          </span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className='z-50 overflow-hidden sm:w-full w-1/2 rounded-[10px] bg-neutral-03 px-3 py-2 font-semibold text-label text-base-black animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
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
