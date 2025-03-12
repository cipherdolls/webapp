import { NavLink, Outlet } from 'react-router';
import type { Route } from './+types/_main._general.preferences';
import { cn } from '~/utils/cn';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Preferences' }];
}

const preferencesNavItems = [
  {
    label: 'AI',
    to: 'ai',
  },
  {
    label: 'TTS',
    to: 'tts',
  },
  {
    label: 'STT',
    to: 'stt',
  },
  {
    label: 'Scenarios',
    to: 'scenarios',
  },
  {
    label: 'Firmwares',
    to: 'firmwares',
  },
  {
    label: 'Doll Bodies',
    to: 'doll-bodies',
  },
];

export default function Preferences() {
  return (
    <div className='w-full'>
      <h2 className='text-2xl font-semibold sm:mt-8 mb-4'>Preferences</h2>
      <nav className='flex gap-5 border-b border-neutral-04'>
        {preferencesNavItems.map((item, index) => {
          return (
            <NavLink
              key={index}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative text-lg text-neutral-01 px-1 py-1',
                  isActive &&
                    'text-base-black after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-01 after:rounded-t-[3px]'
                )
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className='mt-8 sm:mt-16'>
        <Outlet />
      </div>
    </div>
  );
}
