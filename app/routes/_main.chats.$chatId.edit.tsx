import { Link, useNavigate, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/_main.chats.$chatId.edit';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { useAlert } from '~/providers/AlertDialogProvider';
import { Card } from '~/components/card';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import type { SttProvider, User } from '~/types';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import * as Accordion from '@radix-ui/react-accordion';
import DetailRow from '~/components/ui/detail/detail-row';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import Tooltip from '~/components/ui/tooltip';
import EditScenarioModal from '~/components/editScenarioModal';
import { useDeleteChat } from '~/hooks/queries/chatMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useChat } from '~/hooks/queries/chatQueries';
import { useUpdateChat } from '~/hooks/queries/chatMutations';
import { useSttProviders } from '~/hooks/queries/sttQueries';
import { useAiProviders } from '~/hooks/queries/aiProviderQueries';
import { ROUTES } from '~/constants';
import { motion } from 'framer-motion';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat edit' }];
}

  
export default function ChatEdit({ loaderData, params }: Route.ComponentProps) {
  const { data: aiProviders } = useAiProviders();
  const { data: sttProviders, isLoading } = useSttProviders();
  const { data: chatData, refetch } = useChat(params.chatId);
  const chat = chatData;

  const me = useRouteLoaderData('routes/_main') as User;

  const { mutate: updateChat, isPending: isUpdatingChat, error: errorUpdateChat } = useUpdateChat();
  const { mutate: deleteChat, isPending: isDeletingChat, error: errorDeleteChat } = useDeleteChat();

  const navigate = useNavigate();
  const alert = useAlert();
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
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Button.Root size='icon' variant='white' className='pageModal-button-close' onClick={handleEditChatClose}>
              <Button.Icon as={Icons.close} />
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

              {/* scenario toggle  */}
              <Card.Root className='sm:h-auto'>
                <div className='flex items-center justify-between'>
                  <Card.Label className='sm:text-heading-h4'>Scenarios</Card.Label>
                  <div className='flex gap-2'>
                    {me.id === chat.scenario.userId && aiProviders && <EditScenarioModal scenario={chat.scenario} aiProviders={aiProviders.data} refetch={refetch} />}

                    <button
                      onClick={() => {
                        alert({
                          icon: '🎭',
                          title: 'Scenarios',
                          body: (
                            <>
                              💅🏻 Easy Talk - focused on casual topics with cheerful, warm, and concise responses.
                              <br />
                              <br />
                              🧐 Deep Talk - focused on meaningful topics, fostering connection through introspection and insightful
                              exchanges.
                              <br />
                              <br />
                              🔥 Sexy Talk - focused on building rapport with compliments, innuendos and flirting.
                            </>
                          ),
                        });
                      }}
                    >
                      <Icons.information className='text-pink-01' />
                    </button>
                  </div>
                </div>

                <Card.Main>
                  <div className='m-1 mb-0.5 block h-[200px] sm:h-[152px] rounded-xl relative'>
                    {chat.scenario.picture ? (
                      <div className='size-full'>
                        <img
                          src={getPicture(chat.scenario, 'scenarios', false)}
                          srcSet={getPicture(chat.scenario, 'scenarios', true)}
                          alt={chat.scenario.name}
                          className='size-full object-cover rounded-xl'
                        />
                      </div>
                    ) : (
                      <div className='flex items-center justify-center size-full'>
                        <Icons.fileUploadIcon />
                      </div>
                    )}
                  </div>

                  <div className='m-1 bg-white rounded-xl cursor-pointer hover:bg-white/80 hover:drop-shadow-md transition-all'>
                    <div className='p-4 flex gap-2 items-center justify-between'>
                      <div>
                        <h4 className='text-body-md font-semibold text-base-black'>{chat.scenario.name}</h4>
                        <p className='text-body-sm text-neutral-01'>Current scenario</p>
                      </div>
                      <div className='text-xs text-neutral-01 bg-neutral-05 px-3 py-1 rounded-full'>Active</div>
                    </div>

                    <div className='w-full  border border-neutral-04' />

                    <Accordion.Root type='single' collapsible className='w-full p-3'>
                      <Accordion.Item value='details'>
                        <Accordion.Trigger className='flex py-3 -my-3 items-center justify-center w-full  text-sm font-medium text-neutral-01 hover:text-base-black transition-colors group'>
                          <span className='group-data-[state=closed]:block group-data-[state=open]:hidden'>Show Details</span>
                          <span className='group-data-[state=closed]:hidden group-data-[state=open]:block'>Hide Details</span>
                          <Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                        </Accordion.Trigger>

                        <Accordion.Content className='overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
                          <div className='flex flex-col gap-4 pt-[18px]'>
                            {/*Chat model*/}
                            <DetailRow title='Chat Model' value={chat.scenario.chatModel.providerModelName} />
                            <DetailRow
                              title='Input Token Cost'
                              value={`${scientificNumConvert(chat.scenario.chatModel.dollarPerInputToken * 1000000)} $`}
                            />
                            <DetailRow
                              title='Output Token Cost'
                              value={`${scientificNumConvert(chat.scenario.chatModel.dollarPerOutputToken * 1000000)} $`}
                            />

                            <DetailRow title='Temperature' value={chat.scenario.temperature} />
                            <DetailRow title='TopP' value={chat.scenario.topP} />
                            <DetailRow title='Frequency Penalty' value={chat.scenario.frequencyPenalty} />
                            <DetailRow title='Presence Penalty' value={chat.scenario.presencePenalty} />

                            {chat.scenario.chatModel.error && (
                              <div className='flex gap-1'>
                                <Tooltip
                                  side={'top'}
                                  trigger={<Icons.warning className='size-4 text-specials-danger' />}
                                  content={chat.scenario.chatModel.error}
                                  popoverClassName='max-w-[320px]'
                                  className='max-w-[350px]'
                                />
                                <DetailRow title='Chat Model Error' value={chat.scenario.chatModel.error} />
                              </div>
                            )}

                            <div className='w-full  border border-neutral-04' />

                            {/*Embedding*/}
                            <DetailRow title='Embedding Model' value={chat.scenario.embeddingModel.providerModelName} />
                            <DetailRow
                              title='Input Token Cost'
                              value={`${scientificNumConvert(chat.scenario.embeddingModel.dollarPerInputToken * 1000000)} $`}
                            />
                            <DetailRow
                              title='Output Token Cost'
                              value={`${scientificNumConvert(chat.scenario.embeddingModel.dollarPerOutputToken * 1000000)} $`}
                            />

                            {chat.scenario.embeddingModel.error && (
                              <div className='flex gap-1'>
                                <Tooltip
                                  side={'top'}
                                  trigger={<Icons.warning className='size-4 text-specials-danger' />}
                                  content={chat.scenario.embeddingModel.error}
                                  popoverClassName='max-w-[320px]'
                                  className='max-w-[350px]'
                                />

                                <DetailRow title='Embedding Error' value={chat.scenario.embeddingModel.error} />
                              </div>
                            )}

                            {/*Reasoning*/}
                            {chat.scenario.reasoningModel && (
                              <>
                                <div className='w-full  border border-neutral-04' />

                                <DetailRow title='Reasoning Model' value={chat.scenario.reasoningModel.providerModelName} />
                                <DetailRow
                                  title='Input Token Cost'
                                  value={`${scientificNumConvert(chat.scenario.reasoningModel.dollarPerInputToken * 1000000)} $`}
                                />
                                <DetailRow
                                  title='Output Token Cost'
                                  value={`${scientificNumConvert(chat.scenario.reasoningModel.dollarPerOutputToken * 1000000)} $`}
                                />

                                {chat.scenario.reasoningModel.error && (
                                  <div className='flex gap-1'>
                                    <Tooltip
                                      side={'top'}
                                      trigger={<Icons.warning className='size-4 text-specials-danger' />}
                                      content={chat.scenario.reasoningModel.error}
                                      popoverClassName='max-w-[320px]'
                                      className='max-w-[350px]'
                                    />

                                    <DetailRow title='Reasoning Error' value={chat.scenario.reasoningModel.error} />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    </Accordion.Root>
                  </div>
                </Card.Main>
              </Card.Root>

              {/* STT Provider toggle  */}
              <Card.Root className='sm:h-auto'>
                <Card.Label className='sm:text-heading-h4'>STT Provider</Card.Label>
                <Card.Main>
                  <div className='grid grid-cols-2 gap-1  p-1 min-w-[200px]'>
                    {sttProviders?.map((sttProvider) => (
                      <button
                        key={sttProvider.id}
                        onClick={() => handleSttProviderChange(sttProvider)}
                        className={cn(
                          'flex items-center justify-center flex-1 px-4 h-[40px] text-body-sm font-semibold rounded-[10px]',
                          chat.sttProvider?.id === sttProvider.id && '!bg-base-white shadow-regular pointer-events-none'
                        )}
                      >
                        {sttProvider.name}
                      </button>
                    ))}
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

              {/* TODO: FINISH DOLL CARD WHEN DOLLS WILL BE IMPLEMENTED */}
              {/* Doll */}
              {/*<Card.Root className='sm:h-auto'>*/}
              {/*  <div className='flex items-center justify-between'>*/}
              {/*    <Card.Label className='sm:text-heading-h4'>Doll</Card.Label>*/}
              {/*  </div>*/}
              {/*  <Card.Main>*/}
              {/*    <div className={cn('flex flex-row items-center gap-6 p-6 rounded-xl')}>*/}
              {/*      <div className='text-4xl'>🤷‍♀️</div>*/}
              {/*      <div className='flex flex-col flex-start gap-1 text-left'>*/}
              {/*        <p className='text-body-lg font-semibold text-base-black'>You Have No Dolls Yet</p>*/}
              {/*        <button*/}
              {/*          className='text-body-md text-neutral-01 text-left underline'*/}
              {/*          onClick={() =>*/}
              {/*            alert({*/}
              {/*              icon: '👩 📱',*/}
              {/*              title: 'How to Add a Doll',*/}
              {/*              body: 'To add a doll, you need to create an avatar first. Then, you can add a doll to your chat by selecting the avatar from the avatar list.',*/}
              {/*            })*/}
              {/*          }*/}
              {/*        >*/}
              {/*          How to Add a Doll*/}
              {/*        </button>*/}
              {/*      </div>*/}
              {/*    </div>*/}
              {/*  </Card.Main>*/}
              {/*</Card.Root>*/}

              <div className='pt-10 mt-auto'>
                <Button.Root type='button' variant='danger' disabled={isDeletingChat} className='w-full px-10' onClick={handleDeleteChat}>
                  {isDeletingChat ? <Icons.loading className='size-4' /> : 'Delete Chat'}
                </Button.Root>
              </div>
            </div>
          </motion.div>
      </div>
    </>
  );
}