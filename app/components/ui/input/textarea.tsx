import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv } from '~/utils/tv';

const TEXTAREA_ROOT_NAME = 'TextareaRoot';
const TEXTAREA_LABEL_NAME = 'TextareaLabel';
const TEXTAREA_EL_NAME = 'TextareaElement';
const TEXTAREA_WRAPPER_NAME = 'TextareaWrapper';

export const textareaVariants = tv({
  slots: {
    // Root - basic container
    root: ['flex flex-col gap-2'],
    // Label - same as input label
    label: ['text-body-sm font-semibold text-neutral-01'],
    // Wrapper for when we need additional elements
    wrapper: ['relative'],
    // Textarea element - simplified to match input component
    textarea: [
      'p-3 min-h-[104px] rounded-xl text-body-md text-neutral-02',
      'bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)]',
      'w-full resize-none',
      'outline-none focus:outline-none',
    ],
  },
});

// Root component - simple container
function TextareaRoot({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const { root } = textareaVariants();

  return (
    <div className={root({ class: className })} {...rest}>
      {children}
    </div>
  );
}
TextareaRoot.displayName = TEXTAREA_ROOT_NAME;

// Label component
function TextareaLabel({ className, children, htmlFor, ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { label } = textareaVariants();

  return (
    <label className={label({ class: className })} htmlFor={htmlFor} {...rest}>
      {children}
    </label>
  );
}
TextareaLabel.displayName = TEXTAREA_LABEL_NAME;

// Wrapper component
function TextareaWrapper({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const { wrapper } = textareaVariants();

  return (
    <div className={wrapper({ class: className })} {...rest}>
      {children}
    </div>
  );
}
TextareaWrapper.displayName = TEXTAREA_WRAPPER_NAME;

// Textarea component
const TextareaElement = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    asChild?: boolean;
  }
>(({ className, asChild, ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : 'textarea';
  const { textarea } = textareaVariants();

  return <Component className={textarea({ class: className })} ref={forwardedRef} {...rest} />;
});
TextareaElement.displayName = TEXTAREA_EL_NAME;

export { TextareaRoot as Root, TextareaLabel as Label, TextareaElement as Textarea, TextareaWrapper as Wrapper };
