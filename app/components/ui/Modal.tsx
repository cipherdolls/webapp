import * as Dialog from '@radix-ui/react-dialog';
import { Icons } from '../ui/icons';
import * as Button from '../ui/button/button';
import { cn } from '~/utils/cn';

const ModalRoot = ({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
};

const ModalContent = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className='animate-overlay-show bg-neutral-02 fixed inset-0 pointer-events-none z-40' />
      <Dialog.Content
        aria-describedby={undefined}
        className='max-h-[80%] sm:max-h-full fixed bottom-0 inset-x-0 sm:top-2 sm:right-2 sm:bottom-2 sm:left-auto sm:max-w-[408px] w-full h-auto z-50'
      >
        <Dialog.Close asChild>
          <Button.Root
            className='hidden group md:flex absolute right-full top-4.5 mr-4.5 shadow-bottom'
            size='icon'
            variant='white'
            aria-label='Close'
          >
            <Button.Icon className='transition-transform duration-250 group-hover:scale-125' as={Icons.close} />
          </Button.Root>
        </Dialog.Close>

        <div
          className={cn(
            'flex flex-col h-full bg-gradient-modal sm:bg-white backdrop-blur-48 sm:backdrop-blur-none rounded-t-xl sm:rounded-xl overflow-y-auto scrollbar-medium px-5 pb-2 shadow-bottom-level-2',
            className
          )}
        >
          {/* mobile top element */}
          <div className='shrink-0 w-[64px] h-[6px] rounded-full bg-neutral-03 mx-auto mt-3 mb-1 sm:hidden' />
          <Dialog.Title className='hidden sm:flex text-heading-h3 text-base-black py-4 sm:py-[26px] items-center'>{title}</Dialog.Title>
          {children}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export const Modal = {
  Root: ModalRoot,
  Content: ModalContent,
  Trigger: Dialog.Trigger,
  Close: Dialog.Close,
};
