import { Link, Outlet, useNavigate, useParams } from 'react-router';
import { Icons } from '~/components/ui/icons';
import { getPicture } from '~/utils/getPicture';
import * as Button from '~/components/ui/button/button';
import type { TtsVoice } from '~/types';
import Table from '~/components/Table';
import type { TTableColumn } from '~/components/Table';
import { DataCard } from '~/components/DataCard';
import type { Route } from './+types/_main._general.tts-providers.$ttsProviderId';
import PlayerButton from '~/components/PlayerButton';
import { PATHS, ROUTES } from '~/constants';
import DeleteModal from '~/components/ui/deleteModal';
import { ViewMore } from '~/view-more';
import { useTtsProvider } from '~/hooks/queries/ttsQueries';
import { useDeleteTtsProvider } from '~/hooks/queries/ttsMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';

const ttsVoiceColumns: Array<TTableColumn<TtsVoice>> = [
  {
    id: 'name',
    label: 'Name',
    render: (data) => <span className='font-semibold'>{data.name}</span>,
    align: 'left',
  },
  {
    id: 'recommended',
    label: 'Recommended',
    render: (data) => (
      <div className='ml-8'>
        {data.recommended ? (
          <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-neutral-03 bg-base-black outline-none focus:shadow-neutral-02'>
            <Icons.check className='text-white size-4.5' />
          </div>
        ) : (
          <div className='flex size-4.5 appearance-none items-center justify-center rounded-full border border-specials-danger bg-specials-danger outline-none focus:shadow-specials-danger'>
            <Icons.close className='text-white size-4.5' />
          </div>
        )}
      </div>
    ),
    align: 'left',
  },
  {
    id: 'id',
    label: '',
    render: (data) => {
      const params = useParams();
      return (
        <div className='flex items-center gap-4'>
          <PlayerButton variant='secondary' audioSrc={PATHS.ttsVoice(data.id)} />
          <Link to={`/tts-providers/${params.ttsProviderId}/ttsVoice/${data.id}/edit`} className='hover:opacity-50 transition-colors'>
            <Icons.pen />
          </Link>
        </div>
      );
    },
    align: 'right',
    width: '60px',
  },
];

export function meta({}: Route.MetaArgs) {
  return [{ title: 'TTS Providers' }];
}

export default function ttsProviderShow({ params }: Route.ComponentProps) {
  const confirm = useConfirm();
  const navigate = useNavigate();

  const { data: ttsProvider, isLoading } = useTtsProvider(params.ttsProviderId);
  const { mutate: deleteTtsProvider, isPending: isDeletingTtsProvider } = useDeleteTtsProvider();
  
  const ttsVoices = ttsProvider?.ttsVoices || [];
  const AddVoiceIcon = ({ to }: { to: string }) => {
    return (
      <Link to={to}>
        <Icons.add />
      </Link>
    );
  };

  const handleDeleteTtsProvider = async () => {
    const confirmResult = await confirm({
      title: `Delete provider ${ttsProvider?.name}?`,
      body: 'By deleting a TTS provider all related TTS voices will be deleted as well. You will not be able to restore the data.',
      actionButton: 'Yes, Delete',
      cancelButton: 'No, Leave',
    });

    if (!confirmResult) return;

    deleteTtsProvider(params.ttsProviderId, {
      onSuccess: () => {
        navigate(`${ROUTES.services}/tts`);
      },
    });
  };

  if (!ttsProvider) return <p className='text-body-md text-neutral-01 font-semibold text-center py-5'>TTS provider not found</p>;

  return (
    <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
      <div className='flex items-center justify-between sm:px-0 px-4.5'>
        <div className='flex items-center gap-3 sm:gap-4'>
          <Link to={`${ROUTES.services}/tts`} className='hover:bg-white/40 rounded-full'>
            <Icons.chevronLeft />
          </Link>
          <div className='flex items-center sm:gap-3 gap-1'>
            <div className='w-full h-10'>
              <img
                src={getPicture(ttsProvider, 'tts-providers', false)}
                srcSet={getPicture(ttsProvider, 'tts-providers', true)}
                alt={ttsProvider.name}
                className='size-full object-cover rounded-lg'
              />
            </div>
            <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black whitespace-nowrap'>{ttsProvider.name}</h3>
          </div>
        </div>
        <div className='md:flex hidden items-center gap-3'>
          <Link to={`/tts-providers/${ttsProvider.id}/edit`}>
            <Button.Root variant='secondary' className='w-[130px]'>
              Edit
            </Button.Root>
          </Link>
          <Button.Root variant='danger'  onClick={handleDeleteTtsProvider}>
            <Icons.trash className='w-12' />
          </Button.Root>
        </div>
        <div className='md:hidden flex text-base-black'>
          <ViewMore
            popoverItems={[
              {
                type: 'link',
                text: 'Edit',
                href: `/tts-providers/${ttsProvider.id}/edit`,
              },
              {
                type: 'onClick',
                text: 'Delete',
                isDelete: true,
                onClick: handleDeleteTtsProvider,
              },
            ]}
          />
        </div>
      </div>
      <div className='pb-5'>
        <div className='flex flex-col gap-5'>
          <DataCard.Root>
            <DataCard.Label
              className='text-2xl font-semibold'
              extra={<AddVoiceIcon to={`/tts-providers/${ttsProvider.id}/ttsVoice/new`} />}
            >
              {ttsProvider.name} Voices
            </DataCard.Label>

            <DataCard.Wrapper>
              {ttsVoices.length > 0 ? (
                <Table
                  columns={ttsVoiceColumns}
                  data={[...ttsVoices].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())}
                />
              ) : (
                <DataCard.Text>No TTS voices found</DataCard.Text>
              )}
            </DataCard.Wrapper>
          </DataCard.Root>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
