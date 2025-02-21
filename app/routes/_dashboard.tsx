import { Outlet } from "react-router";
import MainNavigation from "~/components/MainNavigation";

export default function DashboardLayout() {
  return (
    <div className="h-screen flex">
      <MainNavigation />
      <main className="flex-1 max-w-[980px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
