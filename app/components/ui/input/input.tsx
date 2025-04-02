import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv } from '~/utils/tv';

const INPUT_ROOT_NAME = 'InputRoot';
const INPUT_LABEL_NAME = 'InputLabel';
const INPUT_EL_NAME = 'InputEl';
const INPUT_ICON_NAME = 'InputIcon';

export const inputVariants = tv({
  slots: {
    // Root - basic container
    root: ['flex flex-col gap-2'],
    // Label - exactly like the original label
    label: ['text-body-sm font-semibold text-neutral-01'],
    // Input - exactly like the original input
    input: [
      'py-3 px-3.5 rounded-xl text-body-md text-neutral-02',
      'bg-gradient-1',
      'w-full',
      'outline-none focus:outline-none',
    ],
    // Icon styles
    icon: ['absolute left-3.5 top-1/2 -translate-y-1/2', 'flex size-5 shrink-0 items-center justify-center', 'text-text-sub-600'],
    // Wrapper for when we need an icon
    wrapper: ['relative'],
  },
});

// Root component - just a simple container
function InputRoot({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const { root } = inputVariants();

  return (
    <div className={root({ class: className })} {...rest}>
      {children}
    </div>
  );
}
InputRoot.displayName = INPUT_ROOT_NAME;

// Label component - exactly like the original label
function InputLabel({ className, children, htmlFor, ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { label } = inputVariants();

  return (
    <label className={label({ class: className })} htmlFor={htmlFor} {...rest}>
      {children}
    </label>
  );
}
InputLabel.displayName = INPUT_LABEL_NAME;

// Simple wrapper for when we need an icon
function InputWrapper({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const { wrapper } = inputVariants();

  return (
    <div className={wrapper({ class: className })} {...rest}>
      {children}
    </div>
  );
}

// Input component - exactly like the original input
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    asChild?: boolean;
  }
>(({ className, type = 'text', asChild, ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : 'input';
  const { input } = inputVariants();

  return <Component type={type} className={input({ class: className })} ref={forwardedRef} {...rest} />;
});
Input.displayName = INPUT_EL_NAME;

// Icon component for when needed
function InputIcon<T extends React.ElementType = 'div'>({
  as,
  className,
  ...rest
}: React.ComponentPropsWithoutRef<T> & {
  as?: T;
}) {
  const Component = as || 'div';
  const { icon } = inputVariants();

  return <Component className={icon({ class: className })} {...rest} />;
}
InputIcon.displayName = INPUT_ICON_NAME;

export { InputRoot as Root, InputLabel as Label, Input, InputWrapper as Wrapper, InputIcon as Icon };
