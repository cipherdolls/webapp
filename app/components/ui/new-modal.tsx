import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn, cnExt } from '~/utils/cn';

const ModalRoot = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalClose = DialogPrimitive.Close;
const ModalPortal = DialogPrimitive.Portal;

const ModalOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <DialogPrimitive.Overlay
      ref={forwardedRef}
      className={cn(
        // base
        'fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-neutral-02 p-4',
        className
      )}
      {...rest}
    />
  );
});
ModalOverlay.displayName = 'ModalOverlay';

const ModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    overlayClassName?: string;
    showClose?: boolean;
  }
>(({ className, overlayClassName, children, showClose = true, ...rest }, forwardedRef) => {
  return (
    <ModalPortal>
      <ModalOverlay className={overlayClassName}>
        <DialogPrimitive.Content
          ref={forwardedRef}
          className={cn(
            // base
            '@container relative w-full max-w-[480px] max-h-[calc(100vh-2rem)] overflow-y-auto p-8',
            'rounded-xl bg-white shadow-bottom-level-2',
            // focus
            'focus:outline-none',
            // animation
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className
          )}
          {...rest}
        >
          {children}
        </DialogPrimitive.Content>
      </ModalOverlay>
    </ModalPortal>
  );
});
ModalContent.displayName = 'ModalContent';

const ModalTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...rest }, forwardedRef) => {
  return (
    <DialogPrimitive.Title
      ref={forwardedRef}
      className={cn('@min-[350px]:text-heading-h2 text-heading-h3 text-base-black font-semibold', className)}
      {...rest}
    />
  );
});
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...rest }, forwardedRef) => {
  return <DialogPrimitive.Description ref={forwardedRef} className={cn('text-xs text-gray-600', className)} {...rest} />;
});
ModalDescription.displayName = 'ModalDescription';

function ModalBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...rest} />;
}
ModalBody.displayName = 'ModalBody';

function ModalFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cnExt('flex items-center gap-3 pt-10', className)} {...rest} />;
}

ModalFooter.displayName = 'ModalFooter';

export {
  ModalRoot as Root,
  ModalTrigger as Trigger,
  ModalClose as Close,
  ModalPortal as Portal,
  ModalOverlay as Overlay,
  ModalContent as Content,
  ModalTitle as Title,
  ModalDescription as Description,
  ModalBody as Body,
  ModalFooter as Footer,
};
