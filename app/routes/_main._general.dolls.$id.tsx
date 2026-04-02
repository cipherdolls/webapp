import { Link, Outlet, useNavigate } from 'react-router';
import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ProcessEvent } from '~/types';
import type { Route } from './+types/_main._general.dolls.$id';
import { useDoll } from '~/hooks/queries/dollQueries';
import { useDeleteDoll } from '~/hooks/queries/dollMutations';
import { useChat } from '~/hooks/queries/chatQueries';
import { useUser } from '~/hooks/queries/userQueries';
import { useDollEvents } from '~/hooks/useDollEvents';
import { useMqttSubscription } from '~/hooks/useMqttSubscription';
import { getPicture } from '~/utils/getPicture';
import AvatarPicture from '~/components/AvatarPicture';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { ROUTES } from '~/constants';
import ErrorPage from '~/components/ErrorPage';
import { useAlert, useConfirm } from '~/providers/AlertDialogProvider';
import { cn } from '~/utils/cn';
import { useUploadPicture, useDeletePicture } from '~/hooks/queries/pictureMutations';

interface DollMetrics {
  recording: number;
  t1: boolean;
  t2: boolean;
  freeSRAM: number;
  freePSRAM: number;
  wifiRSSI: number;
  deepSleepCountdown: number;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Doll - CipherDolls' }];
}

