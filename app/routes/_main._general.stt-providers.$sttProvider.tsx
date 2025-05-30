import { Link, Outlet, useRouteLoaderData } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { SttProvider, User } from '~/types';
import type { Route } from './+types/_main._general.stt-providers.$sttProvider';
import { getPicture } from '~/utils/getPicture';
import DeleteModal from '~/components/ui/deleteModal';
import SttProviderDestroy from './stt-providers.$sttProvider.destroy';
import { formatDate } from '~/utils/date.utils';
import { ViewMore } from '~/view-more';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'STT Provider' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`stt-providers/${params.sttProvider}`);
  return await res.json();
}

export default function SttProviderId({ loaderData }: Route.ComponentProps) {
  const sttProvider: SttProvider = loaderData;
  const me = useRouteLoaderData('routes/_main') as User;

  const createdDate = formatDate(sttProvider.createdAt);
  const updatedDate = formatDate(sttProvider.updatedAt);

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={`/services/stt`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <div className='flex items-center gap-3'>
              <h3 className='text-heading-h3 font-semibold text-base-black hover:underline transition-all duration-200'>
                {sttProvider.name}
              </h3>
              <span className='text-neutral-01 text-body-lg'>•</span>
              <span className='text-neutral-01 text-body-lg'>STT</span>
            </div>
          </Link>
          {me.role === 'ADMIN' && (
            <div className='md:flex hidden items-center gap-3'>
              <Link to={`/stt-providers/${sttProvider.id}/edit`}>
                <Button.Root variant='secondary' className='w-[130px]'>
                  Edit
                </Button.Root>
              </Link>
              <DeleteModal
                title='Delete an STT Provider?'
                description='By deleting an STT provider all related data will be deleted as well. You will not be able to restore the data.'
              >
                <SttProviderDestroy />
              </DeleteModal>
            </div>
          )}

          <div className='md:hidden flex text-base-black'>
            {me.role === 'ADMIN' && (
              <ViewMore
                popoverItems={[
                  {
                    type: 'link',
                    text: 'Edit',
                    href: `/stt-providers/${sttProvider.id}/edit`,
                  },
                  {
                    type: 'component',
                    text: 'Delete',
                    isDelete: true,
                    component: (
                      <DeleteModal
                        title='Delete an STT Provider?'
                        description='By deleting an STT provider all related data will be deleted as well. You will not be able to restore the data.'
                        dropdown
                      >
                        <SttProviderDestroy />
                      </DeleteModal>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </div>
        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4 p-5 bg-gradient-1 rounded-xl'>
              <div className='flex sm:gap-5 md:gap-10 gap-5 justify-center items-center md:items-end md:justify-between md:flex-row flex-col'>
                <div className='flex items-center gap-5'>
                  <div className='size-[72px]'>
                    <img
                      src={getPicture(sttProvider, 'stt-providers', false)}
                      srcSet={getPicture(sttProvider, 'stt-providers', true)}
                      alt={sttProvider.name}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <h4 className='text-body-sm font-semibold sm:text-heading-h4 text-base-black'>{sttProvider.name}</h4>
                    <div className='flex items-center gap-1'>
                      {sttProvider.recommended && (
                        <div className='flex items-center gap-1'>
                          <Icons.thumb className='size-4' />
                          <span className='text-neutral-01 text-body-sm'>Recommended</span>
                        </div>
                      )}
                    </div>
                    <p className='text-body-sm text-base-black'>A fast service, great for simple transcriptions</p>
                  </div>
                </div>
                <div className='flex flex-1 justify-end items-end h-full'>
                  <div className='flex flex-col gap-2'>
                    <p className='md:text-right text-body-sm text-neutral-01 text-center'></p>
                    <p className='text-body-sm text-neutral-01 md:text-right text-center'>
                      Created at: <span className='text-base-black font-semibold'>{createdDate}</span>
                    </p>
                    <p className='text-body-sm text-neutral-01 md:text-right text-center'>
                      Updated at: <span className='text-base-black font-semibold'>{updatedDate}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-white shadow-regular rounded-xl px-5 py-[18px] max-h-max relative'>
              <h2 className='text-body-md font-semibold mb-4 text-gray-800'>Provider Properties</h2>
              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-neutral-01 text-body-sm'>Dollar Per Second</span>
                  <span className='text-body-sm font-semibold'>${sttProvider.dollarPerSecond * 60}</span>
                </div>
              </div>
              <span className='text-xs text-neutral-01 font-semibold flex items-center justify-end mt-3'>Prices are per million token</span>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
