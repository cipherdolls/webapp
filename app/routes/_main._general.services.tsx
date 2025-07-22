import { Link, NavLink, Outlet, useLocation, useNavigate, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/_main._general.services';
import { cn } from '~/utils/cn';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import type { User } from '~/types';
import { useEffect, useMemo, useState } from 'react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Services' }];
}

const servicesNavItems = [
  {
    label: 'AI',
    to: 'ai',
    link: 'AI Provider',
    href: '/services/ai/ai-provider/new',
    infoMessage: 'ai-info-message',
    banner: {
      emoji: '🤖',
      text: 'Tools with pricing for text processing, data analysis, and other AI tasks.',
    },
  },
  {
    label: 'TTS',
    to: 'tts',
    link: 'TTS Provider',
    href: '/services/tts/tts-provider/new',
    infoMessage: 'tts-info-message',
    banner: {
      emoji: '🗣️',
      text: 'Services for converting text to speech.',
    },
  },
  {
    label: 'STT',
    to: 'stt',
    link: 'STT Provider',
    href: '/services/stt/stt-provider/new',
    infoMessage: 'stt-info-message',
    banner: {
      emoji: '👂',
      text: 'Services for converting speech to text.',
    },
  },
];

export default function Services() {
  const location = useLocation();
  const navigate = useNavigate();
  const me = useRouteLoaderData('routes/_main') as User;

  const [isShouldShowInfoMessage, setIsShouldShowInfoMessage] = useState(false);

  const activeItem = useMemo(() => {
    return servicesNavItems.find((item) => location.pathname.includes(`/${item.to}`)) || servicesNavItems[0];
  }, [location.pathname]);

  const handleClose = (item: string) => {
    localStorage.setItem(item, 'hidden');
    setIsShouldShowInfoMessage(false);
  };

  useEffect(() => {
    if (location.pathname === '/services') {
      navigate('/services/ai', { replace: true });
      return;
    }

    setIsShouldShowInfoMessage(localStorage.getItem(activeItem.infoMessage) !== 'hidden');
  }, [location.pathname, navigate, activeItem.infoMessage]);

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between sm:mt-8 mb-4'>
        <h2 className='text-2xl font-semibold '>Services</h2>
        {(me.role === 'ADMIN' || activeItem?.to === 'scenarios') && activeItem?.link && (
          <Link to={activeItem?.href || '/services/ai'}>
            <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
              <Button.Icon as={Icons.add} />
              {activeItem?.link}
            </Button.Root>
          </Link>
        )}
      </div>
      <nav className='border-b border-neutral-04 flex items-center justify-between relative'>
        <div className='flex gap-x-5 gap-y-2 items-center flex-wrap'>
          {servicesNavItems.map((item, index) => {
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
      </nav>

      <div className='mt-6 flex flex-col gap-6'>
        {isShouldShowInfoMessage && (
          <div className='rounded-[10px] bg-gradient-1 px-4 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <span className='text-4xl leading-[1.1] font-semibold'>{activeItem.banner.emoji}</span>
              <span className='text-body-sm text-base-black'>{activeItem.banner.text}</span>
            </div>

            <button onClick={() => handleClose(activeItem.infoMessage)} className='hover:opacity-50 transition-colors'>
              <Icons.close />
            </button>
          </div>
        )}

        <Outlet />
      </div>
    </div>
  );
}
