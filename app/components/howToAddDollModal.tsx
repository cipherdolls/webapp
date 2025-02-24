import * as Dialog from '@radix-ui/react-dialog';
import { Icons } from './ui/icons';

const HowToAddDollModal = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='text-body-md text-neutral-01 sm:text-center underline decoration-neutral-01 underline-offset-2'>
          How to Add a Doll
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none'>
          <div
            className='absolute left-1/2 -translate-x-1/2
        w-[375px] h-[514px] sm:w-[480px] sm:h-[530px] 
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden'
          />
          <div
            className='absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)] 
        [mask-size:100%_100%,480px_530px] 
        [mask-position:0_0,50%_50%] 
        [mask-repeat:no-repeat] 
        [mask-composite:exclude]'
            style={{
              maskImage:
                "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='530' viewBox='0 0 480 530' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='530' rx='12' fill='black'/%3E%3C/svg%3E\")",
            }}
          />
        </Dialog.Overlay>

        <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] w-full rounded-xl sm:py-8 py-9 sm:px-12 px-[18px] shadow-bottom backdrop-blur-lg z-20'>
          <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
          <div className='flex flex-col sm:gap-[18px] gap-3'>
            <div className='sm:text-heading-h1 text-heading-h2 text-center'>👩 📱</div>
            <div className='flex flex-col gap-2'>
              <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center'>How to Add a Doll</Dialog.Title>
              <Dialog.Description className='sm:text-center sm:text-body-lg text-body-md text-base-black'>
                Start the Doll and connect your smartphone to the <span className='font-semibold'>Cipherdoll</span> WiFi network.
                <br /> <br />
                The setup page will open automatically. <br /> <br /> Enter your WiFi name, password, and Cipherdolls API key. <br /> <br />{' '}
                Save the settings; the Doll will connect and start speaking.
              </Dialog.Description>
            </div>
            <div className='sm:mt-[22px] mt-[18px] grid grid-cols-2 gap-2'>
              <Dialog.Close asChild>
                <button className='bg-neutral-04 rounded-full w-full text-body-md font-semibold text-base-black py-3.5 focus:outline-0'>
                  Got It
                </button>
              </Dialog.Close>
              <button className='bg-base-black rounded-full py-3.5 text-body-md font-semibold text-base-white'>Copy API</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default HowToAddDollModal;
