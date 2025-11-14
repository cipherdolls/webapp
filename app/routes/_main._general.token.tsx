import { useFetcher, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/_main._general.account';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { PermitButton } from '~/components/buttons/PermitButton';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'token' }];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const userId = formData.get('userId');
  const jsonData: Record<string, any> = {};
  formData.forEach((value, key) => {
    jsonData[key] = value;
  });
  const res = await fetchWithAuth('token-permits', {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData),
  });
  return await res.json();
}

export default function Account({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();

  const handlePermitSigned = async (permit: {
    owner: string;
    spender: string;
    value: string;
    nonce: string;
    deadline: number;
    v: number;
    r: string;
    s: string;
  }) => {
    fetcher.submit(
      {
        owner: permit.owner,
        spender: permit.spender,
        value: permit.value,
        nonce: permit.nonce,
        deadline: permit.deadline.toString(),
        v: permit.v.toString(),
        r: permit.r,
        s: permit.s,
      },
      {
        method: 'POST',
      }
    );
  };


  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
        <PermitButton
          tokenAddress="0x77469eeb563a6035b7b898f6a392284371918045"
          tokenName="cipherdolls"
          tokenVersion="1"
          spender="0x2A0a2744d4d96b43C2C273f1906AD89dFe2AD607"
          amount="1.5"
          onSigned={handlePermitSigned}
          isPending={fetcher.state === 'submitting'}
        />
    </div>
  );
}



// user wallet address is 0x7e6A07cce15Ad89553F7f6CBb96f08c77DA8921E
// LOV token address is 0x77469eeb563a6035b7b898f6a392284371918045
// Master/Spender Wallet is 0x2A0a2744d4d96b43C2C273f1906AD89dFe2AD607

