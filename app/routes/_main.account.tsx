import React, { useState } from 'react';
import { cn } from '~/utils/cn';
import type { Route } from './+types/_main.account';
import { Form, redirect, useSubmit } from 'react-router';
import { Notifications } from '~/components/notifications';
import { Icons } from '~/components/ui/icons';
import { SignOutModal } from '~/components/signOutModal';
import * as Dialog from '@radix-ui/react-dialog';
import WhoYouIcon from '~/assets/smile/who-you.png';
import UserTypeIcon from '~/assets/smile/user-type.png';
import WalletIcon from '~/assets/smile/wallet.png';
import ApiKeyIcon from '~/assets/smile/api-key.png';

export type IUserData = {
  name: string;
  nickname: string;
  describe: string;
};

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
  const [userType, setUserType] = useState<'Consumer' | 'Producer'>('Consumer');
  const [userData, setUserData] = useState<IUserData | null>(null);

  console.log(loaderData);
  return (
    <>
      <SignOutModal />
      <Notifications variant={'YourInfoSaved'} />

      <div className='w-full overflow-x-hidden'>
        <div className='mt-6 mb-8 md:mb-14'>
          <h3 className='hidden mb-6 text-heading-h3 sm:block'>Dashboard</h3>

          <div className='flex justify-between items-center ml-3 mb-8'>
            <h3 className='text-heading-h3 sm:hidden'>Account</h3>

            <Icons.signOut className='text-base-black sm:hidden cursor-pointer transition-opacity hover:opacity-80' />
          </div>

          <div className='flex items-center gap-4 ml-3 md:ml-0'>
            <Icons.ethereum className='w-10 lg:w-14' />

            <h1 className='text-4xl font-semibold md:text-heading-h1'>
              0.0012 <span className='text-neutral-01'>ETH</span>
            </h1>
          </div>
        </div>

        <div className='flex flex-col justify-between lg:flex-row'>
          <UserInfo userData={userData} setUserData={setUserData} />

          <div className='flex flex-col gap-10 lg:pl-5'>
            <CopyUserWallet isCopied={isCopied} setIsCopied={setIsCopied} />

            <CopyUserApiKey isCopied={isCopied} setIsCopied={setIsCopied} />

            <ChooseUserType userType={userType} setUserType={setUserType} />
          </div>
        </div>
      </div>
    </>
  );
}

//User Info
interface IUserInfo {
  userData: IUserData | null;
  setUserData: (data: IUserData) => void;
}

interface IUserInfoModal {
  userData: IUserData | null;
  setUserData: (data: IUserData) => void;
}

