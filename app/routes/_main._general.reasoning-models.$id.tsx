import { Link, Outlet, useRouteLoaderData } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { ChatModel, User } from '~/types';
import type { Route } from './+types/_main._general.reasoning-models.$id';
import { getPicture } from '~/utils/getPicture';
import DeleteModal from '~/components/ui/deleteModal';
import ReasoningModelDestroy from './reasoning-models.$id.destroy';
import { formatDate } from '~/utils/date.utils';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { formatModelName } from '~/utils/formatModelName';
import { ViewMore } from '~/view-more';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Reasoning Model' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`reasoning-models/${params.id}`);
  return await res.json();
}

export default function ReasoningModelShow({ loaderData }: Route.ComponentProps) {
  const reasoningModel: ChatModel = loaderData;
  const me = useRouteLoaderData('routes/_main') as User;

  const createdDate = formatDate(reasoningModel.createdAt);
  const updatedDate = formatDate(reasoningModel.updatedAt);

  const formatResponseTime = (time: number | null | undefined) => {
    if (!time && time !== 0) return 'N/A';
    return `${time} ms`;
  };

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={`/services/ai`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <div className='flex items-center gap-3'>
              <h3 className='font-semibold text-base-black hover:underline transition-all duration-200 sm:text-heading-h3'>
                {formatModelName(reasoningModel.providerModelName)}
              </h3>
              <span className='text-body-md text-neutral-01 word sm:text-body-lg'>•</span>
              <span className='text-body-md text-neutral-01 sm:text-body-lg'>AI</span>
            </div>
          </Link>
          {me.role === 'ADMIN' && (
            <div className='md:flex hidden items-center gap-3'>
              <Link to={`/reasoning-models/${reasoningModel.id}/edit`}>
                <Button.Root variant='secondary' className='w-[130px]'>
                  Edit
                </Button.Root>
              </Link>
              <DeleteModal
                title={`Delete reasoning model ${formatModelName(reasoningModel.providerModelName)}?`}
                description='By deleting a reasoning model the associated data will be deleted as well. You will not be able to restore the data'
              >
                <ReasoningModelDestroy />
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
                    href: `/reasoning-models/${reasoningModel.id}/edit`,
                  },
                  {
                    type: 'component',
                    text: 'Delete',
                    isDelete: true,
                    component: (
                      <DeleteModal
                        title={`Delete reasoning model ${formatModelName(reasoningModel.providerModelName)}?`}
                        description='By deleting a reasoning model the associated data will be deleted as well. You will not be able to restore the data'
                        dropdown
                      >
                        <ReasoningModelDestroy />
                      </DeleteModal>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </div>
        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4 p-5 bg-gradient-1 rounded-xl'>
            <div className='flex flex-col gap-5 justify-center sm:gap-5 md:gap-10 items-center md:justify-between md:flex-row'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5'>
                <div className='flex items-center gap-3 sm:gap-5'>
                  <div className='size-6 sm:size-[72px]'>
                    <img
                      src={getPicture(reasoningModel.aiProvider, 'ai-providers', false)}
                      srcSet={getPicture(reasoningModel.aiProvider, 'ai-providers', true)}
                      alt={reasoningModel.providerModelName}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>

                  <h4 className='text-body-md font-semibold text-base-black sm:text-heading-h4 sm:hidden'>
                    {reasoningModel.providerModelName}
                  </h4>
                </div>
                <div className='flex flex-col gap-2'>
                  <h4 className='hidden text-body-md font-semibold text-base-black sm:text-heading-h4 sm:block'>
                    {reasoningModel.providerModelName}
                  </h4>
                  <div className='flex items-center gap-1'>
                    {reasoningModel.recommended && (
                      <div className='flex items-center gap-1'>
                        <Icons.thumb className='size-4' />
                        <span className='text-neutral-01 text-body-sm'>Recommended</span>
                      </div>
                    )}
                  </div>
                  <p className='text-body-sm text-base-black'>Advanced reasoning capabilities</p>
                </div>
              </div>

              <div className='border-neutral-04 border w-full md:hidden' />

              <div className='flex flex-1 justify-end w-full h-full md:items-end'>
                <div className='flex flex-col flex-1 gap-2'>
                  <p className='flex gap-1 justify-between text-body-sm text-neutral-01 md:justify-end md:text-right'>
                    Provider: <span className='text-base-black font-semibold'>{reasoningModel.aiProvider?.name}</span>
                  </p>
                  <p className='flex gap-1 justify-between text-body-sm text-neutral-01 md:justify-end md:text-right'>
                    Created at: <span className='text-base-black font-semibold'>{createdDate}</span>
                  </p>
                  <p className='flex gap-1 justify-between text-body-sm text-neutral-01 md:justify-end md:text-right'>
                    Updated at: <span className='text-base-black font-semibold'>{updatedDate}</span>
                  </p>
                  <p className='flex gap-1 justify-between text-body-sm text-neutral-01 md:justify-end md:text-right'>
                    Input Token:{' '}
                    <span className='text-base-black font-semibold'>
                      ${scientificNumConvert(reasoningModel.dollarPerInputToken * 1000000)}
                    </span>
                  </p>
                  <p className='flex gap-1 justify-between text-body-sm text-neutral-01 md:justify-end md:text-right'>
                    Output Token:{' '}
                    <span className='text-base-black font-semibold'>
                      ${scientificNumConvert(reasoningModel.dollarPerOutputToken * 1000000)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
