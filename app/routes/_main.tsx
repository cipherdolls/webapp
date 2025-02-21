import { Outlet } from "react-router";

import Sidebar from "~/components/sidebar";

const MainLayout = () => {
  return (
    <div className="flex sm:flex-row flex-col-reverse xl:gap-8 lg:gap-6 gap-4 size-full">
      <Sidebar />
      <main className="flex flex-1 max-w-[980px] w-full mx-auto h-screen overflow-y-auto py-3 sm:py-[22px] lg:px-8 md:px-6 sm:px-4 px-1.5">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
