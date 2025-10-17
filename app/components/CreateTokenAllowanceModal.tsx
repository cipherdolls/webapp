import * as Dialog from '@radix-ui/react-dialog';
import * as Button from '~/components/ui/button/button';
import * as Slider from '~/components/ui/slider';
import { PermitButton } from '~/components/buttons/PermitButton';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface CreateTokenAllowanceModalProps {
  children: ReactNode;
  tokenBalance?: string | number; // Optional - not used anymore
  onPermitSigned: (permit: {
    owner: string;
    spender: string;
    value: string;
    nonce: string;
    deadline: number;
    v: number;
    r: string;
    s: string;
  }) => void;
}

const CreateTokenAllowanceModal = ({ children, tokenBalance, onPermitSigned }: CreateTokenAllowanceModalProps) => {
  const [open, setOpen] = useState(false);

  // Fibonacci sequence for fixed amounts
  const fibonacciAmounts = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  const [selectedIndex, setSelectedIndex] = useState(4);
  const amount = fibonacciAmounts[selectedIndex];

  const handlePermitSigned = (permit: any) => {
    onPermitSigned(permit);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='animate-overlay-show sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none z-20'>
          <div
            className='absolute  left-1/2 -translate-x-1/2
        w-[375px] h-[224px] sm:w-[480px] sm:h-[282px]
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden'
          />
          <div
            className='absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)]
        [mask-size:100%_100%,480px_282px]
        [mask-position:0_0,50%_50%]
        [mask-repeat:no-repeat]
        [mask-composite:exclude]
        '
            style={{
              maskImage:
                "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='282' viewBox='0 0 480 282' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='282' rx='12' fill='black'/%3E%3C/svg%3E\")",
            }}
          />
        </Dialog.Overlay>

        <Dialog.Content className='animate-modal-show fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-30 max-h-[80vh] overflow-y-auto'>
          <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
          <div className='flex flex-col sm:gap-6 gap-4'>
            <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center font-semibold'>
              Create Token Allowance
            </Dialog.Title>

            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <label className='text-body-lg text-base-black'>LOV Token amount</label>
                  <span className='text-heading-h2 font-bold text-base-black'>{amount}</span>
                </div>

                <div className='px-2'>
                  <Slider.Root
                    value={[selectedIndex]}
                    onValueChange={(value) => setSelectedIndex(value[0])}
                    min={0}
                    max={fibonacciAmounts.length - 1}
                    step={1}
                    className='w-full'
                  >
                    <Slider.Thumb />
                  </Slider.Root>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <Dialog.Close asChild>
                  <Button.Root variant='secondary' className='w-full'>
                    Cancel
                  </Button.Root>
                </Dialog.Close>

                <PermitButton
                  tokenAddress='0x77469eeb563a6035b7b898f6a392284371918045'
                  tokenName='cipherdolls'
                  tokenVersion='1'
                  spender='0x2A0a2744d4d96b43C2C273f1906AD89dFe2AD607'
                  amount={amount.toString()}
                  onSigned={handlePermitSigned}
                />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateTokenAllowanceModal;
