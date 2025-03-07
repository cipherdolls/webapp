import { redirect, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/_main._general.account';
import type { User } from '~/types';
import { Icons } from '~/components/ui/icons';
import AccountBalance from '~/components/account-balance';
import YourInfo from '~/components/yourInfo';
import UserType from '~/components/userType';
import AccountInfoCard from '~/components/account-info-card';
import YourWalletModal from '~/components/yourWalletModal';
import ApiKeyModal from '~/components/apiKeyModal';
import { useState } from 'react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Account' }];
}

export default function Account({ loaderData }: Route.ComponentProps) {
  const me = useRouteLoaderData('routes/_main') as User;
  // TODO: Change here later
  const [userInfo, setUserInfo] = useState({
    name: '',
    publicName: '',
    character: me.character || '',
  });

  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between sm:py-3 py-2'>
          <h3 className='text-heading-h3'>Account</h3>
          <button className='sm:hidden block'>
            <Icons.signOut className='fill-base-black' />
          </button>
        </div>
        <AccountBalance balance={0.0012} />
      </div>
      <div className='flex sm:flex-row flex-col-reverse sm:gap-0 gap-8 sm:flex-1 sm:divide-x divide-neutral-04 pb-2.5'>
        <YourInfo info={[]} me={me} userInfo={userInfo} setUserInfo={setUserInfo} />
        <div className='sm:pl-4 sm:max-w-[352px] w-full flex flex-col sm:gap-10 gap-8'>
          <AccountInfoCard
            label='Your Wallet'
            value={me.walletAddress}
            underline
            information={<YourWalletModal walletAddress={me.walletAddress} />}
          />
          <AccountInfoCard label='API Key' value={me.apikey} information={<ApiKeyModal apiKey={me.apikey} />} />
          <UserType />
        </div>
      </div>
    </div>
  );
}
