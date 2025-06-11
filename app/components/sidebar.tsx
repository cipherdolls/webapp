import { Link, NavLink, useLocation, useRouteLoaderData } from 'react-router';
import { Icons } from './ui/icons';
import { cn } from '~/utils/cn';
import SignOutModal from './signOutModal';
import type { User } from '~/types';
import { ViewMore } from '~/view-more';

const PREFERENCE_RELATED_PATHS = [
  '/preferences',
  '/ai-providers',
  '/chat-models',
  '/doll-bodies',
  '/embedding-models',
  '/scenarios',
  '/stt-providers',
  '/tts-providers',
];

const SidebarItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Icons.dashboard,
  },
  {
    name: 'Chats',
    href: '/chats',
    icon: Icons.chats,
  },
  {
    name: 'Community',
    href: '/community',
    icon: Icons.users,
  },
  {
    name: 'Services',
    href: '/services',
    icon: Icons.services,
    hideOnMobile: true,
  },
  {
    name: 'Hardware',
    href: '/hardware',
    icon: Icons.gear,
    hideOnMobile: true,
  },
  {
    name: 'Account',
    href: '/account',
    icon: Icons.account,
    hideOnMobile: true,
  },
  {
    name: 'Menu',
    href: '#',
    icon: Icons.more,
    showOnMobileOnly: true,
  },
];

const Sidebar = ({ className }: { className?: string }) => {
  const me = useRouteLoaderData('routes/_main') as User;
  const location = useLocation();
  const isAdmin = me.role === 'ADMIN';
  return (
    <aside className={cn('sm:w-[104px] flex', className)}>
      <div className='sm:py-4 sm:px-2 flex flex-col items-center justify-between flex-1 sm:bg-transparent sm:rounded-none rounded-t-xl bg-[linear-gradient(86.23deg,rgba(254,253,248,0.48)_0%,rgba(255,255,255,0.48)_100%)] sm:bg-none'>
        <Link to='/' className='py-3.5 sm:block hidden'>
          <Icons.iconLogo className={cn(isAdmin ? 'text-specials-danger' : 'text-base-black')} />
        </Link>
        <div className='flex sm:flex-col flex-row sm:gap-3 w-full sm:justify-start justify-around sm:py-0 py-1'>
          {SidebarItems.map((item, index) => {
            const NavIcon = item.icon;

            if (item.name === 'Menu') {
              const menuItems = [
                { type: 'link' as const, text: 'Services', href: '/services', icon: Icons.services },
                { type: 'link' as const, text: 'Hardware', href: '/hardware', icon: Icons.gear },
                { type: 'link' as const, text: 'Account', href: '/account', icon: Icons.account },
              ];

              return (
                <ViewMore
                  key={index}
                  popoverItems={menuItems}
                  className={cn(
                    'sm:py-3 py-2 sm:px-0 px-2 transition-colors rounded-xl flex flex-col sm:gap-2 gap-1 sm:w-full items-center justify-center',
                    'sm:bg-transparent hover:bg-neutral-05 text-pink-01',
                    'sm:hidden flex'
                  )}
                  withIcon={true}
                  iconClassName='text-pink-01'
                  menuName={item.name}
                />
              );
            }

            return (
              <NavLink
                to={item.href}
                key={index}
                className={({ isActive }) => {
                  if (item.name === 'Preferences') {
                    isActive = PREFERENCE_RELATED_PATHS.some((path) => location.pathname.includes(path));
                  }
                  return cn(
                    'sm:py-3 py-2 sm:px-0 px-2 transition-colors rounded-xl flex flex-col sm:gap-2 gap-1 sm:w-full items-center justify-center',
                    isActive
                      ? 'sm:bg-neutral-05 hover:bg-neutral-04 text-base-black'
                      : 'sm:bg-transparent hover:bg-neutral-05 text-pink-01',
                    item.hideOnMobile && 'sm:flex hidden',
                    item.showOnMobileOnly && 'sm:hidden flex'
                  );
                }}
              >
                {<NavIcon />}
                <span className='text-label font-semibold'>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
        <div className='sm:block hidden w-full'>
          <SignOutModal>
            <button className='py-3 transition-colors text-label font-semibold text-pink-01 flex items-center justify-center gap-2 flex-col rounded-xl w-full bg-transparent hover:bg-neutral-05'>
              <Icons.signOut className='fill-[#350D2A]/40' />
              Sign Out
            </button>
          </SignOutModal>
        </div>
        {/* Optional for now */}
        {/* <div className="h-[34px] w-full sm:hidden" /> */}
      </div>
    </aside>
  );
};

export default Sidebar;
