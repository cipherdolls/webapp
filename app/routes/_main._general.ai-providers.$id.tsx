import { Link, Outlet, useNavigate, useRouteLoaderData } from 'react-router';
import { Fragment, useRef, useState } from 'react';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import type { User } from '~/types';
import type { Route } from './+types/_main._general.ai-providers.$id';
import { getPicture } from '~/utils/getPicture';
import { formatModelName } from '~/utils/formatModelName';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { ViewMore } from '~/view-more';
import { useAiProvider } from '~/hooks/queries/aiProviderQueries';
import { useDeleteAiProvider } from '~/hooks/queries/aiProviderMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { ROUTES } from '~/constants';
import ErrorPage from '~/components/ErrorPage';
import { useUploadPicture, useDeletePicture } from '~/hooks/queries/pictureMutations';
import { DataCard } from '~/components/DataCard';
import { chatModelColumns, embeddingModelColumns, reasoningModelColumns } from '~/components/ai-services/TableDefinitions';
import Table from '~/components/Table';
import { RecommendedBadge } from '~/components/ui/RecommendedBadge';
import Tooltip from '~/components/ui/tooltip';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'AI Provider' }, { name: 'robots', content: 'noindex' }];
}

export default function AiProviderShow({ params }: Route.ComponentProps) {
  const me = useRouteLoaderData('routes/_main') as User;
  const confirm = useConfirm();
  const navigate = useNavigate();

  const { data: aiProvider, isLoading, error } = useAiProvider(params.id!);
  const { mutate: deleteAiProvider } = useDeleteAiProvider();
  const { mutate: uploadPicture, isPending: isUploading } = useUploadPicture();
  const { mutate: deletePicture, isPending: isDeleting } = useDeletePicture();

  const pictureInputRef = useRef<HTMLInputElement | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [selectedPictureFile, setSelectedPictureFile] = useState<File | null>(null);

  if (isLoading) return null;

  if (error || !aiProvider) {
    return <ErrorPage code={(error as any)?.code} message={(error as any)?.message} />;
  }

  const handleDelete = async () => {
    const result = await confirm({
      title: `Delete provider ${aiProvider.name}?`,
      body: 'By deleting an AI provider all related data will be deleted as well. You will not be able to restore the data.',
      actionButton: 'Yes, Delete',
      cancelButton: 'No, Leave',
      variant: 'danger',
    });

    if (!result) return;

    deleteAiProvider(aiProvider.id, {
      onSuccess: () => {
        navigate(`${ROUTES.services}/ai`);
      },
    });
  };

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={`${ROUTES.services}/ai`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <div className='flex sm:items-center sm:flex-row flex-col flex-wrap sm:gap-3 gap-1'>
              <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black whitespace-nowrap hover:underline transition-all duration-200'>
                {aiProvider.name}
              </h3>
              <span className='text-neutral-01 text-body-lg sm:block hidden'>•</span>
              <span className='text-neutral-01 text-body-sm sm:text-body-lg'>AI Provider</span>
            </div>
          </Link>
          <div className='md:flex hidden items-center gap-3'>
            {me.role === 'ADMIN' && (
              <>
                <Link to={`${ROUTES.services}/ai/ai-providers/${aiProvider.id}/edit`}>
                  <Button.Root variant='secondary' className='w-[130px]'>
                    Edit
                  </Button.Root>
                </Link>
                <Button.Root type='button' variant='danger' onClick={handleDelete}>
                  <Icons.trash className='w-12' />
                </Button.Root>
              </>
            )}
          </div>
          <div className='md:hidden flex text-base-black'>
            {me.role === 'ADMIN' && (
              <ViewMore
                popoverItems={[
                  {
                    type: 'link',
                    text: 'Edit',
                    href: `${ROUTES.services}/ai/ai-providers/${aiProvider.id}/edit`,
                  },
                  {
                    type: 'onClick',
                    text: 'Delete',
                    isDelete: true,
                    onClick: handleDelete,
                  },
                ]}
              />
            )}
          </div>
        </div>

        <div className='flex md:flex-row flex-col-reverse gap-5 sm:flex-1 divide-neutral-04 rounded-xl pb-2.5 sm:backdrop-blur-none sm:bg-none sm:rounded-none md:gap-0 md:divide-x'>
          <div className='flex gap-4 flex-col md:pr-4 w-full'>
            {/* CHAT MODELS */}
            <div className='bg-gradient-1 rounded-xl md:bg-none'>
              <div className='flex items-center justify-between p-3'>
                <span className='text-xs text-neutral-01 font-semibold'>Chat Models</span>
                {me.role === 'ADMIN' && (
                  <Link to={`/ai-providers/${aiProvider.id}/chat-models/new`}>
                    <Button.Root size='sm' variant='secondary' className='px-3 h-7 text-body-sm'>
                      + Add
                    </Button.Root>
                  </Link>
                )}
              </div>
              {aiProvider.chatModels && aiProvider.chatModels.length > 0 ? (
                <DataCard.Wrapper>
                  <div className='md:block hidden'>
                    <Table
                      columns={chatModelColumns}
                      data={aiProvider.chatModels}
                      getRowUrl={(chatModel) => `/chat-models/${chatModel.id}`}
                    />
                  </div>
                  <div className='block md:hidden'>
                    {aiProvider.chatModels.map((chatModel, index) => (
                      <Fragment key={chatModel.id}>
                        <DataCard.Item collapsible href={`/chat-models/${chatModel.id}`}>
                          <DataCard.ItemLabel>
                            <span className='flex items-center gap-2'>
                              {chatModel.providerModelName}
                              {chatModel.free && <span className='text-green-600 text-xs font-medium'>free</span>}
                              <RecommendedBadge recommended={chatModel.recommended} tooltipText='Recommended' />
                              {chatModel.error && (
                                <Tooltip
                                  side='top'
                                  variant='error'
                                  trigger={<Icons.warning className='size-4 text-specials-danger' />}
                                  content={chatModel.error}
                                  popoverClassName='max-w-[350px]'
                                />
                              )}
                            </span>
                          </DataCard.ItemLabel>
                          <DataCard.ItemDataGrid
                            data={[
                              { label: '$/Input', value: <>${scientificNumConvert(chatModel.dollarPerInputToken * 1000000)}</> },
                              { label: '$/Output', value: <>${scientificNumConvert(chatModel.dollarPerOutputToken * 1000000)}</> },
                            ]}
                          />
                        </DataCard.Item>
                        {aiProvider.chatModels!.length - 1 !== index && <DataCard.Divider />}
                      </Fragment>
                    ))}
                  </div>
                </DataCard.Wrapper>
              ) : (
                <DataCard.Wrapper>
                  <DataCard.Text>No chat models yet</DataCard.Text>
                </DataCard.Wrapper>
              )}
            </div>

            {/* EMBEDDING MODELS */}
            <div className='bg-gradient-1 rounded-xl md:bg-none'>
              <div className='flex items-center justify-between p-3'>
                <span className='text-xs text-neutral-01 font-semibold'>Embedding Models</span>
                {me.role === 'ADMIN' && (
                  <Link to={`/ai-providers/${aiProvider.id}/embedding-models/new`}>
                    <Button.Root size='sm' variant='secondary' className='px-3 h-7 text-body-sm'>
                      + Add
                    </Button.Root>
                  </Link>
                )}
              </div>
              {aiProvider.embeddingModels && aiProvider.embeddingModels.length > 0 ? (
                <DataCard.Wrapper>
                  <div className='md:block hidden'>
                    <Table
                      columns={embeddingModelColumns}
                      data={aiProvider.embeddingModels}
                      getRowUrl={(embeddingModel) => `/embedding-models/${embeddingModel.id}`}
                    />
                  </div>
                  <div className='block md:hidden'>
                    {aiProvider.embeddingModels.map((embeddingModel, index) => (
                      <Fragment key={embeddingModel.id}>
                        <DataCard.Item collapsible href={`/embedding-models/${embeddingModel.id}`}>
                          <DataCard.ItemLabel>
                            <span className='flex items-center gap-2'>
                              {formatModelName(embeddingModel.providerModelName)}
                              <RecommendedBadge recommended={embeddingModel.recommended} tooltipText='Recommended' />
                              {embeddingModel.error && (
                                <Tooltip
                                  side='top'
                                  variant='error'
                                  trigger={<Icons.warning className='size-4 text-specials-danger' />}
                                  content={embeddingModel.error}
                                  popoverClassName='max-w-[350px]'
                                />
                              )}
                            </span>
                          </DataCard.ItemLabel>
                          <DataCard.ItemDataGrid
                            data={[
                              { label: '$/Input', value: <>${scientificNumConvert(embeddingModel.dollarPerInputToken * 1000000)}</> },
                              { label: '$/Output', value: <>${scientificNumConvert(embeddingModel.dollarPerOutputToken * 1000000)}</> },
                            ]}
                          />
                        </DataCard.Item>
                        {aiProvider.embeddingModels!.length - 1 !== index && <DataCard.Divider />}
                      </Fragment>
                    ))}
                  </div>
                </DataCard.Wrapper>
              ) : (
                <DataCard.Wrapper>
                  <DataCard.Text>No embedding models yet</DataCard.Text>
                </DataCard.Wrapper>
              )}
            </div>

            {/* REASONING MODELS */}
            <div className='bg-gradient-1 rounded-xl md:bg-none'>
              <div className='flex items-center justify-between p-3'>
                <span className='text-xs text-neutral-01 font-semibold'>Reasoning Models</span>
                {me.role === 'ADMIN' && (
                  <Link to={`/ai-providers/${aiProvider.id}/reasoning-models/new`}>
                    <Button.Root size='sm' variant='secondary' className='px-3 h-7 text-body-sm'>
                      + Add
                    </Button.Root>
                  </Link>
                )}
              </div>
              {aiProvider.reasoningModels && aiProvider.reasoningModels.length > 0 ? (
                <DataCard.Wrapper>
                  <div className='md:block hidden'>
                    <Table
                      columns={reasoningModelColumns}
                      data={aiProvider.reasoningModels}
                      getRowUrl={(reasoningModel) => `/reasoning-models/${reasoningModel.id}`}
                    />
                  </div>
                  <div className='block md:hidden'>
                    {aiProvider.reasoningModels.map((reasoningModel, index) => (
                      <Fragment key={reasoningModel.id}>
                        <DataCard.Item collapsible href={`/reasoning-models/${reasoningModel.id}`}>
                          <DataCard.ItemLabel>
                            <span className='flex items-center gap-2'>
                              {reasoningModel.providerModelName}
                              <RecommendedBadge recommended={reasoningModel.recommended} tooltipText='Recommended' />
                              {reasoningModel.error && (
                                <Tooltip
                                  side='top'
                                  variant='error'
                                  trigger={<Icons.warning className='size-4 text-specials-danger' />}
                                  content={reasoningModel.error}
                                  popoverClassName='max-w-[350px]'
                                />
                              )}
                            </span>
                          </DataCard.ItemLabel>
                          <DataCard.ItemDataGrid
                            data={[
                              { label: '$/Input', value: <>${scientificNumConvert(reasoningModel.dollarPerInputToken * 1000000)}</> },
                              { label: '$/Output', value: <>${scientificNumConvert(reasoningModel.dollarPerOutputToken * 1000000)}</> },
                            ]}
                          />
                        </DataCard.Item>
                        {aiProvider.reasoningModels!.length - 1 !== index && <DataCard.Divider />}
                      </Fragment>
                    ))}
                  </div>
                </DataCard.Wrapper>
              ) : (
                <DataCard.Wrapper>
                  <DataCard.Text>No reasoning models yet</DataCard.Text>
                </DataCard.Wrapper>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-10 md:pl-4 md:max-w-[310px] w-full'>
            <div className='relative'>
              <input
                ref={pictureInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setSelectedPictureFile(file);
                    setPicturePreview(URL.createObjectURL(file));
                  }
                }}
              />
              <div className='sm:h-60 h-[263px] w-full bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl relative overflow-hidden'>
                {picturePreview ? (
                  <div className='size-full'>
                    <img
                      src={picturePreview}
                      alt='Preview'
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                ) : aiProvider.picture ? (
                  <div className='size-full'>
                    <img
                      src={getPicture(aiProvider, 'ai-providers', false)}
                      srcSet={getPicture(aiProvider, 'ai-providers', true)}
                      alt={aiProvider.name}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                ) : (
                  <div
                    className='flex items-center justify-center size-full min-w-[294px] cursor-pointer hover:opacity-80 transition-opacity'
                    onClick={() => pictureInputRef.current?.click()}
                  >
                    <Icons.fileUploadIcon />
                  </div>
                )}

                {aiProvider.picture && !picturePreview && me.role === 'ADMIN' && (
                  <div className='absolute top-2 right-2 flex gap-2'>
                    <button
                      type='button'
                      className='size-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors'
                      onClick={() => pictureInputRef.current?.click()}
                    >
                      <Icons.pen className='size-4' />
                    </button>
                    <button
                      type='button'
                      className='size-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-specials-danger text-white transition-colors'
                      disabled={isDeleting}
                      onClick={() => {
                        if (aiProvider.picture && typeof aiProvider.picture === 'object') {
                          deletePicture(aiProvider.picture.id);
                        }
                      }}
                    >
                      <Icons.trash className='size-4' />
                    </button>
                  </div>
                )}

                {picturePreview && (
                  <div className='absolute bottom-2 left-2 right-2 flex gap-2'>
                    <Button.Root
                      variant='secondary'
                      size='sm'
                      className='flex-1 bg-white/90 backdrop-blur-sm'
                      onClick={() => { setPicturePreview(null); setSelectedPictureFile(null); }}
                    >
                      Cancel
                    </Button.Root>
                    <Button.Root
                      size='sm'
                      className='flex-1'
                      disabled={isUploading}
                      onClick={() => {
                        if (!selectedPictureFile) return;
                        const formData = new FormData();
                        formData.append('file', selectedPictureFile);
                        formData.append('aiProviderId', aiProvider.id);
                        uploadPicture(formData, {
                          onSuccess: () => {
                            setPicturePreview(null);
                            setSelectedPictureFile(null);
                          },
                        });
                      }}
                    >
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </Button.Root>
                  </div>
                )}
              </div>
            </div>

            <div className='flex flex-col gap-5'>
              <h1 className='text-base-black text-heading-h3 font-semibold'>Details</h1>
              <div className='px-5 py-[18px] bg-gradient-1 rounded-xl flex flex-col gap-3'>
                <div className='flex justify-between'>
                  <span className='text-body-sm text-neutral-01'>Base Path</span>
                  <span className='text-body-sm font-semibold text-base-black truncate ml-4 max-w-[60%] text-right'>{aiProvider.basePath}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-body-sm text-neutral-01'>Chat Models</span>
                  <span className='text-body-sm font-semibold text-base-black'>{aiProvider.chatModels?.length || 0}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-body-sm text-neutral-01'>Embedding Models</span>
                  <span className='text-body-sm font-semibold text-base-black'>{aiProvider.embeddingModels?.length || 0}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-body-sm text-neutral-01'>Reasoning Models</span>
                  <span className='text-body-sm font-semibold text-base-black'>{aiProvider.reasoningModels?.length || 0}</span>
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
