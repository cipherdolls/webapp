import type { ButtonHTMLAttributes, FC } from 'react';
import * as Button from '~/components/ui/button/button';

const SignInWithMetamask: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ type = 'button', ...props }) => {
  return (
    <Button.Root variant='primary' size='lg' className='px-6' {...props} type={type}>
      <Button.Icon as='div' className='mr-4'>
        <img src='/metamask.svg' alt='Metamask Icon' className='size-8' />
      </Button.Icon>
      <p>
        Sign in via <span className='font-semibold'> MetaMask</span>
      </p>
    </Button.Root>
  );
};

export default SignInWithMetamask;
