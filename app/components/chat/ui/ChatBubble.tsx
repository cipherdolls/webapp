import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/utils/cn';
import { Icons } from '~/components/ui/icons';
import { formatTime } from '~/utils/date.utils';

// ChatBubble
const chatBubbleVariant = cva('flex gap-2 items-end relative w-full px-4.5 mt-4 max-w-[900px] mx-auto', {
  variants: {
    variant: {
      received: 'justify-start received [&+.received]:mt-1.5 [&+.received_.message-corner]:hidden',
      sent: 'flex-row-reverse sent [&+.sent]:mt-1.5 [&+.sent_.message-corner]:hidden',
      system: 'justify-center my-6 ',
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
      received: 'bg-neutral-05 text-base-black',
      sent: 'bg-pink-02 text-base-black',
      system: 'bg-neutral-03 text-base-black',
    },
  },
  defaultVariants: {
    variant: 'received',
  },
});

interface ChatBubbleMessageProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
  ({ className, variant, isLoading = false, children, ...props }, ref) => (
    <div className={cn(chatBubbleMessageVariants({ variant, className }))} ref={ref} {...props}>
      {(variant === 'sent' || variant === 'received') && (
        <Icons.messageCorner
          className={cn('message-corner absolute ', {
            'right-[-7px] top-[-3px] scale-x-[-1] text-pink-02': variant === 'sent',
            'left-[-7px] top-[-3px] text-neutral-05': variant === 'received',
          })}
        />
      )}
      {isLoading ? (
        <div className='flex justify-center items-center  gap-1 *:w-1.5 *:h-1.5 *:shrink-0 pt-2'>
          <div className='bg-base-black rounded-full animate-message-loading [animation-delay:-0.3s]'></div>
          <div className='bg-neutral-01 rounded-full animate-message-loading [animation-delay:-0.15s]'></div>
          <div className='bg-neutral-02 rounded-full animate-message-loading'></div>
        </div>
      ) : (
        children
      )}
    </div>
  )
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
