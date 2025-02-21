import { redirect } from 'react-router';
import type { Route } from './+types/_main.account';
import InfoIcon from '~/assets/svg/info.svg';
import CopyIcon from '~/assets/svg/copy.svg';
import EthIcon from '~/assets/svg/ethereum.svg';
import PlusIcon from '~/assets/svg/plus.svg';
import WhoYouIcon from '~/assets/smile/who-you.png';

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

        <div className='flex gap-3 items-center'>
          <EthIcon />

          <h1 className='text-[64px] leading-[71.68px] ml-6'>
            0.0012 <span className='text-[#0000008F]'>ETH</span>
          </h1>
        </div>
      </div>

      <div className='flex justify-between'>
        <div className='w-full max-w-2xl pr-5 border-r border-black/5'>
          <h3 className='font-semibold text-2xl mb-3 '>Your Info</h3>

          <div className='flex flex-col items-center rounded-[12px] bg-gradient-to-r from-[#FEFDF8]/55 to-[#FFFFFF]/70'>
            <button className='inline-flex justify-center items-center gap-2.5 cursor-pointer my-5'>
              <PlusIcon /> <span className='text-sm font-semibold'>Add Your Info</span>
            </button>

            <div className='flex flex-col w-full justify-center items-center pb-20 border-t border-black/5 pt-4'>
              <img src={WhoYouIcon} alt={WhoYouIcon + '-icon'} className='max-w-16 mb-2.5' />

              <h4 className='text-[22px] font-semibold mb-1'>Who are You?</h4>

              <p className='text-[#0000008F] font-normal'>Add some info to make conversations more personalized</p>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-10 pl-5'>
          <div>
            <div className='flex justify-between items-center mb-5'>
              <h3 className='text-2xl font-semibold'>Your Wallet</h3>

              <span className={'p-1 -mr-1 cursor-pointer rounded-full transition duration-300 hover:opacity-75'}>
                <InfoIcon />
              </span>
            </div>

            <div className='flex justify-between items-center w-[332px] cursor-pointer rounded-xl bg-white px-5 py-5 group text-black'>
              <span className='font-semibold underline transition duration-300 group-hover:opacity-40'>0x8fFcd8fD8A00525E5300709...</span>

              <span className='transition duration-300 group-hover:opacity-40'>
                <CopyIcon />
              </span>
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-5'>
              <h3 className='text-2xl font-semibold'>API Key</h3>

              <span className='p-1 -mr-1 cursor-pointer rounded-full transition duration-300 hover:opacity-75'>
                <InfoIcon />
              </span>
            </div>

            <div className='flex justify-between items-center w-[332px] cursor-pointer rounded-xl bg-white px-5 py-5 text-black group'>
              <span className='font-semibold underline transition duration-300 group-hover:opacity-40'>25a7830a-0d09-4b48-8d1b-f7b...</span>

              <span className='transition duration-300 group-hover:opacity-40'>
                <CopyIcon />
              </span>
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-5'>
              <h3 className='text-2xl font-semibold'>User Type</h3>

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
