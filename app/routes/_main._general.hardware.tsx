import { NavLink, Outlet, useLocation, useNavigate, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/_main._general.hardware';
import { cn } from '~/utils/cn';
import { Icons } from '~/components/ui/icons';
import type { User } from '~/types';
import { useEffect, useMemo } from 'react';
export function meta({}: Route.MetaArgs) {
  return [{ title: 'Hardware' }];
}

const hardwareNavItems = [
  {
    label: 'Doll Bodies',
    to: 'doll-bodies',
    href: '/hardware/doll-bodies/new',
    banner: {
      emoji: '🗣️',
      text: '',
    },
  },
  {
    label: 'Firmwares',
    to: 'firmwares',
    href: '/',
  },
];

export default function Hardware() {
  const location = useLocation();
  const navigate = useNavigate();
  const me = useRouteLoaderData('routes/_main') as User;

  useEffect(() => {
    if (location.pathname === '/hardware') {
      navigate('/hardware/doll-bodies', { replace: true });
    }
  }, [location.pathname, navigate]);

  const activeItem = useMemo(() => {
    return hardwareNavItems.find((item) => location.pathname.includes(`/${item.to}`)) || hardwareNavItems[0];
  }, [location.pathname]);

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between sm:mt-8 mb-4'>
        <h2 className='text-2xl font-semibold '>Hardware</h2>
      </div>
      <nav className='border-b border-neutral-04 flex items-center justify-between relative'>
        <div className='flex gap-x-5 gap-y-2 items-center flex-wrap'>
          {hardwareNavItems.map((item, index) => {
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
        {activeItem.banner?.text && (
          <div className='rounded-[10px] bg-gradient-1 px-4 py-3 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <span className='text-4xl leading-[1.1] font-semibold'>{activeItem.banner.emoji}</span>
              <span className='text-body-sm text-base-black'>{activeItem.banner.text}</span>
            </div>
            <button className='hover:opacity-50 transition-colors'>
              <Icons.close />
            </button>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
