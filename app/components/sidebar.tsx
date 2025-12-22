import { Link, NavLink } from 'react-router';
import { useMemo, useCallback } from 'react';
import { BookOpenText } from 'lucide-react';
import { Icons, type IconProps } from './ui/icons';
import { cn } from '~/utils/cn';
import { ViewMore } from '~/view-more';
import { ROUTES } from '~/constants';
import { useAuthStore } from '~/store/useAuthStore';
import { useUser } from '~/hooks/queries/userQueries';

const SidebarItems = [
  {
    name: 'Chats',
    href: ROUTES.chats,
    icon: Icons.chats,
  },
  {
    name: 'Avatars',
    href: ROUTES.avatars,
    icon: Icons.users,
  },
  {
    name: 'Scenarios',
    href: ROUTES.scenarios,
    icon: Icons.scenarios,
  },
  {
    name: 'Services',
    href: ROUTES.ai,
    icon: ({ className }: { className?: string }) => <BookOpenText className={cn('text-[#350D2A]/40', className)} size={20} />,
    hideOnMobile: true,
  },
  // {
  //   name: 'Hardware',
  //   href: ROUTES.hardware,
  //   icon: Icons.gear,
  //   hideOnMobile: true,
  // },
  {
    name: 'Menu',
    href: null, // This will be handled as button, not link
    icon: Icons.more,
    showOnMobileOnly: true,
  },
];

const Sidebar = ({ className }: { className?: string }) => {
  const { data: user } = useUser();
  const isAdmin = user?.role === 'ADMIN';
  const logout = useAuthStore((state) => state.logout);

  const menuItems = useMemo(
    () => [
      { type: 'link' as const, text: 'Account', href: ROUTES.account, icon: Icons.account },
      { type: 'link' as const, text: 'Services', href: ROUTES.services, icon: Icons.services },
    ],
    [logout]
  );

  const getNavLinkClassName = useCallback(
    (item: {
      name: string;
      href: string | null;
      icon: (props: IconProps) => React.JSX.Element;
      hideOnMobile?: boolean;
      showOnMobileOnly?: boolean;
    }) =>
      ({ isActive }: { isActive: boolean }) => {
        return cn(
          'sm:py-3 py-2 sm:px-0 px-2 transition-colors rounded-xl flex flex-col sm:gap-2 gap-1 sm:w-full items-center justify-center',
          isActive ? 'sm:bg-neutral-05 hover:bg-neutral-04 text-base-black' : 'sm:bg-transparent hover:bg-neutral-05 text-pink-01',
          item.hideOnMobile && 'sm:flex hidden',
          item.showOnMobileOnly && 'sm:hidden flex'
        );
      },
    []
  );

  return (
    <aside className={cn('sm:w-[104px] flex', className)}>
      <div className='sm:py-4 sm:px-2 flex flex-col items-center justify-between flex-1 sm:bg-transparent sm:rounded-none rounded-t-xl bg-[linear-gradient(86.23deg,rgba(254,253,248,0.48)_0%,rgba(255,255,255,0.48)_100%)] sm:bg-none'>
        <Link to={ROUTES.chats} className='py-3.5 sm:block hidden'>
          <Icons.iconLogo className={cn(isAdmin ? 'text-specials-danger' : 'text-base-black')} />
        </Link>
        <div className='flex sm:flex-col flex-row sm:gap-3 w-full sm:justify-start justify-around sm:py-0 py-1'>
          {SidebarItems.map((item, index) => {
            const NavIcon = item.icon;

            if (item.name === 'Menu') {
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

            // Handle items without href as regular links
            if (item.href) {
              return (
                <NavLink to={item.href} key={index} className={getNavLinkClassName(item)}>
                  {({ isActive }) => (
                    <>
                      <NavIcon className={isActive ? 'text-black opacity-100' : undefined} />
                      <span className='text-label font-semibold'>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            }

            // Handle items without href (like disabled menu items)
            return (
              <div key={index} className={getNavLinkClassName(item)({ isActive: false })}>
                {<NavIcon />}
                <span className='text-label font-semibold'>{item.name}</span>
              </div>
            );
          })}
        </div>
        <NavLink
          to={ROUTES.account}
          className={getNavLinkClassName({ name: 'Account', href: ROUTES.account, icon: Icons.account, hideOnMobile: true })}
        >
          {<Icons.account />}
          <span className='text-label font-semibold'>Account</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
