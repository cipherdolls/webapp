import * as Dialog from '@radix-ui/react-dialog';
import * as Button from '~/components/ui/button/button';
import * as Slider from '~/components/ui/slider';
import { PermitButton } from '~/components/buttons/PermitButton';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { ANIMATE_MODAL_SHOW_CENTER, ANIMATE_OVERLAY, USDC_TOKEN_ADDRESS, USDC_TOKEN_NAME, USDC_TOKEN_VERSION, SPENDER_ADDRESS } from '~/constants';
import { motion } from 'motion/react';
import { useCreateTokenPermit } from '~/hooks/queries/tokenMutations';

interface CreateTokenAllowanceModalProps {
  children: ReactNode;
}

const CreateTokenAllowanceModal = ({ children }: CreateTokenAllowanceModalProps) => {
  const [open, setOpen] = useState(false);
  const [permitKey, setPermitKey] = useState(0); // Key to force PermitButton remount

  const { mutate: createTokenPermit, isPending: isCreatingTokenPermit } = useCreateTokenPermit();

  const tokenAmounts = [1, 10, 100, 1000, 10000, 100000];
  const [selectedIndex, setSelectedIndex] = useState(2);
  const amount = tokenAmounts[selectedIndex];

  // Reset PermitButton when modal is closed to clear any stale state
  useEffect(() => {
    if (!open) {
      setPermitKey((prev) => prev + 1);
    }
  }, [open]);

  const handlePermitSigned = (permit: any) => {
    createTokenPermit(
      {
        owner: permit.owner,
        spender: permit.spender,
        value: permit.value,
        nonce: permit.nonce,
        deadline: permit.deadline.toString(),
        v: permit.v.toString(),
        r: permit.r,
        s: permit.s,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay asChild forceMount className='sm:bg-transparent bg-neutral-02 fixed inset-0 pointer-events-none z-20'>
          <motion.div initial={ANIMATE_OVERLAY.initial} animate={ANIMATE_OVERLAY.animate} transition={ANIMATE_OVERLAY.transition}>
            <div
              className='absolute  left-1/2 -translate-x-1/2
        w-[375px] h-[224px] sm:w-[480px] sm:h-[272px]
        bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
        rounded-xl pointer-events-none sm:block hidden'
            />
            <div
              className='absolute inset-0 bg-gradient-to-b from-neutral-02 to-neutral-02 sm:block hidden
        [mask-image:linear-gradient(to_bottom,black_0%,black_100%),linear-gradient(to_right,black_0%,black_100%)]
        [mask-size:100%_100%,480px_272px]
        [mask-position:0_0,50%_50%]
        [mask-repeat:no-repeat]
        [mask-composite:exclude]
        '
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 100%), url(\"data:image/svg+xml,%3Csvg width='480' height='272' viewBox='0 0 480 272' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='480' height='272' rx='12' fill='black'/%3E%3C/svg%3E\")",
              }}
            />
          </motion.div>
        </Dialog.Overlay>

        <Dialog.Content asChild forceMount>
          <motion.div
            initial={ANIMATE_MODAL_SHOW_CENTER.initial}
            animate={ANIMATE_MODAL_SHOW_CENTER.animate}
            transition={ANIMATE_MODAL_SHOW_CENTER.transition}
            className='animate-modal-show fixed left-1/2 bottom-0 sm:bottom-auto sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 focus:outline-none max-w-[480px] bg-gradient-1 w-full rounded-xl sm:py-8 py-9 sm:px-12 px-4.5 shadow-bottom backdrop-blur-lg z-30 max-h-[80vh] overflow-y-auto'
          >
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
            <div className='flex flex-col sm:gap-6 gap-4'>
              <Dialog.Title className='sm:text-heading-h2 text-heading-h3 text-base-black text-center font-semibold'>
                Set Token Allowance
              </Dialog.Title>

              <div className='flex flex-col gap-6'>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between'>
                    <label className='text-body-lg text-base-black'>USDC amount</label>
                    <span className='text-heading-h2 font-bold text-base-black'>{amount}</span>
                  </div>

                  <div className='px-2'>
                    <Slider.Root
                      value={[selectedIndex]}
                      onValueChange={(value) => setSelectedIndex(value[0])}
                      min={0}
                      max={tokenAmounts.length - 1}
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
                    key={permitKey}
                    tokenAddress={USDC_TOKEN_ADDRESS}
                    tokenName={USDC_TOKEN_NAME}
                    tokenVersion={USDC_TOKEN_VERSION}
                    spender={SPENDER_ADDRESS}
                    amount={amount.toString()}
                    onSigned={handlePermitSigned}
                    isPending={isCreatingTokenPermit}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateTokenAllowanceModal;
