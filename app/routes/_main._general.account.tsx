import { useFetcher, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/_main._general.account';
import type { User } from '~/types';
import { Icons } from '~/components/ui/icons';
import AccountBalance from '~/components/account-balance';
import YourInfo from '~/components/yourInfo';
import UserType from '~/components/userType';
import AccountInfoCard from '~/components/account-info-card';
import YourWalletModal from '~/components/yourWalletModal';
import ApiKeyModal from '~/components/apiKeyModal';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { formatEther } from 'ethers';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Account' }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const userId = formData.get('userId');
  const jsonData: Record<string, any> = {};
  formData.forEach((value, key) => {
    jsonData[key] = value;
  });
  const res = await fetchWithAuth(`users/${userId}`, {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData),
  });
  return await res.json();
}

export default function Account({ loaderData }: Route.ComponentProps) {
  const me = useRouteLoaderData('routes/_main') as User;
  const { id, name, signerAddress, character, weiBalance, freeWeiBalance } = me;
  const fetcher = useFetcher();

  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between sm:py-3 py-2'>
          <h3 className='text-heading-h3'>Account</h3>
          <button className='sm:hidden block'>
            <Icons.signOut className='fill-base-black' />
          </button>
        </div>
        <div className='flex flex-col gap-1'>
          <AccountBalance balance={Number(formatEther(weiBalance)) === 0 ? '0.00' : String(Number(formatEther(weiBalance)).toFixed(5))} />
          <p className='text-body-sm text-base-black'>
            Free Wei Balance:{' '}
            <span className='text-neutral-01'>
              {Number(formatEther(freeWeiBalance)) === 0 ? '0.00' : String(Number(formatEther(freeWeiBalance)).toFixed(5))}
            </span>
          </p>
        </div>
      </div>
      <div className='flex sm:flex-row flex-col-reverse sm:gap-0 gap-8 sm:flex-1 sm:divide-x divide-neutral-04 pb-2.5'>
        <fetcher.Form method='PATCH' className='w-full'>
          <input name='userId' value={id} hidden readOnly />
          <input name='signerAddress' value={signerAddress} hidden readOnly />
          <YourInfo me={me} fetcher={fetcher} />
        </fetcher.Form>

        <div className='sm:pl-4 sm:max-w-[352px] w-full flex flex-col sm:gap-10 gap-8'>
          <AccountInfoCard
            label='Your Wallet'
            value={me.walletAddress}
            link={`https://optimistic.etherscan.io/address/${me.walletAddress}`}
            information={<YourWalletModal walletAddress={me.walletAddress} />}
          />
          <AccountInfoCard label='API Key' value={me.apikey} information={<ApiKeyModal apiKey={me.apikey} />} />
        </div>
      </div>
    </div>
  );
}
