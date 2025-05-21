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
      'p-3 min-h-[104px] max-h-[500px] rounded-xl text-body-md text-base-black',
      'w-full resize-none overflow-y-auto',
      'border-[1.5px] border-transparent',
      'focus:border-[1.5px] focus:border-neutral-05 focus:outline-none',
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
>(({ className, asChild, value, defaultValue, ...rest }, forwardedRef) => {
  const Component = asChild ? Slot : 'textarea';
  const { textarea } = textareaVariants();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isEmpty, setIsEmpty] = React.useState(!value && !defaultValue);

  const combinedRef = React.useMemo(
    () => (node: HTMLTextAreaElement) => {
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
      textareaRef.current = node;
    },
    [forwardedRef]
  );

  const resizeTextarea = React.useCallback(() => {
    const node = textareaRef.current;
    if (!node) return;

    // Reset height to auto to get the correct scrollHeight
    node.style.height = 'auto';

    // Set height to scrollHeight to expand based on content, with min 104px and max 500px
    node.style.height = `${Math.min(Math.max(node.scrollHeight, 104), 500)}px`;
  }, []);

  // Handle changes to update the empty state
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsEmpty(e.target.value === '');
    if (rest.onChange) {
      rest.onChange(e);
    }
  };

  // Determine background class based on empty state
  const bgClass = isEmpty ? 'bg-neutral-05' : 'bg-gradient-1 outline outline-neutral-04';

  React.useEffect(() => {
    resizeTextarea();
  }, [resizeTextarea, value, defaultValue]);

  return (
    <Component
      className={textarea({ class: `${className} ${bgClass}` })}
      ref={combinedRef}
      onInput={resizeTextarea}
      onChange={handleChange}
      value={value}
      defaultValue={defaultValue}
      {...rest}
    />
  );
});
TextareaElement.displayName = TEXTAREA_EL_NAME;

export { TextareaRoot as Root, TextareaLabel as Label, TextareaElement as Textarea, TextareaWrapper as Wrapper };
