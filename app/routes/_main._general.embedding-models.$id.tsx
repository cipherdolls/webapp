import { Link, Outlet, useRouteLoaderData } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { EmbeddingModel, User } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.$aiProviderId';
import { getPicture } from '~/utils/getPicture';
import EmbeddingModelDestroy from './embedding-models.$id.destroy';
import DeleteModal from '~/components/ui/deleteModal';
import { formatDate } from '~/utils/date.utils';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { formatModelName } from '~/utils/formatModelName';
import { ViewMore } from '~/view-more';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Embedding Model' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const res = await fetchWithAuth(`embedding-models/${params.id}`);
  return await res.json();
}

export default function aiProviderShow({ loaderData }: Route.ComponentProps) {
  const embeddingModel: EmbeddingModel = loaderData;
  const me = useRouteLoaderData('routes/_main') as User;

  const createdDate = formatDate(embeddingModel.createdAt);
  const updatedDate = formatDate(embeddingModel.updatedAt);

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={`/services/ai`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <div className='flex items-center gap-3'>
              <h3 className='text-heading-h3 font-semibold text-base-black hover:underline transition-all duration-200'>
                {formatModelName(embeddingModel.providerModelName)}
              </h3>
              <span className='text-neutral-01 word text-body-lg'>•</span>
              <span className='text-neutral-01 text-body-lg'>AI</span>
            </div>
          </Link>
          {me.role === 'ADMIN' && (
            <div className='md:flex hidden items-center gap-3'>
              <Link to={`/embedding-models/${embeddingModel.id}/edit`}>
                <Button.Root variant='secondary' className='w-[130px]'>
                  Edit
                </Button.Root>
              </Link>
              <DeleteModal
                title='Delete an Embedding Model?'
                description='By deleting a embedding model a chat will be deleted as well. You will no able to restore the data'
              >
                <EmbeddingModelDestroy />
              </DeleteModal>
            </div>
          )}
          <div className='md:hidden flex text-base-black'>
            <ViewMore
              popoverItems={[
                {
                  type: 'link',
                  text: 'Edit',
                  href: `/embedding-models/${embeddingModel.id}/edit`,
                },
                {
                  type: 'component',
                  text: 'Delete',
                  isDelete: true,
                  component: (
                    <DeleteModal
                      title='Delete an Embedding Model?'
                      description='By deleting a embedding model a chat will be deleted as well. You will no able to restore the data'
                      dropdown
                    >
                      <EmbeddingModelDestroy />
                    </DeleteModal>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4 p-5 bg-gradient-1 rounded-xl '>
            <div className='flex sm:gap-5 md:gap-10 gap-5 justify-center items-center md:items-end md:justify-between md:flex-row flex-col'>
              <div className='flex items-center gap-5'>
                <div className='size-[72px]'>
                  <img
                    src={getPicture(embeddingModel.aiProvider, 'ai-providers', false)}
                    srcSet={getPicture(embeddingModel.aiProvider, 'ai-providers', true)}
                    alt={embeddingModel.providerModelName}
                    className='size-full object-cover rounded-lg'
                  />
                </div>
                <div className='flex flex-col gap-2'>
                  <h4 className='text-body-sm font-semibold sm:text-heading-h4 text-base-black'>{embeddingModel.providerModelName}</h4>
                  <div className='flex items-center gap-1'>
                    {embeddingModel.recommended && (
                      <div className='flex items-center gap-1'>
                        <Icons.thumb className='size-4' />
                        <span className='text-neutral-01 text-body-sm'>Recommended</span>
                      </div>
                    )}
                  </div>
                  <p className='text-body-sm text-base-black'>{embeddingModel.info}</p>
                </div>
              </div>
              <div className='flex flex-1 justify-end items-end h-full'>
                <div className='flex flex-col gap-2'>
                  <p className='md:text-right text-body-sm text-neutral-01 text-center'>
                    Provider: <span className='text-base-black font-semibold'>{embeddingModel.aiProvider?.name}</span>
                  </p>
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
          <div className='grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-4'>
            <div className='bg-white shadow-regular rounded-xl px-5 py-[18px] max-h-max relative'>
              <h2 className='text-body-md font-semibold mb-4 text-gray-800'>Model Properties</h2>
              <div className='flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-neutral-01 text-body-sm'>Dollar Per Input Token: </span>
                  <span className='text-body-sm font-semibold'>${scientificNumConvert(embeddingModel.dollarPerInputToken * 1000000)}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-neutral-01 text-body-sm'>Dollar Per Output Token:</span>
                  <span className='text-body-sm font-semibold'>${scientificNumConvert(embeddingModel.dollarPerOutputToken * 1000000)}</span>
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
