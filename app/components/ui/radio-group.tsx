import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '~/utils/cn';

const RADIO_GROUP_ROOT_NAME = 'RadioGroupRoot';
const RADIO_GROUP_ITEM_NAME = 'RadioGroupItem';
const RADIO_GROUP_INDICATOR_NAME = 'RadioGroupIndicator';

const RadioGroupRoot = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...rest }, forwardedRef) => (
  <RadioGroupPrimitive.Root
    ref={forwardedRef}
    className={cn('grid gap-2', className)}
    {...rest}
  />
));
RadioGroupRoot.displayName = RADIO_GROUP_ROOT_NAME;

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...rest }, forwardedRef) => (
  <RadioGroupPrimitive.Item
    ref={forwardedRef}
    className={cn(
      [
        // base
        'aspect-square h-4 w-4 rounded-full border border-neutral-02 text-base-black ring-offset-base-white',
        // focus
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-base-black focus-visible:ring-offset-2',
        // disabled
        'disabled:cursor-not-allowed disabled:opacity-50',
      ],
      className
    )}
    {...rest}
  />
));
RadioGroupItem.displayName = RADIO_GROUP_ITEM_NAME;

const RadioGroupIndicator = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Indicator>
>(({ className, ...rest }, forwardedRef) => (
  <RadioGroupPrimitive.Indicator
    ref={forwardedRef}
    className={cn('flex items-center justify-center', className)}
    {...rest}
  >
    <div className='h-2.5 w-2.5 rounded-full bg-current' />
  </RadioGroupPrimitive.Indicator>
));
RadioGroupIndicator.displayName = RADIO_GROUP_INDICATOR_NAME;

export { RadioGroupRoot as Root, RadioGroupItem as Item, RadioGroupIndicator as Indicator };