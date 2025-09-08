import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '~/utils/cn';

const SWITCH_ROOT_NAME = 'SwitchRoot';
const SWITCH_THUMB_NAME = 'SwitchThumb';

const SwitchRoot = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...rest }, forwardedRef) => (
  <SwitchPrimitive.Root
    ref={forwardedRef}
    className={cn(
      [
        // base
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        // focus
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-black focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        // disabled
        'disabled:cursor-not-allowed disabled:opacity-50',
        // state colors
        'data-[state=checked]:bg-base-black data-[state=unchecked]:bg-neutral-02',
      ],
      className
    )}
    {...rest}
  />
));
SwitchRoot.displayName = SWITCH_ROOT_NAME;

const SwitchThumb = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Thumb>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Thumb>
>(({ className, ...rest }, forwardedRef) => (
  <SwitchPrimitive.Thumb
    ref={forwardedRef}
    className={cn(
      [
        // base
        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
        // state transforms
        'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
      ],
      className
    )}
    {...rest}
  />
));
SwitchThumb.displayName = SWITCH_THUMB_NAME;

export { SwitchRoot as Root, SwitchThumb as Thumb };