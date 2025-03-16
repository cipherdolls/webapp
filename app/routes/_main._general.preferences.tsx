import { Link, NavLink, Outlet, useLocation } from 'react-router';
import type { Route } from './+types/_main._general.preferences';
import { cn } from '~/utils/cn';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Preferences' }];
}

const preferencesNavItems = [
  {
    label: 'AI',
    to: 'ai',
    link: 'AI Provider',
    href: '/preferences/ai/ai-provider/new',
  },
  {
    label: 'TTS',
    to: 'tts',
    // link: 'TTS Provider',
    href: '/',
  },
  {
    label: 'STT',
    to: 'stt',
    // link: 'STT Provider',
    href: '/',
  },
  {
    label: 'Scenarios',
    to: 'scenarios',
    // link: 'Scenario',
    href: '/',
  },
  {
    label: 'Firmwares',
    to: 'firmwares',
    // link: 'Firmware',
    href: '/',
  },
  {
    label: 'Doll Bodies',
    to: 'doll-bodies',
    // link: 'Doll Body',
    href: '/',
  },
];

export default function Preferences() {
  const location = useLocation();

  const activeItem = preferencesNavItems.find((item) => location.pathname.includes(`/${item.to}`));

  return (
    <div className='w-full'>
      <h2 className='text-2xl font-semibold sm:mt-8 mb-4'>Preferences</h2>
      <nav className='border-b border-neutral-04 flex items-center justify-between relative'>
        <div className='flex gap-x-5 gap-y-2 items-center flex-wrap'>
          {preferencesNavItems.map((item, index) => {
            return (
              <NavLink
                key={index}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative text-body-lg text-neutral-01 px-1 pb-1.5',
                    isActive &&
                      'text-base-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-01 after:rounded-t-[3px]'
                  )
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
        {activeItem?.link && (
          <Link to={activeItem?.href || '/preferences/ai'} className='absolute right-0 sm:bottom-2.5 -top-12 sm:top-auto'>
            <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
              <Button.Icon as={Icons.add} />
              {activeItem?.link}
            </Button.Root>
          </Link>
        )}
      </nav>

      <div className='mt-8 sm:mt-16'>
        <Outlet />
      </div>
    </div>
  );
}
