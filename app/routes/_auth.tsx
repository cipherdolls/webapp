import { Outlet } from 'react-router';

const AuthLayout = () => {
  return (
    <div className='flex size-full relative'>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
