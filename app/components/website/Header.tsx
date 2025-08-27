import React from 'react';
import { Menu, X } from 'lucide-react';
import * as Button from '~/components/ui/button/button';
import { Link } from 'react-router';
import { ROUTES } from '~/constants';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className='fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md border-b border-gray-200/50 z-50'>
      <div className='container'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <img src='/logo.svg' alt='Cipherdolls' className='w-48 h-auto' />
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-8'>
            <a href='#how-it-works' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
              How it Works
            </a>
            <a href='#steps' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
              How to use
            </a>
            <a href='#avatars' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
              Avatars
            </a>
            <a href='#scenarios' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
              Scenarios
            </a>
            <a href='#features' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
              Features
            </a>
          </nav>

          {/* CTA Button */}
          <div className='hidden md:flex items-center'>
            <Button.Root className='gradient-move px-6'>
              <Link to={ROUTES.signIn}>Start Chat for Free</Link>
            </Button.Root>
          </div>

          {/* Mobile menu button */}
          <button className='md:hidden' onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden py-4 border-t border-gray-200/50'>
            <div className='flex flex-col space-y-3'>
              <a href='#how-it-works' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
                How it Works
              </a>
              <a href='#steps' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
                How to use
              </a>
              <a href='#avatars' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
                Avatars
              </a>
              <a href='#scenarios' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
                Scenarios
              </a>
              <a href='#features' className='text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium'>
                Features
              </a>
              <button className='gradient-move text-white px-6 py-2 rounded-full transition-all duration-300 ease-in-out text-sm font-medium mt-3 self-start hover:shadow-lg'>
                Start Chat for Free
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
