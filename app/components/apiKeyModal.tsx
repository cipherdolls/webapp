import * as Dialog from '@radix-ui/react-dialog';
import * as Button from '~/components/ui/button/button';
import { Icons } from './ui/icons';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
const ApiKeyModal = ({ apiKey }: { apiKey: string }) => {
  const { copied, copyToClipboard } = useCopyToClipboard();
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button>
          <Icons.information className='text-pink-01' />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none'>
          <div
            className='absolute left-1/2 -translate-x-1/2
        w-[375px] h-[514px] sm:w-[480px] sm:h-[362px] 
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden'
          />
          <div
            className='absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)] 
        [mask-size:100%_100%,480px_362px] 
        [mask-position:0_0,50%_50%] 
        [mask-repeat:no-repeat] 
        [mask-composite:exclude]'
            style={{
              maskImage:
                "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='362' viewBox='0 0 480 362' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='362' rx='12' fill='black'/%3E%3C/svg%3E\")",
            }}
          />
        </Dialog.Overlay>

        <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-20'>
          <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
          <div className='flex flex-col sm:gap-4.5 gap-3'>
            <div className='sm:text-heading-h1 text-heading-h2 text-center'>🗝️</div>
            <div className='flex flex-col gap-2'>
              <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>API Key</Dialog.Title>
              <Dialog.Description className='text-center sm:text-body-lg text-body-md text-base-black'>
                Use the API Key - <span className='underline font-semibold line-clamp-1'>{apiKey}</span> to connect a doll
              </Dialog.Description>
            </div>
            <div className='sm:mt-[22px] mt-4.5 grid grid-cols-2 gap-2'>
              <Dialog.Close asChild>
                <Button.Root variant='secondary'>Got It</Button.Root>
              </Dialog.Close>
              <Button.Root variant={copied ? 'ghost' : 'primary'} onClick={() => copyToClipboard(apiKey)}>
                {copied ? (
                  <span className='flex items-center gap-1'>
                    <Icons.check />
                    Copied
                  </span>
                ) : (
                  'Copy Address'
                )}
              </Button.Root>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ApiKeyModal;
