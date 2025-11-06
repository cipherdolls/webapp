import { LoginModalProvider } from '~/context/login-modal-context';
import type { Route } from './+types/_website';
import LoginModal from '~/components/website/LoginModal';
import { Outlet } from 'react-router';

const WebsiteLayout = ({ loaderData }: Route.ComponentProps) => {
  return (
    <>
      <LoginModalProvider>
        <Outlet />
        <LoginModal />
      </LoginModalProvider>
    </>
  );
};

export default WebsiteLayout;
