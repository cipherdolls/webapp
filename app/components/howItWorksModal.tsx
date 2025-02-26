import * as Dialog from '@radix-ui/react-dialog';
import { Icons } from './ui/icons';
import * as Button from '~/components/ui/button/button';

const HowItWorksModal = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='underline text-body-md'>How It Works</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none'>
          <div
            className='absolute left-1/2 -translate-x-1/2
        w-[375px] h-[514px] sm:w-[480px] sm:h-[538px] 
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden'
          />
          <div
            className='absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)] 
        [mask-size:100%_100%,480px_538px] 
        [mask-position:0_0,50%_50%] 
        [mask-repeat:no-repeat] 
        [mask-composite:exclude]'
            style={{
              maskImage:
                "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='538' viewBox='0 0 480 538' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='538' rx='12' fill='black'/%3E%3C/svg%3E\")",
            }}
          />
        </Dialog.Overlay>

        <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-20'>
          <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
          <div className='flex flex-col sm:gap-4.5 gap-3'>
            <div className='sm:text-heading-h1 text-heading-h2 text-center'>🥷</div>
            <div className='flex flex-col gap-2'>
              <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>How it Works</Dialog.Title>
              <Dialog.Description className='sm:text-center sm:text-body-lg text-body-md text-base-black'>
                At Cipherdolls, we understand the importance of privacy and security. That's why we operate anonymously, without collecting
                any personal data about you. You don't need to provide an email address or credit card information to use our services.{' '}
                <br /> <br />
                This is also why we use Ethereum on Optimism to pay for messages, ensuring that all transactions are secure and private.
                There are no monthly subscriptions or hidden fees. You only pay for the messages you send and receive, so if you don't use
                cipherdolls, you don't need to pay a thing.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild className='sm:hidden block sm:mt-0 mt-4.5'>
              <Button.Root variant='secondary'>Got It</Button.Root>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className='absolute focus:outline-none -right-14 top-0 size-10 bg-white rounded-full sm:flex hidden items-center justify-center'
              aria-label='Close'
            >
              <Icons.close />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default HowItWorksModal;
