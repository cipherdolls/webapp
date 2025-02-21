import { Outlet } from "react-router";
import MainNavigation from "~/components/MainNavigation";


const MainLayout = () => {
  return (
    <div className="">
        <MainNavigation />
        <Outlet />
    </div>
  );
};

export default MainLayout;
