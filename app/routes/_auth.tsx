import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="flex items-center justify-center size-full relative">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
