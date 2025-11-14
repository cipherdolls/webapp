import { LoginModalProvider } from '~/context/login-modal-context';
import type { Route } from './+types/_website';
import { Outlet } from 'react-router';

const WebsiteLayout = ({ loaderData }: Route.ComponentProps) => {
  return (
    <>
      <LoginModalProvider>
        <Outlet />
      </LoginModalProvider>
    </>
  );
};

export default WebsiteLayout;
