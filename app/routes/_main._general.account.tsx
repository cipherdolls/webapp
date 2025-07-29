import { useFetcher, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/_main._general.account';
import type { User } from '~/types';
import { Icons } from '~/components/ui/icons';
import YourInfo from '~/components/yourInfo';
import AccountInfoCard from '~/components/account-info-card';
import YourWalletModal from '~/components/yourWalletModal';
import ApiKeyModal from '~/components/apiKeyModal';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { formatEther } from 'ethers';
import SignOutModal from '~/components/signOutModal';
import { Tooltip } from '~/components/ui/tooltip';
import OP from '~/assets/svg/op-png.png';
import LogoSvg from '~/assets/svg/logo.svg';
import { useBalance } from '~/providers/BalanceContext';
import { useBalanceEvents } from '~/hooks/useBalanceEvents';

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

export default function Account({}: Route.ComponentProps) {
  const me = useRouteLoaderData('routes/_main') as User;
  const { id, signerAddress } = me;
  const fetcher = useFetcher();
  const { balance } = useBalance();
  
  // Listen for balance updates via MQTT
  useBalanceEvents({ userId: me.id });

  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between sm:py-3 py-2'>
          <h3 className='text-heading-h3'>Account</h3>
          <SignOutModal>
            <button className='sm:hidden block'>
              <Icons.signOut className='fill-base-black' />
            </button>
          </SignOutModal>
        </div>
        <div className='flex md:flex-row flex-col md:gap-8 gap-4'>
          <Tooltip
            trigger={
              <div className='flex items-center sm:gap-6 gap-4 '>
                <button className='sm:size-14 size-10 flex items-center justify-center bg-gradient-1 backdrop-blur-48 rounded-full relative shrink-0'>
                  <Icons.eth className='sm:w-auto sm:h-auto w-4 h-7' />
                  <div className='absolute -bottom-1 -right-1 size-6 rounded-full flex items-center justify-center'>
                    <img src={OP} alt='OP' />
                  </div>
                </button>
                <a
                  href={`https://optimistic.etherscan.io/address/${me.walletAddress}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:opacity-80 transition-opacity'
                >
                  <h2 className='text-heading-h2 sm:text-heading-h1 font-semibold break-all'>
                    {!balance.weiBalance || Number(formatEther(balance.weiBalance)) === 0 ? '0.00' : String(Number(formatEther(balance.weiBalance)).toFixed(5))}{' '}
                    <span className='text-neutral-01'>ETH</span>
                  </h2>
                </a>
              </div>
            }
            content='This is your CipherDolls wallet on the Optimism mainnet. We use this wallet to process payments. Please send ETH to this address to top up your account.'
            side='top'
            popoverClassName='px-2 py-1 text-xs max-w-48 whitespace-normal'
            className='px-2 py-1 text-xs max-w-48'
          />

          {(!balance.weiBalance || Number(formatEther(balance.weiBalance)) === 0) && balance.freeWeiBalance && Number(formatEther(balance.freeWeiBalance)) > 0 && (
            <Tooltip
              trigger={
                <div className='flex items-center sm:gap-6 gap-4 '>
                  <button className='sm:size-14 size-10 flex items-center justify-center bg-gradient-1 backdrop-blur-48 rounded-full relative shrink-0'>
                    <Icons.eth className='sm:w-auto sm:h-auto w-4 h-7' />
                    <div className='absolute -bottom-1 -right-1 size-6 rounded-full flex items-center justify-center bg-white p-0.5'>
                      <LogoSvg />
                    </div>
                  </button>
                  <h2 className='text-heading-h2 sm:text-heading-h1 font-semibold break-all'>
                    {!balance.freeWeiBalance || Number(formatEther(balance.freeWeiBalance)) === 0 ? '0.00' : String(Number(formatEther(balance.freeWeiBalance)).toFixed(5))}{' '}
                    <span className='text-neutral-01'>ETH</span>
                  </h2>
                </div>
              }
              content='This is your virtual offchain ETH balance that we provide to give users free credits to try CipherDolls. You receive monthly ETH allowances to spend. This balance cannot be withdrawn.'
              side='top'
              popoverClassName='px-2 py-1 text-xs max-w-48 whitespace-normal'
              className='px-2 py-1 text-xs max-w-48'
            />
          )}
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
          <AccountInfoCard className='justify-between' label='API Key' value={me.apikey} information={<ApiKeyModal apiKey={me.apikey} />} />
        </div>
      </div>
    </div>
  );
}
