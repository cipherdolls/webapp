import React from 'react';
import { useAuthStore } from '~/store/useAuthStore';
import { useWalletAuth } from '~/hooks/useWalletAuth';
import * as Button from '~/components/ui/button/button';


export const GuestModeBanner: React.FC = () => {
  const { isUsingBurnerWallet, isAuthenticated } = useAuthStore();
  const { signIn, isLoading } = useWalletAuth();

  // Show banner only if user is authenticated and using burner wallet
  if (!isAuthenticated || !isUsingBurnerWallet) {
    return null;
  }

  const handleConnectMetaMask = () => {
    signIn();
  };

  return (
    <div className='bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-3'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center'>
                <span className='text-amber-600 text-sm'>👤</span>
              </div>
            </div>
            <div className='flex-1'>
              <h3 className='text-sm font-medium text-amber-800'>You are in Guest Mode</h3>
              <p className='text-sm text-amber-700'>
                All data you create (chats, avatars, scenarios) will be lost when you exit. Connect MetaMask to save your data permanently.
              </p>
            </div>
          </div>
          <div className='flex-shrink-0 ml-4'>
             <Button.Root
               className='gradient-move px-6 md:px-8 md:py-5.5 min-w-[160px] md:min-w-[200px]'
               size='sm'
               onClick={handleConnectMetaMask}
               disabled={isLoading}
             >
               {isLoading ? 'Connecting...' : 'Connect MetaMask'}
             </Button.Root>
          </div>
        </div>
      </div>
    </div>
  );
};
