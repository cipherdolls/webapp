import { redirect } from 'react-router';
import type { Route } from './+types/_main.account';
import InfoIcon from '~/assets/svg/info.svg';
import CopyIcon from '~/assets/svg/copy.svg';
import PlusIcon from '~/assets/svg/plus.svg';
import WhoYouIcon from '~/assets/smile/who-you.png';
import { Icons } from '~/components/ui/icons';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Account' }];
}

export async function clientLoader() {
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const headers = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/users/me`, headers);
    return await res.json();
  } catch (error) {
    console.error(error);
    return redirect('/signin');
  }
}

export default function Account({ loaderData }: Route.ComponentProps) {
  console.log(loaderData);
  return (
    <div className='w-full overflow-x-hidden'>
      <div className='mt-6 mb-8'>
        <h3 className='mb-8 font-semibold text-2xl'>Dashboard</h3>

        <div className='flex items-center gap-4 ml-3 md:ml-0'>
          <Icons.ethereum className='w-10' />

          <h1 className='text-4xl font-semibold md:text-[64px] leading-[71.68px]'>
            0.0012 <span className='text-neutral-01'>ETH</span>
          </h1>
        </div>
      </div>

      <div className='flex flex-col justify-between'>
        <div className='w-full order-2 max-w-2xl mt-10 border-r border-black/5 md:pr-5 md:mt-0'>
          <h3 className='text-[22px] ml-3 font-semibold mb-5 md:ml-0 md:text-2xl'>Your Info</h3>

          <div className='flex flex-col justify-center items-center rounded-[12px] bg-gradient-to-r from-[#FEFDF8]/55 to-[#FFFFFF]/70'>
            <button className='inline-flex justify-center items-center gap-2.5 cursor-pointer my-4 transition duration-300 hover:opacity-50'>
              <PlusIcon /> <span className='text-sm font-semibold'>Add Your Info</span>
            </button>

            <div className='flex w-full justify-center items-center pb-6 border-t border-black/5 pt-4 md:flex-col md:pb-20'>
              <img src={WhoYouIcon} alt={WhoYouIcon + '-icon'} className='w-10 mr-6 md:max-w-16 md:mb-2.5' />

              <div>
                <h4 className='text-[18px] text-base-black md:text-[22px] font-semibold mb-1'>Who are You?</h4>

                <p className='text-neutral-01 leading-tight font-normal max-w-64'>Add some info to make conversations more personalized</p>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-10 md:pl-5'>
          <div>
            <div className='flex justify-between items-center mb-4 md:mb-5'>
              <h3 className='text-[22px] ml-3 font-semibold md:ml-0 md:text-2xl'>Your Wallet</h3>

              <span className={'p-1 -mr-1 cursor-pointer rounded-full transition duration-300 hover:opacity-75'}>
                <InfoIcon />
              </span>
            </div>

            <div className='flex justify-between items-center py-4 px-5 cursor-pointer rounded-xl bg-white group text-black md:py-5 md:w-[332px]'>
              <span className='font-semibold underline transition duration-300 group-hover:opacity-40'>0x8fFcd8fD8A00525E5300709...</span>

              <span className='transition duration-300 group-hover:opacity-40'>
                <CopyIcon />
              </span>
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-4 md:mb-5'>
              <h3 className='text-[22px] ml-3 font-semibold md:ml-0 md:text-2xl'>API Key</h3>

              <span className='p-1 -mr-1 cursor-pointer rounded-full transition duration-300 hover:opacity-75'>
                <InfoIcon />
              </span>
            </div>

            <div className='flex justify-between items-center py-4 px-5 cursor-pointer rounded-xl bg-white text-black group md:py-5 md:w-[332px]'>
              <span className='font-semibold underline transition duration-300 group-hover:opacity-40'>25a7830a-0d09-4b48-8d1b-f7b...</span>

              <span className='transition duration-300 group-hover:opacity-40'>
                <CopyIcon />
              </span>
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-4 md:mb-5'>
              <h3 className='text-[22px] ml-3 font-semibold md:ml-0 md:text-2xl'>User Type</h3>

              <span className='p-1 -mr-1 cursor-pointer rounded-full transition duration-300 hover:opacity-75'>
                <InfoIcon />
              </span>
            </div>

            <div className='flex gap-1 items-center bg-[#fdf5e1] p-1 rounded-xl bg-gradient-to-r'>
              <button className='h-10 w-full cursor-pointer'>👌 Consumer</button>
              <button className='h-10 w-full cursor-pointer bg-white rounded-xl'>😎 Producer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