const UserInfo: React.FC<IUserInfo> = ({ userData, setUserData }) => {
  return (
    <>
      <div className='w-full h-auto order-2 mt-10 border-neutral-04 lg:mt-0 lg:border-r lg:order-none lg:max-w-[608px] lg:pr-5'>
        <h3 className='text-[22px] font-semibold ml-3 mb-5 md:ml-0 md:text-heading-h3'>Your Info</h3>

        <div className='flex flex-col justify-center items-center rounded-xl bg-gradient-to-r from-[#FEFDF8]/55 to-[#FFFFFF]/70'>
          <AdduserInfoModal userData={userData} setUserData={setUserData} />

          {userData !== null ? (
            <div className='w-full h-fit overflow-x-hidden sm:h-[120px] p-5 bg-base-white rounded-xl'>
              <div className='flex justify-between items-center mb-4'>
                <h4 className='text-heading-h4'>{userData.name}</h4>

                <p className='flex gap-1 items-center'>
                  👥️<span className='text-neutral-01 text-body-sm'>{userData.nickname}</span>
                </p>
              </div>

              <p className='text-body-md'>{userData.describe}</p>
            </div>
          ) : (
            <div className='flex w-full justify-center items-center pb-6 border-t border-neutral-04 pt-4 md:flex-col md:pb-20'>
              <img src={WhoYouIcon} alt={'Who You Icon'} className='w-10 mr-6 md:mb-2.5 md:mr-0 lg:w-16 ' />

              <div className='md:text-center'>
                <h4 className='text-[18px] font-semibold mb-2 text-base-black  md:text-heading-h3'>Who are You?</h4>

                <p className='text-neutral-01 text-body-md max-w-64 md:max-w-full'>Add some info to make conversations more personalized</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const AdduserInfoModal: React.FC<IUserInfoModal> = ({ userData, setUserData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const submit = useSubmit();

  const handleInput = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const formData = new FormData(form);

    const isEmpty = [...formData.values()].some((value) => !value);
    setIsDisabled(isEmpty);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    setUserData(data as any);
    setIsOpen(false);

    console.log('Form Data:', data);
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          {userData === null ? (
            <button className='inline-flex justify-center items-center gap-2.5 cursor-pointer my-4 transition duration-300 hover:opacity-50'>
              <Icons.plus /> <span className='text-sm font-semibold'>Add Your Info</span>
            </button>
          ) : (
            <button className='inline-flex justify-center items-center gap-2.5 cursor-pointer my-4 transition duration-300 hover:opacity-50'>
              <Icons.pencil /> <span className='text-sm font-semibold'>Edit Your Info</span>
            </button>
          )}
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='z-10 fixed inset-0 overflow-y-scroll bg-neutral-02 pointer-events-none' />

          <Dialog.Content className='bg-base-white backdrop-blur-lg absolute z-50 flex flex-col justify-between max-h-[552px] items-center shadow-bottom p-6 pt-8 bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-t-xl focus:outline-none sm:max-h-[562px] sm:rounded-xl sm:top-1/2 sm:-translate-y-1/2 sm:p-8 sm:max-w-[480px]'>
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />

            <Dialog.Title className='text-heading-h3 mt-1 mb-3 sm:mt-0 sm:mb-2 md:text-heading-h2'>
              {userData === null ? 'Add Your Info' : 'Edit Your Info'}
            </Dialog.Title>

            <Form onInput={handleInput} onSubmit={handleSubmit} className='flex flex-col gap-5 w-full'>
              <div className='flex gap-3 flex-col'>
                <label className='text-neutral-01 text-sm font-semibold'>Name</label>

                <input
                  name='name'
                  type='text'
                  placeholder='Add a name'
                  defaultValue={userData?.name}
                  className='h-12 px-3 font-normal text-body-md bg-neutral-05 text-base-black rounded-xl focus:outline-1 outline-neutral-03'
                />
              </div>

              <div className='flex gap-3 flex-col'>
                <label className='text-neutral-01 text-sm font-semibold'>Public Name</label>

                <input
                  name='nickname'
                  type='text'
                  required
                  placeholder='Add public name'
                  defaultValue={userData?.nickname}
                  className='h-12 px-3 font-normal text-body-md bg-neutral-05 text-base-black rounded-xl focus:outline-1 outline-neutral-03'
                />

                <p className='text-sm font-normal -mt-1'>Your public name will be used on the pages of avatars you create and publish</p>
              </div>

              <div className='flex gap-3 flex-col'>
                <label className='text-neutral-01 text-sm font-semibold'>Character</label>

                <textarea
                  required
                  name='describe'
                  placeholder='Describe yourself'
                  defaultValue={userData?.describe}
                  className='p-3 text-body-md font-normal max-h-26 h-26 bg-neutral-05 text-base-black rounded-xl focus:outline-1 outline-neutral-03'
                />
              </div>

              <div className='w-full flex justify-center items-center gap-3 border-t border-neutral-04 rounded-xl mt-2 sm:border-t-0'>
                <Dialog.Close asChild className={'hidden sm:block'}>
                  <button className='w-full text-[16px] font-semibold h-12 text-base-black bg-neutral-04 rounded-full md:max-w-[202px] transition duration-200 hover:bg-neutral-05'>
                    Cancel
                  </button>
                </Dialog.Close>

                <button
                  type={'submit'}
                  disabled={isDisabled}
                  className='w-full text-[16px] font-semibold h-12 text-base-white bg-base-black rounded-full md:max-w-[202px] transition duration-200 hover:text-base-white/80 disabled:bg-neutral-04 disabled:text-neutral-03 disabled:cursor-not-allowed'
                >
                  Save
                </button>
              </div>
            </Form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
//

// Choose User Type
interface IChooseUserType {
  userType: 'Consumer' | 'Producer';
  setUserType: (value: 'Consumer' | 'Producer') => void;
}

const ChooseUserType: React.FC<IChooseUserType> = ({ userType, setUserType }) => {
  return (
    <>
      <div>
        <div className='flex justify-between items-center mb-4 md:mb-5'>
          <h3 className='text-[22px] ml-3 font-semibold md:ml-0 md:text-heading-h3'>User Type</h3>

          <UserTypeInfoModal />
        </div>

        <div className='flex gap-1 text-sm font-semibold items-center bg-base-white/50 backdrop-blur-48 p-1 rounded-xl'>
          <button
            onClick={() => setUserType('Consumer')}
            className={cn(
              'h-10 w-full cursor-pointer rounded-[10px] transition transform duration-300',
              userType === 'Consumer' && 'bg-base-white'
            )}
          >
            👌 Consumer
          </button>

          <button
            onClick={() => setUserType('Producer')}
            className={cn(
              'h-10 w-full cursor-pointer rounded-[10px] transition transform duration-300',
              userType === 'Producer' && 'bg-base-white'
            )}
          >
            😎 Producer
          </button>
        </div>
      </div>
    </>
  );
};

const UserTypeInfoModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Icons.info className='cursor-pointer rounded-full transition duration-300 hover:opacity-75' />
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='z-10 fixed inset-0 overflow-y-scroll bg-neutral-02 pointer-events-none' />

          <Dialog.Content className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(247,240,223)_100%)] backdrop-blur-lg absolute z-50 flex flex-col justify-between items-center focus:outline-none shadow-bottom p-6 pt-8 bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-t-xl max-h-[332px] sm:rounded-xl sm:max-h-[322px] sm:top-1/2 sm:-translate-y-1/2 sm:p-8 sm:max-w-[480px] '>
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />
            <Dialog.Close asChild>
              <div className='absolute -right-14 top-0 p-2 backdrop-blur-sm cursor-pointer bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-full'>
                <Icons.close />
              </div>
            </Dialog.Close>
            <img src={UserTypeIcon} alt={'User Type Icon'} className='mb-6 w-10 sm:w-16' />

            <Dialog.Title className='text-heading-h3 mb-2 font-semibold md:text-heading-h2'>User Type</Dialog.Title>

            <Dialog.Description className='inline-flex flex-col gap-5 text-body-md mb-5 font-normal text-center max-w-[384px] sm:mb-10 sm:text-body-lg'>
              <p>👌 Consumer - is all you need to chat with avatar and dolls.</p>

              <p>😎 Producer - create your own avatars, public it, see system preferences.</p>
            </Dialog.Description>

            <Dialog.Close asChild className='sm:hidden'>
              <button className='w-full text-[16px] font-semibold h-12 text-base-black bg-neutral-04 rounded-full max-w-[339px] transition duration-200 hover:bg-neutral-05 focus:outline-none'>
                Got It
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
//

// Copy User Wallet
interface ICopyUserWallet {
  isCopied: boolean;
  setIsCopied: (copied: boolean) => void;
}

interface ICopyUserWalletModal {
  isCopied: boolean;
  setIsCopied: (copied: boolean) => void;
  className?: string;
}

const CopyUserWallet: React.FC<ICopyUserWallet> = ({ isCopied, setIsCopied }) => {
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

const WalletInfoModal: React.FC<ICopyUserWalletModal> = ({ isCopied, setIsCopied }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickCopied = () => {
    setIsCopied(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsCopied(false);
    }, 900);
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Icons.info className='cursor-pointer rounded-full transition duration-300 hover:opacity-75' />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className='z-10 fixed inset-0 overflow-y-scroll bg-neutral-02 pointer-events-none' />

          <Dialog.Content className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(247,240,223)_100%)] backdrop-blur-lg absolute z-50 flex flex-col justify-between items-center focus:outline-none shadow-bottom p-6 pt-8 bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-t-xl max-h-[310px] sm:rounded-xl sm:max-h-[362px] sm:top-1/2 sm:-translate-y-1/2 sm:p-8 sm:max-w-[480px] '>
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />

            <img src={WalletIcon} alt={'Who You Icon'} className='mb-6 w-10 sm:w-16' />

            <Dialog.Title className='text-heading-h3 mb-2 font-semibold md:text-heading-h2'>Your Wallet</Dialog.Title>

            <Dialog.Description className='text-body-md mb-5 font-normal text-center max-w-[384px] sm:mb-10 sm:text-body-lg'>
              Send Ether to this address - <br />
              <span className='font-semibold underline'>0x8fFcd8fD8A00525E53007095f91743A89...</span> <br />
              to top up your account.
            </Dialog.Description>

            <div className='w-full flex justify-center mb-2 gap-2 lg:gap-3'>
              <Dialog.Close asChild>
                <button className='w-full text-[16px] font-semibold h-12 text-base-black bg-neutral-04 rounded-full max-w-[186px] transition duration-200 hover:bg-neutral-05 focus:outline-none'>
                  Got It
                </button>
              </Dialog.Close>

              <button
                onClick={handleClickCopied}
                className={cn(
                  'flex items-center justify-center gap-1 w-full text-[16px] font-semibold h-12 text-base-white bg-base-black rounded-full max-w-[186px] transition duration-200 focus:outline-none',
                  isCopied && 'bg-base-black/0'
                )}
              >
                {isCopied ? (
                  <>
                    <Icons.copied /> <span className='text-base-black'>Copied</span>
                  </>
                ) : (
                  <span className='text-base-white'>Copy Address</span>
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
//

// Copy User Api Key
interface ICopyUserApiKey {
  isCopied: boolean;
  setIsCopied: (copied: boolean) => void;
}

interface ICopyUserApiKeyModal {
  isCopied: boolean;
  setIsCopied: (copied: boolean) => void;
  className?: string;
}

const CopyUserApiKey: React.FC<ICopyUserApiKey> = ({ isCopied, setIsCopied }) => {
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

const ApiKeyModal: React.FC<ICopyUserApiKeyModal> = ({ isCopied, setIsCopied }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickCopied = () => {
    setIsCopied(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsCopied(false);
    }, 900);
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Icons.info className='cursor-pointer rounded-full transition duration-300 hover:opacity-75' />
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='z-10 fixed inset-0 overflow-y-scroll bg-neutral-02 pointer-events-none' />

          <Dialog.Content className='bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(247,240,223)_100%)] backdrop-blur-lg absolute z-50 flex flex-col justify-between items-center focus:outline-none shadow-bottom p-6 pt-8 bottom-0 -translate-x-1/2 left-1/2 w-full h-full rounded-t-xl max-h-[310px] sm:rounded-xl sm:max-h-[362px] sm:top-1/2 sm:-translate-y-1/2 sm:p-8 sm:max-w-[480px] '>
            <div className='absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-03 rounded-full w-16 h-1 sm:hidden' />

            <img src={ApiKeyIcon} alt={'Api Key Icon'} className='mb-6 w-10 sm:w-16' />

            <Dialog.Title className='text-heading-h3 mb-2 font-semibold md:text-heading-h2'>API Key</Dialog.Title>

            <Dialog.Description className='text-body-md mb-5 font-normal text-center max-w-[384px] sm:mb-10 sm:text-body-lg'>
              Use the API Key - <br />
              <span className='font-semibold underline'>25a7830a-0d09-4b48-8d1b-f7b39e2ca75e...</span> <br />
              to connect a doll.
            </Dialog.Description>

            <div className='w-full flex justify-center mb-2 gap-2 lg:gap-3'>
              <Dialog.Close asChild>
                <button className='w-full text-[16px] font-semibold h-12 text-base-black bg-neutral-04 rounded-full max-w-[186px] transition duration-200 hover:bg-neutral-05 focus:outline-none'>
                  Got It
                </button>
              </Dialog.Close>

              <button
                onClick={handleClickCopied}
                className={cn(
                  'flex items-center justify-center gap-1 w-full text-[16px] font-semibold h-12 text-base-white bg-base-black rounded-full max-w-[186px] transition duration-200 focus:outline-none',
                  isCopied && 'bg-base-black/0'
                )}
              >
                {isCopied ? (
                  <>
                    <Icons.copied /> <span className='text-base-black'>Copied</span>
                  </>
                ) : (
                  <span className='text-base-white'>Copy Address</span>
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
//
