import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.doll-bodies.$dollBodyId';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { Link, Outlet } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import type { DollBody } from '~/types';
import ReactMarkdown from 'react-markdown';
import DeleteModal from '~/components/ui/deleteModal';
import DollBodyDestroy from './doll-bodies.$dollBodyId.destroy';
import { formatDate } from '~/utils/date.utils';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Doll Body Details' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const dollBodyId = params.dollBodyId;
  const res = await fetchWithAuth(`doll-bodies/${dollBodyId}`);
  return await res.json();
}

export default function DollBodyId({ loaderData }: Route.ComponentProps) {
  const dollBody = loaderData as DollBody;

  const createdDate = formatDate(dollBody.createdAt);
  const updatedDate = formatDate(dollBody.updatedAt);

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={'/preferences/doll-bodies'} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <h3 className='text-body-md font-semibold text-base-black hover:underline transition-all duration-200'>
              Go back to <span className='text-neutral-01 text-body-lg'>Doll Bodies</span>
            </h3>
          </Link>
          <div className='md:flex hidden items-center gap-3'>
            <Link to={`/doll-bodies/${dollBody.id}/edit`}>
              <Button.Root variant='secondary' className='w-[130px]'>
                Edit
              </Button.Root>
            </Link>
            <DeleteModal
              title='Delete a Doll Body?'
              description='By deleting a doll body all related data will be deleted as well. You will not be able to restore the data.'
            >
              <DollBodyDestroy />
            </DeleteModal>
          </div>
          <div className='md:hidden flex text-base-black'>
            <Icons.more />
          </div>
        </div>

        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4 border-b border-neutral-03 pb-4'>
            <div className='flex items-center sm:gap-5 gap-1'>
              <div className='size-32'>
                <img
                  src={getPicture(dollBody, 'doll-bodies', false)}
                  srcSet={getPicture(dollBody, 'doll-bodies', true)}
                  alt={dollBody.name}
                  className='size-full object-cover rounded-lg'
                />
              </div>

              <div className='flex flex-1 items-center justify-between'>
                <div className='flex flex-col gap-1'>
                  <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black'>{dollBody.name}</h3>
                  <div className='flex items-center gap-2'>
                    <span className='text-body-sm text-gray-600'>Default Avatar:</span>
                    <span className='text-base-black font-medium'>{dollBody.avatar.name}</span>
                  </div>
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

            <div className='flex lg:hidden flex-col justify-between gap-3'>
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

          <div className='grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-4'>
            <div className='bg-gradient-1 backdrop-blur-48 rounded-xl p-4 max-h-max'>
              <h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2'>Description</h2>
              <div className='whitespace-pre-wrap rounded-lg'>
                <ReactMarkdown>{dollBody.description}</ReactMarkdown>
              </div>
            </div>

            <div className='bg-gradient-1 backdrop-blur-48 rounded-xl p-4'>
              <h2 className='text-lg font-semibold mb-4 text-gray-800 border-b pb-2'>Avatar Details</h2>

              <div className='flex flex-col gap-5'>
                <div className='flex gap-4 items-center'>
                  <div className='size-16 flex-shrink-0'>
                    <img
                      src={getPicture(dollBody.avatar, 'avatars', false)}
                      srcSet={getPicture(dollBody.avatar, 'avatars', true)}
                      alt={dollBody.avatar.name}
                      className='size-full object-cover rounded-full'
                    />
                  </div>
                  <div className='flex flex-col'>
                    <h3 className='font-semibold text-base-black'>{dollBody.avatar.name}</h3>
                    <p className='text-body-sm text-neutral-01'>{dollBody.avatar.shortDesc}</p>
                  </div>
                </div>

                <div className='flex flex-col gap-3'>
                  <span className='text-neutral-01'>Character:</span>
                  <div className='max-h-[250px] overflow-y-auto scrollbar-medium px-2 py-4 border rounded-xl border-neutral-03'>
                    <ReactMarkdown>{dollBody.avatar.character}</ReactMarkdown>
                  </div>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Role:</span>
                  <span className='font-medium'>{dollBody.avatar.role || 'N/A'}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Language:</span>
                  <span className='font-medium uppercase'>{dollBody.avatar.language || 'N/A'}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01'>Published:</span>
                  <span className='font-medium'>{dollBody.avatar.published ? 'Yes' : 'No'}</span>
                </div>

                <Link to={`/avatars/${dollBody.avatar.id}`} className='w-full'>
                  <Button.Root variant='secondary' className='w-full'>
                    View Avatar Details
                  </Button.Root>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
