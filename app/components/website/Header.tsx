import React from 'react';
import * as Button from '~/components/ui/button/button';
import { useWalletAuth } from '~/hooks/useWalletAuth';
import { useAuthStore } from '~/store/useAuthStore';
import { useNavigate } from 'react-router';
import { ROUTES } from '~/constants';

const navigationItems = [
  {
    label: 'How it Works',
    sectionId: 'sectionHowItWorks',
  },

  {
    label: 'How to use',
    sectionId: 'steps',
  },

  {
    label: 'Avatars',
    sectionId: 'avatars',
  },

  {
    label: 'Scenarios',
    sectionId: 'scenarios',
  },

  {
    label: 'Features',
    sectionId: 'features',
  },
];

const Header = ({ isVerifying = false }: { isVerifying?: boolean }) => {
  const { signIn, signInAsGuest, isLoading, error, hasEthereum } = useWalletAuth();
  const { isAuthenticated, isUsingBurnerWallet } = useAuthStore();
  const navigate = useNavigate();

  const handleNavigationItemClick = (e: React.MouseEvent<HTMLButtonElement>, elementId: string) => {
    e.preventDefault();
    document.getElementById(elementId)?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate(ROUTES.chats);
    } else {
      signIn();
    }
  };

  return (
    <header className='fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md border-b border-gray-200/50 z-50'>
      <div className='container'>
        <div className='flex justify-between items-center h-16 gap-3'>
          {/* Logo */}
          <div className='flex items-center'>
            <img src='/logo.svg' alt='Cipherdolls' className='w-48 h-auto' />
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden lg:flex items-center space-x-8'>
            {navigationItems.map((item, index) => (
              <button
                onClick={(e) => handleNavigationItemClick(e, item.sectionId)}
                className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'
                key={index}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className='flex items-center gap-3'>
            {isAuthenticated ? (
              <>
                {/* Switch to MetaMask Button */}
                <Button.Root
                  className='gradient-move px-6 md:px-8 md:py-5.5 min-w-[160px] md:min-w-[200px]'
                  size='sm'
                  onClick={signIn}
                  disabled={isLoading || isVerifying}
                >
                  {isUsingBurnerWallet ? 'Continue with MetaMask' : 'Go to Chats'}
                </Button.Root>
              </>
            ) : (
              <>
                {/* Main SignIn Button */}
                <Button.Root
                  className='gradient-move px-6 md:px-8 md:py-5.5 min-w-[160px] md:min-w-[200px]'
                  size='sm'
                  onClick={signIn}
                  disabled={isLoading || isVerifying}
                >
                  {isVerifying || isLoading ? 'Loading...' : 'Start Chat for Free'}
                </Button.Root>
              </>
            )}
            {error && (
              <div className='absolute top-full right-0 mt-2 text-red-600 text-sm bg-white p-2 rounded shadow-lg'>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
