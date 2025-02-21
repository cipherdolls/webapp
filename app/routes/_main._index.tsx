import DashboardBanner from "~/components/dashboardBanner";
import { Icons } from "~/components/ui/icons";

const Dashbaord = () => {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-4">
        <h3 className="text-heading-h3 py-3 sm:block hidden">Dashboard</h3>
        <div className="sm:hidden block ml-[18px] ">
          <Icons.mobileLogo />
        </div>
        <DashboardBanner
          variant="welcome"
          description="What do you want to start from?"
        />
      </div>
      <div></div>
    </div>
  );
};

export default Dashbaord;
