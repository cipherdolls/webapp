import { Link, NavLink, useNavigate, type NavLinkProps } from 'react-router';
import { cn } from '~/utils/cn';
import LogoSvg from '~/assets/svg/logo.svg';
import DashboardSvg from '~/assets/svg/dashboard-icon.svg';
import ChatsSvg from '~/assets/svg/chat.svg';
import PreferencesSvg from '~/assets/svg/preferences.svg';
import Logout from '~/assets/svg/logout.svg';
import { ROUTES } from '~/constants';

const MainNavigation = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  return (
    <aside
      className={cn(
        'fixed left-0 right-0 bottom-0 flex flex-col rounded-t-xl shadow-[0px_-4px_24px_0px_#0000000F] bg-[linear-gradient(86.23deg,rgba(254,253,248,0.48)_0%,rgba(255,255,255,0.48)_100%)]  border-r border-black/5 md:rounded-none md:top-0 md:w-[var(--sidebar-width)] md:bg-white backdrop-blur-[48px] md:shadow-none',
        className
      )}
    >
      <div className='flex md:flex-col gap-4 px-2 h-full overflow-y-auto'>
        <div className='hidden justify-center shrink-0 h-24 md:flex  pt-7 pb-5'>
          <Link to={ROUTES.account} className=' md:flex'>
            <LogoSvg />
          </Link>
        </div>

        <nav className='flex justify-center flex-1 gap-5 px-5 md:flex-col md:gap-0.5 md:px-0'>
          <NavLinkComponent to={ROUTES.account}>
            <DashboardSvg />
            <span>Dashboard</span>
          </NavLinkComponent>

          <NavLinkComponent to='/chats'>
            <span className='relative'>
              <ChatsSvg />
              <span className='absolute top-0 right-0 w-2.5 h-2.5 bg-[#03CC9C] rounded-full border border-white' />
            </span>
            <span>Chats</span>
          </NavLinkComponent>

          <NavLinkComponent to='/preferences'>
            <PreferencesSvg />
            <span>Preferences</span>
          </NavLinkComponent>
        </nav>

        <div className='hidden h-24 shrink-0 md:block'>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('redirectAfterSignIn');
              navigate('/signin');
            }}
            className='flex flex-col gap-1 items-center justify-center w-full h-[72px] rounded-xl text-xs text-center font-semibold text-[#350D2A]/40 hover:bg-black/5 hover:text-black hover:cursor-pointer'
          >
            <Logout />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

const NavLinkComponent = ({ children, className, ...props }: NavLinkProps) => {
  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        cn(
          'flex flex-col gap-1 items-center justify-center h-[72px] rounded-xl text-xs text-center font-semibold text-[#350D2A]/40 hover:bg-black/5 hover:text-black',
          {
            'text-black md:bg-black/5': isActive,
          },
          className
        )
      }
    >
      {children}
    </NavLink>
  );
};

export default MainNavigation;
