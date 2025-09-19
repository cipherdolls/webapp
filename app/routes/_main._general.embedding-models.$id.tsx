import { Link, Outlet, useNavigate, useRouteLoaderData } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import type { User } from '~/types';
import type { Route } from './+types/_main._general.embedding-models.$id';
import { getPicture } from '~/utils/getPicture';
import { formatDate } from '~/utils/date.utils';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { formatModelName } from '~/utils/formatModelName';
import { ViewMore } from '~/view-more';
import { useDeleteEmbeddingModel } from '~/hooks/queries/aiProviderMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useEmbeddingModel } from '~/hooks/queries/aiProviderQueries';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Embedding Model' }];
}

export default function aiProviderShow({ params }: Route.ComponentProps) {
  const { data: embeddingModel } = useEmbeddingModel(params.id!);
  const me = useRouteLoaderData('routes/_main') as User;
  const confirm = useConfirm();
  const navigate = useNavigate();

  const { mutate: deleteEmbeddingModel, isPending: isDeletingEmbeddingModel, error: deleteEmbeddingModelError } = useDeleteEmbeddingModel();

  if (!embeddingModel) return null;

  const createdDate = formatDate(embeddingModel.createdAt);
  const updatedDate = formatDate(embeddingModel.updatedAt);
  
  const handleDeleteEmbeddingModel = async () => {
    const result = await confirm({
      title: `Delete embedding model ${formatModelName(embeddingModel.providerModelName)}?`,
      body: 'By deleting a embedding model a chat will be deleted as well. You will no able to restore the data',
      actionButton: 'Yes, Delete',
      cancelButton: 'No, Leave',
    });

    if (!result) return;

    deleteEmbeddingModel(embeddingModel.id, {
      onSuccess: () => {
        navigate(`${ROUTES.services}/ai`);
      },
    });
  };

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={`${ROUTES.services}/ai`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <div className='flex items-center gap-3'>
              <h3 className='font-semibold text-base-black hover:underline transition-all duration-200 sm:text-heading-h3'>
                {formatModelName(embeddingModel.providerModelName)}
              </h3>
              <span className='text-body-md text-neutral-01 word sm:text-body-lg'>•</span>
              <span className='text-body-md text-neutral-01 sm:text-body-lg'>AI</span>
            </div>
          </Link>
          {me.role === 'ADMIN' && (
            <div className='md:flex hidden items-center gap-3'>
              <Link to={`/embedding-models/${embeddingModel.id}/edit`}>
                <Button.Root variant='secondary' className='w-[130px]'>
                  Edit
                </Button.Root>
              </Link>
              <Button.Root
                type='button'
                variant='danger'
                className=''
                onClick={handleDeleteEmbeddingModel}
              >
                <Icons.trash className='w-12' />
              </Button.Root>
            </div>
          )}
          <div className='md:hidden flex text-base-black'>
            {me.role === 'ADMIN' && (
              <ViewMore
                popoverItems={[
                  {
                    type: 'link',
                    text: 'Edit',
                    href: `/embedding-models/${embeddingModel.id}/edit`,
                  },
                  {
                    type: 'onClick',
                    text: 'Delete',
                    isDelete: true,
                    onClick: handleDeleteEmbeddingModel,
                  },
                ]}
              />
            )}
          </div>
        </div>

        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4 p-5 bg-gradient-1 rounded-xl'>
            <div className='flex items-start flex-col gap-5 justify-center sm:gap-5 md:gap-10 md:items-end md:justify-between md:flex-row'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5'>
                <div className='flex items-center gap-3 sm:gap-5'>
                  <div className='size-6 sm:size-[72px]'>
                    <img
                      src={getPicture(embeddingModel.aiProvider, 'ai-providers', false)}
                      srcSet={getPicture(embeddingModel.aiProvider, 'ai-providers', true)}
                      alt={embeddingModel.providerModelName}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>

                  <h4 className='text-body-md font-semibold text-base-black sm:text-heading-h4 sm:hidden'>
                    {embeddingModel.providerModelName}
                  </h4>
                </div>

                <div className='flex flex-col gap-2'>
                  <h4 className='hidden text-body-md font-semibold text-base-black sm:text-heading-h4 sm:block'>
                    {embeddingModel.providerModelName}
                  </h4>

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

              <div className='border-neutral-04 border w-full md:hidden' />

              <div className='flex flex-1 justify-end w-full h-full md:items-end'>
                <div className='flex flex-col flex-1 gap-2'>
                  <p className='flex gap-1 justify-between text-body-sm text-neutral-01 md:justify-end md:text-right'>
                    Provider: <span className='text-base-black font-semibold'>{embeddingModel.aiProvider?.name}</span>
                  </p>
                  <p className='flex gap-1 justify-between text-body-sm text-neutral-01 md:justify-end md:text-right'>
                    Created at: <span className='text-base-black font-semibold'>{createdDate}</span>
                  </p>
                  <p className='flex gap-1 justify-between text-body-sm text-neutral-01 md:justify-end md:text-right'>
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
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
