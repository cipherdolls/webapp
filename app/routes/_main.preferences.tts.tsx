import { redirect } from 'react-router';
import type { TtsProvider, TtsVoice } from '~/types';
import type { Route } from './+types/_main.preferences.tts';
import { DataCard } from '~/components/DataCard';
import Table from '~/components/Table';
import type { TTableColumn } from '~/components/Table';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'TTS Providers' }];
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
    const res = await fetch(`${backendUrl}/tts-providers`, headers);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}

export default function TtsProvidersIndex({ loaderData }: Route.ComponentProps) {
  const ttsProviders: TtsProvider[] = loaderData;

  const columnProperties: Array<TTableColumn<TtsVoice>> = [
    {
      id: 'name',
      label: 'Name',
      render: (data) => <span className='font-semibold'>{data.name}</span>,
      align: 'left',
    },
  ];

  return (
    <>
      {/* <div className=''>TtsProviders</div> */}
      <div className='space-y-10 pb-5'>
        {ttsProviders.map((ttsProvider) => (
          <DataCard.Root key={ttsProvider.id}>
            <DataCard.Label
              extra={
                <p className='text-body-sm text-base-black break-words'>
                  $/Character <span className='text-neutral-01'>-</span> <b className='font-semibold'>${ttsProvider.dollarPerCharacter}</b>
                </p>
              }
            >
              {ttsProvider.name}
            </DataCard.Label>
            <DataCard.Wrapper>
              <Table hideHeader={true} columns={columnProperties} data={ttsProvider.ttsVoices} />
            </DataCard.Wrapper>
          </DataCard.Root>
        ))}
      </div>
    </>
  );
}
