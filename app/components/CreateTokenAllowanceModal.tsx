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
        <Dialog.Overlay className='bg-neutral-02 fixed inset-0 pointer-events-none' />

        <Dialog.Content className='fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-20 max-h-[80vh] overflow-y-auto'>
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
