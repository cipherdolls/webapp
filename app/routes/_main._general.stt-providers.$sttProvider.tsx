import { Link, Outlet } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { SttProvider } from '~/types';
import type { Route } from './+types/_main._general.stt-providers.$sttProvider';
import { getPicture } from '~/utils/getPicture';
import DeleteModal from '~/components/ui/deleteModal';
import SttProviderDestroy from './stt-providers.$sttProvider.destroy';
import { formatDate } from '~/utils/date.utils';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'STT Provider' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`stt-providers/${params.sttProvider}`);
  return await res.json();
}

export default function SttProviderId({ loaderData }: Route.ComponentProps) {
  const sttProvider: SttProvider = loaderData;

  const createdDate = formatDate(sttProvider.createdAt);
  const updatedDate = formatDate(sttProvider.updatedAt);

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={`/preferences/stt`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <h3 className='text-body-md font-semibold text-base-black hover:underline transition-all duration-200'>
              Go back to <span className='text-neutral-01 text-body-lg'>STT Providers</span>
            </h3>
          </Link>
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
          {/* TODO: How is this gonna work? */}
          <div className='md:hidden flex text-base-black'>
            <Icons.more />
          </div>
        </div>
        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center sm:gap-5 gap-1'>
              <div className='size-32'>
                <img
                  src={getPicture(sttProvider, 'stt-providers', false)}
                  srcSet={getPicture(sttProvider, 'stt-providers', true)}
                  alt={sttProvider.name}
                  className='size-full object-cover rounded-lg'
                />
              </div>
              <div className='flex flex-1 items-center justify-between'>
                <div className='flex flex-col gap-1'>
                  <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black'>{sttProvider.name}</h3>
                  <p className='text-neutral-01'>{sttProvider.name}</p>
                </div>
                <div className='lg:flex hidden flex-col justify-between gap-6'>
                  <div className='flex flex-col gap-1'>
                    <p className='text-body-sm text-neutral-01'>
                      Created at: <span className='text-body-md text-base-black/80 font-medium'>{createdDate}</span>
                    </p>
                    <p className='text-body-sm text-neutral-01'>
                      Updated at: <span className='text-body-md text-base-black/80 font-medium'>{updatedDate}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-4 mt-3'>
              <div className='flex items-center gap-1'>
                <label className='text-body-sm font-semibold text-neutral-01' htmlFor='recommended'>
                  Recommended:
                </label>
                {sttProvider.recommended ? (
                  <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 bg-base-black outline-none focus:shadow-neutral-02'>
                    <Icons.check className='text-white size-4.5' />
                  </div>
                ) : (
                  <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-specials-danger bg-specials-danger outline-none focus:shadow-specials-danger'>
                    <Icons.close className='text-white size-4.5' />
                  </div>
                )}
              </div>
              <p className='text-body-sm text-neutral-01'>
                Dollar per second: <span className='text-body-md text-base-black/80 font-medium'>${sttProvider.dollarPerSecond * 60}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
