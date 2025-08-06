import { Link, Outlet, useNavigate, useRouteLoaderData } from 'react-router';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import type { SttProvider, User } from '~/types';
import type { Route } from './+types/_main._general.services_.stt_.$sttProviderId';
import { getPicture } from '~/utils/getPicture';
import { formatDate } from '~/utils/date.utils';
import { ViewMore } from '~/view-more';
import { useSttProvider } from '~/hooks/queries/sttQueries';
import { useDeleteSttProvider } from '~/hooks/queries/sttMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';
import ModalSttProviderEdit from '~/components/ModalSttProviderEdit';
import { useState } from 'react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'STT Provider' }];
}

export default function SttProviderId({ params }: Route.ComponentProps) {
  const { data: sttProviderData, isLoading, error } = useSttProvider(params.sttProviderId);
  const { mutate: deleteSttProvider, isPending: isDeletingSttProvider } = useDeleteSttProvider();

  
  const me = useRouteLoaderData('routes/_main') as User;
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [editSttProvider, setEditSttProvider] = useState<SttProvider | null>(null);

  if (isLoading) {
    return null;
  }

  if (!sttProviderData) {
    return <div>Provider not found</div>;
  }

  const sttProvider = sttProviderData;
  const createdDate = formatDate(sttProvider.createdAt);
  const updatedDate = formatDate(sttProvider.updatedAt);

  const handleDeleteSttProvider = async (sttProvider: SttProvider) => {
    const confirmResult = await confirm({
      title: `Delete provider ${sttProvider.name}?`,
      body: 'By deleting an STT provider all related data will be deleted as well. You will not be able to restore the data.',
      actionButton: 'Yes, Delete',
      cancelButton: 'No, Leave',
    });

    if (!confirmResult) return

    deleteSttProvider(sttProvider.id, {
      onSuccess: () => {
        navigate('/services/stt', { replace: true });
      },
    });
  };

  const handleShowEditModal = (provider: SttProvider) => setEditSttProvider(provider);
  const handleCloseEditModal = () => setEditSttProvider(null);

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={`/services/stt`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <div className='flex items-center gap-3'>
              <h3 className='font-semibold text-base-black hover:underline transition-all duration-200 sm:text-heading-h3'>
                {sttProvider.name}
              </h3>
              <span className='text-body-md text-neutral-01 word sm:text-body-lg'>•</span>
              <span className='text-body-md text-neutral-01 sm:text-body-lg'>STT</span>
            </div>
          </Link>
          {me.role === 'ADMIN' && (
            <div className='md:flex hidden items-center gap-3'>
              <Button.Root variant='secondary' className='w-[130px]' onClick={() => handleShowEditModal(sttProvider)}>
                Edit
              </Button.Root>
              <Button.Root
                type='button'
                variant='danger'
                onClick={() => handleDeleteSttProvider(sttProvider)}
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
                    type: 'onClick',
                    text: 'Edit',
                    onClick: () => handleShowEditModal(sttProvider),
                  },
                  {
                    type: 'onClick',
                    text: 'Delete',
                    isDelete: true,
                    onClick: () => handleDeleteSttProvider(sttProvider),
                  },
                ]}
              />
            )}
          </div>
        </div>
        <div className='flex flex-col md:gap-4 sm:gap-8 gap-4 sm:flex-1 pb-2.5'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4 p-5 bg-gradient-1 rounded-xl'>
              <div className='flex items-start flex-col gap-5 justify-center sm:gap-5 md:gap-10 md:items-end md:justify-between md:flex-row'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5'>
                  <div className='flex items-center gap-3 sm:gap-5'>
                    <div className='size-6 sm:size-[72px]'>
                      <img
                        src={getPicture(sttProvider, 'stt-providers', false)}
                        srcSet={getPicture(sttProvider, 'stt-providers', true)}
                        alt={sttProvider.name}
                        className='size-full object-cover rounded-lg'
                      />
                    </div>

                    <h4 className='text-body-md font-semibold text-base-black sm:text-heading-h4 sm:hidden'>{sttProvider.name}</h4>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <h4 className='hidden text-body-sm font-semibold sm:text-heading-h4 text-base-black sm:block'>{sttProvider.name}</h4>
                    <div className='flex items-center gap-1'>
                      {sttProvider.recommended && (
                        <div className='flex items-center gap-1'>
                          <Icons.checkCircle className='size-4 text-base-black/[0.56]' />
                          <span className='text-neutral-01 text-body-sm'>Current in use</span>
                        </div>
                      )}
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

                <div className='border-neutral-04 border w-full md:hidden' />

                <div className='flex flex-1 justify-end w-full h-full md:items-end'>
                  <div className='flex flex-col flex-1 gap-2'>
                    {/*UNUSED - <p className='flex gap-1 justify-between text-body-sm text-neutral-01 md:justify-end md:text-right'></p>*/}
                    <p className='flex gap-1 justify-between text-body-sm text-nowrap text-neutral-01 md:justify-end md:text-right'>
                      Created at: <span className='text-base-black font-semibold'>{createdDate}</span>
                    </p>
                    <p className='flex gap-1 justify-between text-body-sm text-nowrap text-neutral-01 md:justify-end md:text-right'>
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
            </div>
          </div>
        </div>
      </div>
      <ModalSttProviderEdit sttProvider={editSttProvider} onClose={handleCloseEditModal} />
    </>
  );
}
