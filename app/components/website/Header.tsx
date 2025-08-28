import React from 'react';
import * as Button from '~/components/ui/button/button';
import { Link } from 'react-router';
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

const Header = () => {
  const handleNavigationItemClick = (e: React.MouseEvent<HTMLButtonElement>, elementId: string) => {
    e.preventDefault();
    document.getElementById(elementId)?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <header className='fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md border-b border-gray-200/50 z-100'>
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

          {/* CTA Button */}
          <div className=''>
            <Button.Root className='gradient-move px-6 md:px-8 md:py-5.5' size='sm' asChild>
              <Link to={ROUTES.signIn}>Start Chat for Free</Link>
            </Button.Root>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
