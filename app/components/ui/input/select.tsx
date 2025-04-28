import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { tv } from '~/utils/tv';
import { cn } from '~/utils/cn';
import { Icons } from '../icons';

const SELECT_ROOT_NAME = 'SelectRoot';
const SELECT_LABEL_NAME = 'SelectLabel';
const SELECT_TRIGGER_NAME = 'SelectTrigger';
const SELECT_VALUE_NAME = 'SelectValue';
const SELECT_CONTENT_NAME = 'SelectContent';
const SELECT_ITEM_NAME = 'SelectItem';

export const selectVariants = tv({
  slots: {
    // Root - basic container
    root: ['flex flex-col gap-2'],
    // Label - like other form labels
    label: ['text-body-sm font-semibold text-neutral-01'],
    // Trigger - the button that opens the select
    trigger: [
      'flex items-center justify-between',
      'py-3 px-3.5 rounded-xl text-body-md',
      'bg-gradient-1',
      'w-full',
      'outline-none focus:outline-none',
      'border border-transparent',
      'data-[placeholder]:text-neutral-02',
    ],
    // Icon for the trigger
    icon: ['size-4 opacity-50'],
    // Content - the dropdown
    content: [
      'overflow-hidden', 
      'rounded-xl', 
      'border border-neutral-04', 
      'bg-base-white', 
      'shadow-bottom-level-1', 
      'z-50',
      'w-[var(--radix-select-trigger-width)]', // Make content match trigger width
    ],
    // Viewport - container for items
    viewport: ['p-1'],
    // Item - individual option
    item: [
      'relative flex items-center',
      'rounded-lg',
      'py-2 px-3',
      'text-body-md text-base-black',
      'cursor-pointer',
      'select-none',
      'outline-none',
      'hover:bg-neutral-04',
      'data-[highlighted]:bg-neutral-05',
      'data-[highlighted]:outline-none',
    ],
    // Item indicator - checkmark
    itemIndicator: ['absolute right-2 flex items-center justify-center'],
  },
});

// Root component
const SelectRoot = SelectPrimitive.Root;
SelectRoot.displayName = SELECT_ROOT_NAME;

// Label component
function SelectLabel({ className, children, htmlFor, ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { label } = selectVariants();

  return (
    <label className={label({ class: className })} htmlFor={htmlFor} {...rest}>
      {children}
    </label>
  );
}
SelectLabel.displayName = SELECT_LABEL_NAME;

// Trigger component
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const { trigger } = selectVariants();

  return (
    <SelectPrimitive.Trigger ref={ref} className={trigger({ class: className })} {...props}>
      {children}
      <SelectPrimitive.Icon>
        <Icons.chevronDown />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SELECT_TRIGGER_NAME;

// Value component
const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className, ...props }, ref) => <SelectPrimitive.Value ref={ref} className={cn(className)} {...props} />);
SelectValue.displayName = SELECT_VALUE_NAME;

// Content component
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', sideOffset = 4, ...props }, ref) => {
  const { content, viewport } = selectVariants();

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={content({ class: className })}
        position={position}
        sideOffset={sideOffset}
        align="center"
        avoidCollisions={false}
        {...props}
      >
        <SelectPrimitive.Viewport className={viewport()}>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SELECT_CONTENT_NAME;

// Item component
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const { item, itemIndicator } = selectVariants();

  return (
    <SelectPrimitive.Item ref={ref} className={item({ class: className })} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className={itemIndicator()}>
        <Icons.check />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SELECT_ITEM_NAME;

export {
  SelectRoot as Root,
  SelectLabel as Label,
  SelectTrigger as Trigger,
  SelectValue as Value,
  SelectContent as Content,
  SelectItem as Item,
  SelectPrimitive as Primitive,
};

export const Select = {
  Root: SelectRoot,
  Label: SelectLabel,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
};

export default Select;
