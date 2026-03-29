import { Link, useNavigate } from 'react-router';
import type { Route } from './+types/_main.chats.$chatId.edit';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { Card } from '~/components/card';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import type { SttProvider } from '~/types';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import { useDeleteChat } from '~/hooks/queries/chatMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useChat } from '~/hooks/queries/chatQueries';
import { useUpdateChat } from '~/hooks/queries/chatMutations';
import { useSttProviders } from '~/hooks/queries/sttQueries';
import { useDolls } from '~/hooks/queries/dollQueries';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import * as Select from '~/components/ui/input/select';
import { ANIMATE_MODAL_SHOW_RIGHT, ROUTES } from '~/constants';
import { motion } from 'framer-motion';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat edit' }];
}

  
export default function ChatEdit({ loaderData, params }: Route.ComponentProps) {
  const { data: sttProviders } = useSttProviders();
  const { data: chatData, refetch } = useChat(params.chatId);
  const { data: dolls } = useDolls();
  const chat = chatData;

  const { mutate: updateChat, isPending: isUpdatingChat } = useUpdateChat();
  const { mutate: deleteChat, isPending: isDeletingChat } = useDeleteChat();

  const navigate = useNavigate();
  const confirm = useConfirm();

  const { silentMode, toggleSilentMode } = useChatStore(
    useShallow((state) => ({
      silentMode: state.silentMode,
      toggleSilentMode: state.toggleSilentMode,
    }))
  );

  if (!chat) return null;

  const handleEditChatClose = () => {
    navigate(`${ROUTES.chats}/${chat.id}`);
  };

  const handleSttProviderChange = (sttProvider: SttProvider) => {
    updateChat({
      chatId: chat.id,
      data: {
        sttProviderId: sttProvider.id,
        avatarId: chat.avatar.id,
        scenarioId: chat.scenario.id,
      },
    });
  };

  const handleDollChange = async (newValue: string) => {
    const previousDollId = chat.doll?.id;
    const newDollId = newValue === 'none' ? null : newValue;
    if (previousDollId === newDollId) return;

    try {
      if (previousDollId) {
        await fetchWithAuth(`dolls/${previousDollId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: null }),
        });
      }
      if (newDollId) {
        await fetchWithAuth(`dolls/${newDollId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: chat.id }),
        });
      }
      refetch();
    } catch (error) {
      console.error('Failed to update doll:', error);
    }
  };

  const handleResetChat = async () => {
    const confirmResult = await confirm({
      icon: '🔄',
      title: 'Reset this Chat?',
      body: 'All messages will be deleted and the chat will be re-initialized',
      actionButton: 'Yes, Reset',
    });
    if (!confirmResult) return;

    updateChat({
      chatId: chat.id,
      data: {
        action: 'Init',
        avatarId: chat.avatar.id,
        scenarioId: chat.scenario.id,
      },
    });
  };

  const handleDeleteChat = async () => {
    const confirmResult = await confirm({
      icon: '🗑️',
      title: 'Delete the Chats?',
      body: 'You will no able to restore the data',
      actionButton: 'Yes, Delete',
    });
    if (!confirmResult) return;

    deleteChat(chat.id, {
      onSuccess: () => {
        navigate(`${ROUTES.chats}`, { replace: true });
      },
    });
  };

  return (
    <>
      <div className='pageModal'>
        <div className='pageModal-overlay' onClick={handleEditChatClose}></div>

          <motion.div
            className='pageModal-content'
            initial={ANIMATE_MODAL_SHOW_RIGHT.initial}
            animate={ANIMATE_MODAL_SHOW_RIGHT.animate}
            transition={ANIMATE_MODAL_SHOW_RIGHT.transition}
          >
            <Button.Root
              onClick={handleEditChatClose}
              className='hidden group md:flex absolute right-full top-4.5 mr-4.5 shadow-bottom'
              size='icon'
              variant='white'
              aria-label='Close'
            >
              <Button.Icon className='transition-transform duration-250 group-hover:scale-125' as={Icons.close} />
            </Button.Root>
            {/* page modal header */}
            <div className='pageModal-header'>
              <button onClick={handleEditChatClose} className='md:hidden'>
                <Icons.chevronLeft />
              </button>
              <div className='flex items-center gap-3 overflow-hidden'>
                <h3 className='text-heading-h3 text-base-black'>{chat.avatar.name}</h3>
                <span className='text-body-lg text-neutral-01'>•</span>
                <p className='text-body-lg text-neutral-01 truncate'>{chat.avatar.shortDesc}</p>
              </div>
            </div>
            <div className='flex flex-col flex-1 gap-8 overflow-y-auto scrollbar-medium pb-5 -mx-5 px-5'>
              {/* Avatar link */}
              <Link
                to={`${ROUTES.avatars}/${chat.avatar.id}`}
                className='flex-shrink-0 flex flex-col backdrop-blur-48 bg-gradient-1 rounded-xl overflow-hidden'
              >
                <div className='w-full h-[263px] flex items-center justify-center rounded-xl bg-neutral-04'>
                  {chat.avatar.picture ? (
                    <img
                      src={getPicture(chat.avatar, 'avatars', false)}
                      srcSet={getPicture(chat.avatar, 'avatars', true)}
                      alt={chat.avatar.name}
                      className='size-full object-cover rounded-lg'
                    />
                  ) : (
                    <Icons.fileUploadIcon />
                  )}
                </div>
                <p className='w-full flex justify-center items-center gap-2 text-body-sm text-base-black font-semibold py-4'>
                  Go to Avatar Page <Icons.chevronRight />
                </p>
              </Link>

              {/* Scenario link */}
              <Link
                to={`${ROUTES.scenarios}/${chat.scenario.id}`}
                className='flex-shrink-0 flex flex-col backdrop-blur-48 bg-gradient-1 rounded-xl overflow-hidden'
              >
                <div className='w-full h-[263px] flex items-center justify-center rounded-xl bg-neutral-04'>
                  {chat.scenario.picture ? (
                    <img
                      src={getPicture(chat.scenario, 'scenarios', false)}
                      srcSet={getPicture(chat.scenario, 'scenarios', true)}
                      alt={chat.scenario.name}
                      className='size-full object-cover rounded-lg'
                    />
                  ) : (
                    <Icons.fileUploadIcon />
                  )}
                </div>
                <p className='w-full flex justify-center items-center gap-2 text-body-sm text-base-black font-semibold py-4'>
                  Go to Scenario Page <Icons.chevronRight />
                </p>
              </Link>

            {/* STT Provider */}
            <Card.Root className='sm:h-auto'>
              <Card.Label className='sm:text-heading-h4'>STT Provider</Card.Label>
              <Card.Main>
                <div className='p-4'>
                  <Select.Root
                    value={chat.sttProviderId}
                    onValueChange={(value) => {
                      const sttProvider = sttProviders?.find((p) => p.id === value);
                      if (sttProvider) handleSttProviderChange(sttProvider);
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder='Select STT Provider' />
                    </Select.Trigger>
                    <Select.Content className='max-h-[250px] overflow-y-auto'>
                      {sttProviders?.map((sttProvider) => (
                        <Select.Item key={sttProvider.id} value={sttProvider.id}>
                          {sttProvider.name} {sttProvider.dollarPerSecond === 0 && <span className='text-green-600 text-xs font-medium'>free</span>}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </div>
              </Card.Main>
            </Card.Root>

              {/* TODO: FINISH SILENT MODE PROCESS */}
              {/* Silent mode */}
              <Card.Root className='sm:h-auto'>
                <Card.Label className='sm:text-heading-h4'>Silent Mode</Card.Label>
                <Card.Main>
                  <button
                    className={cn('flex flex-row items-center gap-6 p-6 rounded-xl', {
                      'shadow-regular bg-white': silentMode,
                    })}
                    onClick={() => toggleSilentMode()}
                  >
                    <div className='text-4xl'> {silentMode ? '🤫' : '📣'}</div>
                    <div className='flex flex-col gap-1 text-left'>
                      <p className='text-body-lg font-semibold text-base-black'>Silent Mode is {silentMode ? 'On' : 'Off'}</p>
                      <p className='text-body-md text-neutral-01'>An avatar will {silentMode && 'not'} speak</p>
                    </div>
                    <div
                      className={cn('w-[40px] h-[24px] rounded-full bg-neutral-04 relative ml-auto', {
                        '!bg-base-black': silentMode,
                      })}
                    >
                    <span
                      className={cn(
                        'absolute top-1 left-1 w-[16px] h-[16px] rounded-full bg-base-white shadow-regular transition-all duration-100',
                        {
                          'translate-x-full': silentMode,
                        }
                      )}
                    ></span>
                    </div>
                  </button>
                </Card.Main>
              </Card.Root>

            {/* Doll */}
            <Card.Root className='sm:h-auto'>
              <Card.Label className='sm:text-heading-h4'>Doll</Card.Label>
              <Card.Main>
                {chat.doll ? (
                  <Link to={`${ROUTES.dolls}/${chat.doll.id}`} className='m-1 mb-0.5 block h-[152px] rounded-xl relative bg-neutral-04'>
                    {chat.doll.picture ? (
                      <img
                        src={getPicture(chat.doll, 'dolls', false)}
                        srcSet={getPicture(chat.doll, 'dolls', true)}
                        alt={chat.doll.name || 'Doll'}
                        className='size-full object-cover rounded-xl'
                      />
                    ) : chat.doll.dollBody?.picture ? (
                      <img
                        src={getPicture(chat.doll.dollBody, 'doll-bodies', false)}
                        srcSet={getPicture(chat.doll.dollBody, 'doll-bodies', true)}
                        alt={chat.doll.dollBody.name || 'Doll Body'}
                        className='size-full object-cover rounded-xl'
                      />
                    ) : (
                      <div className='flex items-center justify-center size-full'>
                        <Icons.fileUploadIcon />
                      </div>
                    )}
                  </Link>
                ) : (
                  <div className='m-1 mb-0.5 flex items-center justify-center h-[80px] rounded-xl bg-neutral-04/50'>
                    <p className='text-body-sm text-neutral-02'>No doll connected</p>
                  </div>
                )}

                <div className='m-1 bg-white rounded-xl'>
                  {chat.doll && (
                    <>
                      <div className='p-4 flex items-center justify-between gap-2'>
                        <div className='min-w-0'>
                          <h4 className='text-body-md font-semibold text-base-black truncate'>{chat.doll.name || chat.doll.dollBody?.name || 'Unnamed Doll'}</h4>
                          <p className='text-body-sm text-neutral-01 truncate'>{chat.doll.macAddress}</p>
                        </div>
                        <div className='flex items-center gap-1.5 flex-shrink-0'>
                          <span className={cn('size-2 rounded-full', chat.doll.online ? 'bg-green-500' : 'bg-neutral-03')} />
                          <span className='text-xs text-neutral-01'>{chat.doll.online ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                      <div className='w-full border border-neutral-04' />
                    </>
                  )}
                  <div className='p-4'>
                    <Select.Root value={chat.doll?.id || 'none'} onValueChange={handleDollChange}>
                      <Select.Trigger>
                        <Select.Value placeholder='Select a doll' />
                      </Select.Trigger>
                      <Select.Content className='max-h-[250px] overflow-y-auto'>
                        <Select.Item value='none'>None</Select.Item>
                        {dolls?.map((doll) => (
                          <Select.Item key={doll.id} value={doll.id}>
                            {doll.name || doll.macAddress}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </div>
                </div>
              </Card.Main>
            </Card.Root>

              <div className='pt-10 mt-auto flex gap-2'>
                <Button.Root type='button' disabled={isUpdatingChat} className='flex-1' onClick={handleResetChat}>
                  {isUpdatingChat ? <Icons.loading className='size-4' /> : 'Reset'}
                </Button.Root>
                <Button.Root type='button' variant='danger' disabled={isDeletingChat} className='flex-1' onClick={handleDeleteChat}>
                  {isDeletingChat ? <Icons.loading className='size-4' /> : 'Delete'}
                </Button.Root>
              </div>
            </div>
          </motion.div>
      </div>
    </>
  );
}