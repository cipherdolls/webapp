import { useFetcher, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/_main._general.account';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { PermitButton } from '~/components/buttons/PermitButton';
import { USDC_TOKEN_ADDRESS, USDC_TOKEN_NAME, USDC_TOKEN_VERSION, SPENDER_ADDRESS } from '~/constants';

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
          tokenAddress={USDC_TOKEN_ADDRESS}
          tokenName={USDC_TOKEN_NAME}
          tokenVersion={USDC_TOKEN_VERSION}
          spender={SPENDER_ADDRESS}
          amount="1.5"
          onSigned={handlePermitSigned}
          isPending={fetcher.state === 'submitting'}
        />
    </div>
  );
}
