import type { Route } from './+types/_website';
import { Outlet } from 'react-router';

const WebsiteLayout = ({ loaderData }: Route.ComponentProps) => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default WebsiteLayout;
