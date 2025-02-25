import { redirect } from 'react-router';
import type { Route } from './+types/_main.account';
import { Icons } from '~/components/ui/icons';
import React, { useState } from 'react';
import WhoYouIcon from '~/assets/smile/who-you.png';
import { cn } from '~/utils/cn';
import { AdduserInfoModal, ApiKeyModal, UserTypeInfoModal, WalletInfoModal } from '~/components/account';
import { Notifications } from '~/components/notifications';

interface IModalProps {
  isCopied: boolean;
  setIsCopied: (copied: boolean) => void;
}

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
  const [isCopied, setIsCopied] = useState(false);

  console.log(loaderData);
  return (
    <>
      <Notifications />
      <div className='w-full overflow-x-hidden'>
        <div className='mt-6 mb-8 md:mb-14'>
          <h3 className='hidden mb-6 text-heading-h3 sm:block'>Dashboard</h3>

          <div className='flex justify-between items-center ml-3 mb-8'>
            <h3 className='text-heading-h3 sm:hidden'>Account</h3>

            <Icons.signOut className='text-base-black sm:hidden cursor-pointer transition-opacity hover:opacity-80' />
          </div>

          <UserBalance />
        </div>

        <div className='flex flex-col justify-between lg:flex-row'>
          <UserInfo />

          <div className='flex flex-col gap-10 lg:pl-5'>
            <CopyUserWallet isCopied={isCopied} setIsCopied={setIsCopied} />

            <CopyUserApiKey isCopied={isCopied} setIsCopied={setIsCopied} />

            <ChooseUserType isCopied={isCopied} setIsCopied={setIsCopied} />
          </div>
        </div>
      </div>
    </>
  );
}

const UserBalance = () => {
  return (
    <>
      <div className='flex items-center gap-4 ml-3 md:ml-0'>
        <Icons.ethereum className='w-10 lg:w-14' />

        <h1 className='text-4xl font-semibold md:text-heading-h1'>
          0.0012 <span className='text-neutral-01'>ETH</span>
        </h1>
      </div>
    </>
  );
};

const UserInfo = () => {
  return (
    <>
      <div className='w-full h-auto order-2 mt-10 border-neutral-04 lg:mt-0 lg:border-r lg:order-none lg:max-w-[608px] lg:pr-5'>
        <h3 className='text-[22px] font-semibold ml-3 mb-5 md:ml-0 md:text-heading-h3'>Your Info</h3>

        <div className='flex flex-col justify-center items-center rounded-xl bg-gradient-to-r from-[#FEFDF8]/55 to-[#FFFFFF]/70'>
          <AdduserInfoModal />

          <div className='flex w-full justify-center items-center pb-6 border-t border-neutral-04 pt-4 md:flex-col md:pb-20'>
            <img src={WhoYouIcon} alt={'Who You Icon'} className='w-10 mr-6 md:mb-2.5 md:mr-0 lg:w-16 ' />

            <div className='md:text-center'>
              <h4 className='text-[18px] font-semibold mb-2 text-base-black  md:text-heading-h3'>Who are You?</h4>

              <p className='text-neutral-01 text-body-md max-w-64 md:max-w-full'>Add some info to make conversations more personalized</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ChooseUserType: React.FC<IModalProps> = () => {
  const [activeButton, setActiveButton] = useState<'Consumer' | 'Producer'>('Consumer');

  return (
    <>
      <div>
        <div className='flex justify-between items-center mb-4 md:mb-5'>
          <h3 className='text-[22px] ml-3 font-semibold md:ml-0 md:text-heading-h3'>User Type</h3>

          <UserTypeInfoModal />
        </div>

        <div className='flex gap-1 text-sm font-semibold items-center bg-base-white/50 backdrop-blur-48 p-1 rounded-xl'>
          <button
            onClick={() => setActiveButton('Consumer')}
            className={cn(
              'h-10 w-full cursor-pointer rounded-[10px] transition transform duration-300',
              activeButton === 'Consumer' && 'bg-base-white'
            )}
          >
            👌 Consumer
          </button>

          <button
            onClick={() => setActiveButton('Producer')}
            className={cn(
              'h-10 w-full cursor-pointer rounded-[10px] transition transform duration-300',
              activeButton === 'Producer' && 'bg-base-white'
            )}
          >
            😎 Producer
          </button>
        </div>
      </div>
    </>
  );
};

const CopyUserWallet: React.FC<IModalProps> = ({ isCopied, setIsCopied }) => {
  return (
    <>
      <div>
        <div className='flex justify-between items-center mb-4 md:mb-5'>
          <h3 className='text-[22px] ml-3 font-semibold md:ml-0 md:text-2xl'>Your Wallet</h3>

          <WalletInfoModal isCopied={isCopied} setIsCopied={setIsCopied} />
        </div>

        <div className='flex justify-between items-center bg-base-white text-black py-4 px-5 cursor-pointer rounded-xl group md:py-5 lg:w-[332px]'>
          <span className='font-semibold truncate w-72 underline transition duration-300 group-hover:opacity-40'>
            0x8fFcd8fD8A00525E5300709...
          </span>

          <Icons.copy className='transition duration-300 group-hover:opacity-40' />
        </div>
      </div>
    </>
  );
};

const CopyUserApiKey: React.FC<IModalProps> = ({ isCopied, setIsCopied }) => {
  return (
    <>
      <div>
        <div className='flex justify-between items-center mb-4 md:mb-5'>
          <h3 className='text-[22px] ml-3 font-semibold md:ml-0 md:text-2xl'>API Key</h3>

          <ApiKeyModal isCopied={isCopied} setIsCopied={setIsCopied} />
        </div>

        <div className='flex justify-between items-center bg-base-white text-black py-4 px-5 cursor-pointer rounded-xl group md:py-5 lg:w-[332px]'>
          <span className='font-semibold truncate w-72 underline transition duration-300 group-hover:opacity-40'>
            25a7830a-0d09-4b48-8d1b-f7b...
          </span>

          <Icons.copy className='transition duration-300 group-hover:opacity-40' />
        </div>
      </div>
    </>
  );
};
