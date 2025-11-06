import React from 'react';
import { Info } from 'lucide-react';
import { useAuthStore } from '~/store/useAuthStore';
import { useWalletAuth } from '~/hooks/useWalletAuth';
import { useAlert } from '~/providers/AlertDialogProvider';
import * as Button from '~/components/ui/button/button';


export const GuestModeBanner: React.FC = () => {
  const { isUsingBurnerWallet, isAuthenticated } = useAuthStore();
  const { signIn, isLoading } = useWalletAuth();
  const alert = useAlert();

  // Show banner only if user is authenticated and using burner wallet
  if (!isAuthenticated || !isUsingBurnerWallet) {
    return null;
  }

  const handleConnectMetaMask = () => {
    signIn();
  };

  const handleShowInfo = () => {
    alert({
      icon: '👤',
      title: 'Guest Mode',
      body: 'All data you create (chats, avatars, scenarios) will be lost when you exit. Connect MetaMask to save your data permanently.',
      cancelButton: 'Got it',
    });
  };

  return (
    <div className='bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-3'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2 md:space-x-3 flex-1'>
            <div className='flex-shrink-0 hidden md:flex'>
              <div className='w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center'>
                <span className='text-amber-600 text-sm'>👤</span>
              </div>
            </div>
            <div className='flex-1'>
              <h3 className='text-sm font-medium text-amber-800'>You are in Guest Mode</h3>
              {/* Full text on desktop */}
              <p className='hidden md:block text-sm text-amber-700'>
                All data you create (chats, avatars, scenarios) will be lost when you exit. Connect MetaMask to save your data permanently.
              </p>
              {/* Short text on mobile */}
              <p className='md:hidden text-sm text-amber-700'>
                Your data will be lost.
              </p>
            </div>
            {/* Info button - visible only on mobile */}
            <Button.Root
              onClick={handleShowInfo}
              variant='secondary'
              size='icon'
              className='md:hidden flex-shrink-0 ml-auto'
              aria-label='More information'
            >
              <Info className='size-5' />
            </Button.Root>
          </div>
          <div className='flex-shrink-0 ml-2 md:ml-4'>
             <Button.Root
               className='gradient-move px-4 py-2 md:px-8 md:py-5.5 min-w-[100px] md:min-w-[200px] text-xs md:text-sm'
               size='sm'
               onClick={handleConnectMetaMask}
               disabled={isLoading}
             >
               {isLoading ? 'Connecting...' : 'Continue with MetaMask'}
             </Button.Root>
          </div>
        </div>
      </div>
    </div>
  );
};
