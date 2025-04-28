import { useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, FC } from 'react';
import * as Button from '~/components/ui/button/button';

const SignInWithMetamask: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ type = 'button', ...props }) => {
  const [hasEthereum, setHasEthereum] = useState(false);

  useEffect(() => {
    setHasEthereum(typeof window !== 'undefined' && !!window.ethereum);
  }, []);

  return (
    <div className='flex flex-col items-center'>
      <Button.Root variant='primary' size='lg' className='px-6' {...props} type={type}>
        <Button.Icon as='div' className='mr-4'>
          <img src='/metamask.svg' alt='Web3 Icon' className='size-8' />
        </Button.Icon>
        <p>Web3 Login</p>
      </Button.Root>

      {!hasEthereum && (
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
              className='inline-block text-black font-medium underline hover:text-black/70'
            >
              Download MetaMask
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default SignInWithMetamask;
