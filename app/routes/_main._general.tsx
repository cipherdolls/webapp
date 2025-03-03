import { Outlet } from "react-router";

const GeneralLayout = () => {
  return (
    <main className='flex flex-1 overflow-y-scroll scrollbar-medium border-l border-neutral-04'>
      <div className='flex flex-1 max-w-[980px] w-full mx-auto py-3 sm:py-[22px] lg:px-8 md:px-6 sm:px-4 px-1.5'>
        <Outlet />
      </div>
    </main>
  );
};

export default GeneralLayout;
