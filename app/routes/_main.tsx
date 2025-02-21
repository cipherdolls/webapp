import { Outlet } from "react-router";

import Sidebar from "~/components/sidebar";

const MainLayout = () => {
  return (
    <div className="flex sm:flex-row flex-col-reverse xl:gap-8 lg:gap-6 gap-4 size-full">
      <Sidebar />
      <main className="flex flex-1 max-w-[980px] w-full mx-auto h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
