import { Link, redirect } from 'react-router';
import { Icons } from '~/components/ui/icons';
import { getPicture } from '~/utils/getPicture';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { AiProvider, User } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.($aiProviderId).edit';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Ai Providers' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const aiProviderId = params.aiProviderId;
  const res = await fetchWithAuth(`ai-providers/${aiProviderId}`);
  return await res.json();
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const aiProviderId = formData.get('aiProviderId');

    const res = await fetchWithAuth(`aiProviders/${aiProviderId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      return await res.json();
    }

    const aiProvider: AiProvider = await res.json();
    return redirect(`/ai-providers/${aiProvider.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function aiProviderShow({ loaderData }: Route.ComponentProps) {
  const aiProvider: AiProvider = loaderData;

  return (
    <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
      <div className='flex items-center justify-between sm:px-0 px-4.5'>
        <Link to={'/preferences/ai'} className='flex items-center gap-3 sm:gap-4'>
          <Icons.chevronLeft />
          <div className='flex sm:items-center sm:flex-row flex-col sm:gap-3 gap-1'>
            <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black'>{aiProvider.name}</h3>
            <span className='text-neutral-01 text-body-lg sm:block hidden'>•</span>
          </div>
        </Link>
        <div className='md:flex hidden items-center gap-3'>
          <>
            <Link to={`/ai-providers/${aiProvider.id}/edit`}>
              <Button.Root variant='secondary' className='w-[130px]'>
                Edit
              </Button.Root>
            </Link>
          </>
        </div>
        {/* TODO: How is this gonna work? */}
        <div className='md:hidden flex'>
          <Icons.more />
        </div>
      </div>
      <div className='flex sm:flex-row flex-col-reverse md:gap-0 sm:gap-8 sm:flex-1 sm:divide-x divide-neutral-04 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 sm:backdrop-blur-none sm:bg-none sm:rounded-none rounded-xl pb-2.5'>
        <div className='sm:pr-4 flex size-full'>
          <div className='sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-xl p-5 flex flex-col gap-5 flex-1 h-max text-body-md text-base-black'>
            <div className='flex items-center justify-between'>
              <h3 className='text-heading-h4 sm:text-heading-h3 text-base-black'>Characteristic</h3>
            </div>
          </div>
        </div>
        <div className='sm:pl-4 sm:max-w-[352px] flex size-full flex-col gap-10'>
          <div className='relative'>
            <label className='sm:h-60 h-[263px] w-full bg-none sm:bg-transparent bg-neutral-04 sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'>
              {aiProvider.picture ? (
                <div className='size-full'>
                  <img
                    src={getPicture(aiProvider, 'aiProviders', false)}
                    srcSet={getPicture(aiProvider, 'aiProviders', true)}
                    alt={aiProvider.name}
                    className='size-full object-cover rounded-lg'
                  />
                </div>
              ) : (
                <div className='flex items-center justify-center size-full'>
                  <Icons.fileUploadIcon />
                </div>
              )}
            </label>
          </div>
          <div className='sm:flex hidden flex-col gap-5'>
            <h1 className='text-base-black text-heading-h3 font-semibold'>Creator</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
