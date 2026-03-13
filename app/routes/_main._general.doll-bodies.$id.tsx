import { Link, Outlet, useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.doll-bodies.$id';
import { useDollBody } from '~/hooks/queries/dollQueries';
import { useDeleteDollBody } from '~/hooks/queries/dollBodyMutations';
import { useUser } from '~/hooks/queries/userQueries';
import { getPicture } from '~/utils/getPicture';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { ROUTES, apiUrl } from '~/constants';
import ErrorPage from '~/components/ErrorPage';
import { useAlert, useConfirm } from '~/providers/AlertDialogProvider';
import { InstallButton } from '~/components/buttons/InstallButton';
import { SerialConfigButton } from '~/components/buttons/SerialConfigButton';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Doll Body - CipherDolls' }];
}

export default function DollBodyShow({ params }: Route.ComponentProps) {
  const { data: dollBody, isLoading, error } = useDollBody(params.id);
  const { data: user } = useUser();
  const { mutate: deleteDollBody } = useDeleteDollBody();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const alert = useAlert();
  const isAdmin = user?.role === 'ADMIN';

  const handleDelete = async () => {
    const result = await confirm({
      icon: '🗑️',
      title: 'Delete Doll Body?',
      body: 'Are you sure you want to delete this doll body? This action cannot be undone.',
      actionButton: 'Yes, Delete',
      cancelButton: 'No, Keep',
      variant: 'danger',
    });

    if (!result) return;

    deleteDollBody(params.id, {
      onSuccess: () => {
        navigate(ROUTES.dollBodies);
      },
      onError: (error: any) => {
        alert({
          title: 'Cannot Delete',
          body: error?.message || 'Failed to delete this doll body.',
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

  if (error || !dollBody) {
    return <ErrorPage code={(error as any)?.code} message={(error as any)?.message} />;
  }

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={ROUTES.dollBodies} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black whitespace-nowrap hover:underline transition-all duration-200'>
              {dollBody.name}
            </h3>
          </Link>
          {isAdmin && (
            <div className='flex items-center gap-3'>
              <Link to={`${ROUTES.dollBodies}/${dollBody.id}/edit`}>
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
            {dollBody.description && (
              <div className='bg-gradient-1 rounded-xl p-5'>
                <h4 className='text-heading-h4 text-base-black mb-3'>Description</h4>
                <p className='text-body-md text-neutral-01 whitespace-pre-wrap'>{dollBody.description}</p>
              </div>
            )}

            {dollBody.avatar && (
              <div className='bg-gradient-1 rounded-xl p-5'>
                <h4 className='text-heading-h4 text-base-black mb-3'>Avatar</h4>
                <Link to={`${ROUTES.avatars}/${dollBody.avatar.id}`} className='flex items-center gap-4 hover:opacity-80 transition-opacity'>
                  <div className='size-12 rounded-lg overflow-hidden bg-neutral-04'>
                    <img
                      src={getPicture(dollBody.avatar, 'avatars', false)}
                      srcSet={getPicture(dollBody.avatar, 'avatars', true)}
                      alt={dollBody.avatar.name}
                      className='size-full object-cover'
                    />
                  </div>
                  <span className='text-body-lg font-semibold text-base-black'>{dollBody.avatar.name}</span>
                </Link>
              </div>
            )}

            {dollBody.firmwares && dollBody.firmwares.length > 0 && (
              <div className='bg-gradient-1 rounded-xl p-5'>
                <h4 className='text-heading-h4 text-base-black mb-3'>Firmware</h4>
                <div className='flex flex-col gap-3'>
                  <p className='text-body-sm text-neutral-02'>
                    Hold BOOT, press RESET, release BOOT to enter download mode before flashing.
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='text-body-md text-neutral-01'>
                      Latest: v{dollBody.firmwares[0].version}
                    </span>
                    <InstallButton
                      manifest={`${apiUrl}/firmwares/${dollBody.firmwares[0].id}/manifest.json`}
                      label='Flash Firmware'
                    />
                  </div>
                  {dollBody.firmwares.length > 1 && (
                    <details className='mt-2'>
                      <summary className='text-body-sm text-neutral-02 cursor-pointer'>
                        Previous versions ({dollBody.firmwares.length - 1})
                      </summary>
                      <div className='flex flex-col gap-2 mt-2'>
                        {dollBody.firmwares.slice(1).map((fw) => (
                          <div key={fw.id} className='flex items-center justify-between'>
                            <span className='text-body-sm text-neutral-02'>v{fw.version}</span>
                            <InstallButton
                              manifest={`${apiUrl}/firmwares/${fw.id}/manifest.json`}
                              label='Flash'
                            />
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}

            <div className='bg-gradient-1 rounded-xl p-5'>
              <h4 className='text-heading-h4 text-base-black mb-3'>Device Configuration</h4>
              <p className='text-body-sm text-neutral-02 mb-3'>
                Connect to your device via USB to set the API key and view config.
              </p>
              <SerialConfigButton />
            </div>
          </div>

          <div className='flex flex-col gap-10 md:pl-4 md:max-w-[310px] w-full'>
            <label className='sm:h-60 h-[263px] w-full bg-neutral-04 sm:bg-gradient-1 flex flex-col justify-end items-center gap-3.5 rounded-xl relative'>
              {dollBody.picture ? (
                <div className='size-full'>
                  <img
                    src={getPicture(dollBody, 'doll-bodies', false)}
                    srcSet={getPicture(dollBody, 'doll-bodies', true)}
                    alt={dollBody.name}
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
        </div>
      </div>
      <Outlet />
    </>
  );
}
