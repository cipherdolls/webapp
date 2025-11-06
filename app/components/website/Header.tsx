import React from 'react';
import LoginButton from './LoginButton';

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

const Header = () => {


  const handleNavigationItemClick = (e: React.MouseEvent<HTMLButtonElement>, elementId: string) => {
    e.preventDefault();
    document.getElementById(elementId)?.scrollIntoView({
      behavior: 'smooth',
    });
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
            <LoginButton
              className=' min-w-[160px] md:min-w-[200px]'
              size='sm'
              aria-label='Log in to CipherDolls'
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
