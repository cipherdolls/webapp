import React, { useRef } from 'react';
import WalletIcon from '~/assets/smile/wallet.png';
import { cn } from '~/utils/cn';
import { Icons } from '~/components/ui/icons';

interface IProps {
  isOpen: boolean;
  isCopied: boolean;
  setIsOpen: (open: boolean) => void;
  setIsCopied: (copied: boolean) => void;
}

export const ModalWalletInfo: React.FC<IProps> = ({ isOpen, isCopied, setIsCopied, setIsOpen }) => {
  const modalRef = useRef(null);

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  const handleClickCopied = () => {
    setIsCopied(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsCopied(false);
    }, 700);
  };

  return (
    <>
      {isOpen && (
        <>
          <div
            ref={modalRef}
            onClick={handleClickOutside}
            className='z-10 fixed top-0 left-0 bottom-0 right-0 overflow-y-scroll bg-neutral-02'
          />

          <aside className='absolute z-50 flex flex-col justify-between items-center px-6 py-8 bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-xl backdrop-blur-48 bg-[#fef9e9] max-h-[310px] md:max-h-[362px] md:top-1/2 md:-translate-y-1/2 md:p-8 md:max-w-[480px] '>
            <div className='flex flex-col justify-center items-center'>
              <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />

              <img src={WalletIcon} alt={'Who You Icon'} className='mb-6 w-10 sm:w-12 md:w-16' />

              <h2 className='text-2xl font-semibold lg:text-heading-h2 mb-2'>Your Wallet</h2>

              <p className='text-body-md font-normal md:text-body-lg text-center max-w-[384px]'>
                Send Ether to this address - <br />
                <span className='font-semibold underline'>0x8fFcd8fD8A00525E53007095f91743A89...</span> <br />
                to top up your account.
              </p>
            </div>

            <div className='w-full flex justify-center gap-2 lg:gap-3'>
              <button
                onClick={() => setIsOpen(false)}
                className='w-full text-[16px] font-semibold h-12 text-base-black bg-neutral-04 rounded-full max-w-[186px] transition duration-200 hover:bg-neutral-05'
              >
                Got It
              </button>

              <button
                onClick={handleClickCopied}
                className={cn(
                  'flex items-center justify-center gap-1 w-full text-[16px] font-semibold h-12 text-base-white bg-base-black rounded-full max-w-[186px] transition duration-200',
                  isCopied && 'bg-base-black/0'
                )}
              >
                {isCopied ? (
                  <>
                    <Icons.copied /> <span className='text-base-black'>Copied</span>
                  </>
                ) : (
                  'Copy Address'
                )}
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
