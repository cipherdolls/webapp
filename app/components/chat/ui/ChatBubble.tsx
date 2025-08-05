import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/utils/cn';
import { formatTime } from '~/utils/date.utils';
import { Slot } from '@radix-ui/react-slot';

// ChatBubble
const chatBubbleVariant = cva('flex gap-2 items-end relative w-full px-4.5 mt-4 max-w-[900px] mx-auto pb-4', {
  variants: {
    variant: {
      received: 'justify-start received [&+.received]:mt-0.5 [&+.received_.message-corner]:hidden',
      sent: 'flex-row-reverse sent [&+.sent]:mt-0.5 [&+.sent_.message-corner]:hidden',
      system: 'justify-center my-6',
    },
  },
  defaultVariants: {
    variant: 'received',
  },
});

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatBubbleVariant> {}

const ChatBubbleRoot = React.forwardRef<HTMLDivElement, ChatBubbleProps>(({ className, variant = 'received', children, ...props }, ref) => (
  <div className={cn(chatBubbleVariant({ variant, className }), 'relative group')} ref={ref} {...props}>
    {React.Children.map(children, (child) =>
      React.isValidElement(child) && typeof child.type !== 'string'
        ? React.cloneElement(child, {
            variant,
          } as React.ComponentProps<typeof child.type>)
        : child
    )}
  </div>
));

const chatBubbleMessageVariants = cva('relative px-4 py-3 rounded-xl max-w-[85%] md:max-w-[60%]', {
  variants: {
    variant: {
      received: 'bg-neutral-05 text-base-black [&]:after:message-corner [&]:after:top-[-3px] [&]:after:left-[-7px] [&]:after:text-neutral-05',
      sent: 'bg-pink-02 text-base-black [&]:after:message-corner [&]:after:top-[-3px] [&]:after:right-[-7px] [&]:after:scale-x-[-1] [&]:after:text-pink-02',
      system: 'bg-neutral-03 text-base-black',
    },
  },
  defaultVariants: {
    variant: 'received',
  },
});

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
  asChild?: boolean;
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
  ({ className, variant, isLoading = false, asChild = false, children, ...props }, ref) => {
    const Component = asChild ? Slot : 'div';

    return (
      <Component className={cn(chatBubbleMessageVariants({ variant }), className)} ref={ref} {...props}>
        {isLoading ? (
          <div className='flex justify-center items-center gap-1 *:w-1.5 *:h-1.5 *:shrink-0 pt-2'>
            <div className='bg-base-black rounded-full animate-message-loading [animation-delay:-0.3s]' />
            <div className='bg-neutral-01 rounded-full animate-message-loading [animation-delay:-0.15s]' />
            <div className='bg-neutral-02 rounded-full animate-message-loading' />
          </div>
        ) : (
          children
        )}
      </Component>
    );
  }
);

const ChatMessageText = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('text-body-sm text-base-black break-words', className)}>{children}</div>
);

const ChatMessageTimestamp = ({ time, className }: { time: Date; className?: string }) => (
  <div className={cn('text-xs leading-none font-semibold text-neutral-02 mt-0.5 -mb-1.5 text-right', className)}>{formatTime(time)}</div>
);

export const ChatBubble = {
  Root: ChatBubbleRoot,
  Message: ChatBubbleMessage,
  Text: ChatMessageText,
  Timestamp: ChatMessageTimestamp,
};
