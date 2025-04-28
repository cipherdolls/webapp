import { useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, FC } from 'react';
import * as Button from '~/components/ui/button/button';

const SignInWithMetamask: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ type = 'button', ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasEthereum, setHasEthereum] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasEthereum(typeof window !== 'undefined' && !!window.ethereum);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='flex flex-col items-center'>
      <Button.Root variant='primary' size='lg' className='px-6' disabled={isLoading || !hasEthereum} {...props} type={type}>
        <p>{isLoading ? 'Checking Web3...' : hasEthereum ? 'Web3 Login' : 'Web3 Not Available'}</p>
      </Button.Root>

      {!isLoading && !hasEthereum && (
        <div className='mt-4 text-sm text-center max-w-md text-neutral-01 p-3'>
          <p className='mb-2'>
            <strong>What is Web3 Login?</strong>
          </p>
          <p className='mb-3'>
            Web3 login uses blockchain wallets like MetaMask for secure, passwordless authentication. Your wallet acts as your digital
            identity across web3 applications.{' '}
            <a
              href='https://metamask.io/download/'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block text-black font-medium underline hover:text-black/70 mr-2'
            >
              Download MetaMask Browser Plugin
            </a>
            or{' '}
            <a
              href='https://brave.com/download/'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block text-black font-medium underline hover:text-black/70'
            >
              Download Brave Browser
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default SignInWithMetamask;