export default function DollShow({ params }: Route.ComponentProps) {
  const { data: doll, isLoading, error } = useDoll(params.id);
  const { data: chat } = useChat(doll?.chatId || '');
  const { data: user } = useUser();
  const { mutate: deleteDoll } = useDeleteDoll();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const alert = useAlert();
  const queryClient = useQueryClient();
  const { mutate: uploadPicture, isPending: isUploading } = useUploadPicture();
  const { mutate: deletePicture, isPending: isDeleting } = useDeletePicture();
  const isOwner = user?.id === doll?.userId;
  const [metrics, setMetrics] = useState<DollMetrics | null>(null);
  const pictureInputRef = useRef<HTMLInputElement | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [selectedPictureFile, setSelectedPictureFile] = useState<File | null>(null);

  useDollEvents(params.id, {
    onProcessEvent: useCallback(
      (event: ProcessEvent) => {
        if (event.jobStatus === 'completed') {
          queryClient.invalidateQueries({ queryKey: ['doll', params.id] });
        }
      },
      [queryClient, params.id]
    ),
    enabled: !!doll,
  });

  useMqttSubscription(
    `dolls/${params.id}/metrics`,
    useCallback((message) => {
      try {
        const data: DollMetrics = JSON.parse(message.payload);
        setMetrics(data);
      } catch (error) {
        console.error('Failed to parse doll metrics:', error);
      }
    }, []),
    !!doll
  );

  const handleDelete = async () => {
    const result = await confirm({
      icon: '🗑️',
      title: 'Delete Doll?',
      body: 'Are you sure you want to delete this doll? This action cannot be undone.',
      actionButton: 'Yes, Delete',
      cancelButton: 'No, Keep',
      variant: 'danger',
    });

    if (!result) return;

    deleteDoll(params.id, {
      onSuccess: () => {
        navigate(ROUTES.account);
      },
      onError: (error: any) => {
        alert({
          title: 'Cannot Delete',
          body: error?.message || 'Failed to delete this doll.',
          actionButton: 'OK',
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className='w-full flex flex-col gap-5 sm:mt-8'>
        <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-8 max-w-[200px]' />
        <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[300px] sm:h-[400px]' />
        <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-6 max-w-[400px]' />
      </div>
    );
  }

  if (error || !doll) {
    return <ErrorPage code={(error as any)?.code} message={(error as any)?.message} />;
  }

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={ROUTES.account} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black whitespace-nowrap hover:underline transition-all duration-200'>
              {doll.name || 'Unnamed Doll'}
            </h3>
          </Link>
          {isOwner && (
            <div className='flex items-center gap-3'>
              <Link to={`${ROUTES.dolls}/${doll.id}/edit`}>
                <Button.Root variant='secondary' className='w-[130px]'>
                  Edit
                </Button.Root>
              </Link>
              <Button.Root type='button' variant='danger' onClick={handleDelete}>
                <Icons.trash className='w-12' />
              </Button.Root>
            </div>
          )}
        </div>

        <div className='flex md:flex-row flex-col-reverse gap-5 rounded-xl pb-2.5 md:gap-0 md:divide-x divide-neutral-04'>
          <div className='flex flex-col gap-4 md:pr-4 w-full'>
            <div className='bg-gradient-1 rounded-xl p-5'>
              <h4 className='text-heading-h4 text-base-black mb-3'>Details</h4>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-body-sm text-neutral-01'>Status:</span>
                  <span className='flex items-center gap-1.5'>
                    <span className={cn('size-2 rounded-full', doll.online ? 'bg-green-500' : 'bg-neutral-03')} />
                    <span className='text-body-sm font-semibold text-base-black'>{doll.online ? 'Online' : 'Offline'}</span>
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-body-sm text-neutral-01'>MAC Address:</span>
                  <span className='text-body-sm font-semibold text-base-black'>{doll.macAddress}</span>
                </div>
              </div>
            </div>

            {metrics && (
              <div className='bg-gradient-1 rounded-xl p-5'>
                <h4 className='text-heading-h4 text-base-black mb-3'>Live Metrics</h4>
                <div className='flex flex-col gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-body-sm text-neutral-01'>WiFi RSSI:</span>
                    <span className='text-body-sm font-semibold text-base-black'>{metrics.wifiRSSI} dBm</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-body-sm text-neutral-01'>Deep Sleep Countdown:</span>
                    <span className='text-body-sm font-semibold text-base-black'>{metrics.deepSleepCountdown}s</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-body-sm text-neutral-01'>Free SRAM:</span>
                    <span className='text-body-sm font-semibold text-base-black'>{(metrics.freeSRAM / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-body-sm text-neutral-01'>Free PSRAM:</span>
                    <span className='text-body-sm font-semibold text-base-black'>{(metrics.freePSRAM / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </div>
            )}

            {doll.dollBody && (
              <div className='bg-gradient-1 rounded-xl p-5'>
                <h4 className='text-heading-h4 text-base-black mb-3'>Doll Body</h4>
                <Link to={`${ROUTES.dollBodies}/${doll.dollBody.id}`} className='flex items-center gap-4 hover:opacity-80 transition-opacity'>
                  <div className='size-12 rounded-lg overflow-hidden bg-neutral-04'>
                    <img
                      src={getPicture(doll.dollBody, 'doll-bodies', false)}
                      srcSet={getPicture(doll.dollBody, 'doll-bodies', true)}
                      alt={doll.dollBody.name}
                      className='size-full object-cover'
                    />
                  </div>
                  <span className='text-body-lg font-semibold text-base-black'>{doll.dollBody.name}</span>
                </Link>
              </div>
            )}

            {chat && (
              <div className='bg-gradient-1 rounded-xl p-5'>
                <h4 className='text-heading-h4 text-base-black mb-3'>Chat</h4>
                <div className='bg-base-white rounded-xl overflow-hidden'>
                  <div className='flex items-center gap-3 p-3'>
                    {chat.avatar && <AvatarPicture avatar={chat.avatar} className='size-8' />}
                    <div className='flex-1 overflow-hidden'>
                      <span className='text-body-sm font-semibold text-base-black truncate block'>{chat.avatar?.name || 'Chat'}</span>
                    </div>
                    {chat._count?.messages > 0 && (
                      <span className='text-xs text-neutral-01 bg-neutral-04 px-2 py-1 rounded-full'>{chat._count.messages} msgs</span>
                    )}
                  </div>
                  <Link
                    to={`${ROUTES.chats}/${chat.id}`}
                    className='block rounded-lg p-3 mx-3 mb-3 hover:bg-neutral-05 transition-colors'
                  >
                    <span className='text-body-sm font-medium truncate block'>{chat.scenario?.name || 'Scenario'}</span>
                    <span className='text-xs text-neutral-01 mt-1 block'>{new Date(chat.updatedAt).toLocaleString()}</span>
                  </Link>
                </div>
              </div>
            )}
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
              <div className='sm:h-60 h-[263px] w-full bg-neutral-04 sm:bg-gradient-1 flex flex-col justify-end items-center gap-3.5 rounded-xl relative overflow-hidden'>
                {picturePreview ? (
                  <div className='size-full'>
                    <img
                      src={picturePreview}
                      alt='Preview'
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                ) : doll.picture ? (
                  <div className='size-full'>
                    <img
                      src={getPicture(doll, 'dolls', false)}
                      srcSet={getPicture(doll, 'dolls', true)}
                      alt={doll.name || 'Doll'}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                ) : (
                  <div
                    className='flex items-center justify-center size-full cursor-pointer hover:opacity-80 transition-opacity'
                    onClick={() => pictureInputRef.current?.click()}
                  >
                    <Icons.fileUploadIcon />
                  </div>
                )}

                {doll.picture && !picturePreview && isOwner && (
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
                        if (doll.picture && typeof doll.picture === 'object') {
                          deletePicture(doll.picture.id);
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
                        formData.append('dollId', doll.id);
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
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
