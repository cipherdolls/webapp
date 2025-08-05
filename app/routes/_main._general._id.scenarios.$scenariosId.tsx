import type { Route } from './+types/_main._general._id.scenarios.$scenariosId';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { Form, Link, Outlet, useNavigate, useRouteLoaderData } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { getPicture } from '~/utils/getPicture';
import type { User } from '~/types';
import DeleteModal from '~/components/ui/deleteModal';
import { formatModelName } from '~/utils/formatModelName';
import DetailCard from '~/components/ui/detail/detail-card';
import DetailRow from '~/components/ui/detail/detail-row';
import { formatNumberWithCommas } from '~/utils/formatNumberWithCommas';
import { ViewMore } from '~/view-more';
import * as Accordion from '@radix-ui/react-accordion';
import { scientificNumConvert } from '~/utils/scientificNumConvert';
import { formatDate } from '~/utils/date.utils';
import SelectAvatarModal from '~/components/SelectAvatarModal';
import Tooltip from '~/components/ui/tooltip';

import React, { useMemo, useState } from 'react';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { useScenario } from '~/hooks/queries/scenarioQueries';
import { useDeleteScenario } from '~/hooks/queries/scenarioMutations';
import { useUserEvents } from '~/hooks/useUserEvents';
import { useCreateChat } from '~/hooks/queries/chatMutations';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Scenario Details' }];
}

export default function ScenariosId({ params }: Route.ComponentProps) {
  const me = useRouteLoaderData('routes/_main') as User;
  const navigate = useNavigate();
  const { data: mineAvatarsData } = useAvatars({ mine: 'true' });
  const { data: scenarioData, isLoading } = useScenario(params.scenariosId);
  const { mutate: deleteScenario } = useDeleteScenario();
  const { mutate: createChat } = useCreateChat();

  const mineAvatars = useMemo(() => mineAvatarsData?.data || [], [mineAvatarsData]);
  const scenario = useMemo(() => scenarioData || null, [scenarioData]);

  const [showAll, setShowAll] = useState(false);

  const mineAvatarsList = mineAvatars;
  const avatars = scenario?.avatars ? scenario.avatars : [];
  const hasAvatars = avatars.length > 0;

  useUserEvents(me.id, {
    onProcessEvent: (processEvent) => {
      if (
        processEvent.resourceName === 'Scenario' &&
        processEvent.resourceId === scenario?.id &&
        processEvent.jobName === 'updated' &&
        processEvent.jobStatus === 'completed'
      ) {
        window.location.reload();
      }
    },
  });

  if (isLoading || !scenario) {
    return null;
  }

  const createdDate = formatDate(scenario.createdAt);
  const updatedDate = formatDate(scenario.updatedAt);

  const handleDeleteScenario = () => {
    deleteScenario(scenario.id, {
      onSuccess: () => {
        navigate(`/scenarios?mine=true`);
      },
    });
  };

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  const handleCreateChat = (avatarId: string) => {
    createChat(
      {
        avatarId: avatarId,
        scenarioId: scenario.id,
      },
      {
        onSuccess: (newChat) => {
          navigate(`/chats/${newChat.id}`);
        },
      }
    );
  };

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between sm:px-0 px-4.5 gap-5'>
          <Link to={`${scenario.userId === me.id ? '/scenarios?mine=true' : '/scenarios'}`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft className='hover:bg-white/40 rounded-full' />
            <div className='flex items-center gap-3 break-all flex-wrap'>
              <h3 className='font-semibold text-body-md text-base-black hover:underline transition-all duration-200 sm:text-heading-h3'>
                {formatModelName(scenario.name)}
              </h3>
              <span className='text-body-md text-neutral-01 word sm:text-body-lg'>•</span>
              <span className='text-body-md text-neutral-01 sm:text-body-lg'>Scenarios</span>
            </div>
          </Link>

          <div className='md:flex hidden items-center gap-3'>
            {mineAvatarsList.length > 0 && (
              <SelectAvatarModal
                avatars={mineAvatarsList}
                scenario={scenario}
                triggerContent={
                  <Button.Root variant='primary' className='px-6'>
                    Add to My Avatar
                  </Button.Root>
                }
              />
            )}
            {me.id === scenario.userId && (
              <>
                <Link to={`/scenarios/${scenario.id}/edit`}>
                  <Button.Root variant='secondary' className='w-[130px]'>
                    Edit
                  </Button.Root>
                </Link>
                <DeleteModal title={`Delete scenario ${scenario.name}?`} description='You will not be able to restore the data.'>
                  <Button.Root type='button' variant='danger' className='w-full' onClick={handleDeleteScenario}>
                    Yes, delete
                  </Button.Root>
                </DeleteModal>
              </>
            )}
          </div>
          <div className='md:hidden flex text-base-black'>
            <ViewMore
              userId={scenario.userId}
              popoverItems={[
                {
                  type: 'link',
                  text: 'Edit',
                  href: `/scenarios/${scenario.id}/edit`,
                  visible: me.id === scenario.userId,
                },
                {
                  type: 'addToChat',
                  text: 'Add to My Avatar',
                  avatars: mineAvatarsList,
                  scenario: scenario,
                },
                {
                  type: 'component',
                  text: 'Delete',
                  isDelete: true,
                  component: (
                    <DeleteModal
                      dropdown
                      title={`Delete scenario ${scenario.name}?`}
                      description='You will not be able to restore the data.'
                    >
                      <Button.Root type='button' variant='danger' className='w-full' onClick={handleDeleteScenario}>
                        Yes, delete
                      </Button.Root>
                    </DeleteModal>
                  ),
                  visible: me.id === scenario.userId,
                },
              ]}
            />
          </div>
        </div>
        <div className='flex flex-col-reverse rounded-xl divide-neutral-04 pb-2.5 gap-5 sm:flex-1 sm:backdrop-blur-none md:gap-0 sm:bg-none sm:rounded-none md:divide-x md:flex-row'>
          <div className='flex size-full flex-col gap-5 md:pr-4'>
            <DetailCard title='' copy={false} copyText={scenario.introduction} isScenario={true}>
              {scenario.introduction && <ReactMarkdown>{scenario.introduction}</ReactMarkdown>}
            </DetailCard>

            <div className={'bg-gradient-1 rounded-xl p-2 pt-2 flex flex-col'}>
              {hasAvatars ? (
                <div className='flex flex-col gap-5'>
                  <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2'>
                    {avatars.map((avatar, index) => (
                      <div className={`${!showAll && index >= 4 ? 'hidden' : 'transition-all duration-500 ease-out'}`} key={index}>
                        <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                          <Link
                            to={`/scenarios/${scenario.id}`}
                            className='block h-[200px] sm:h-[152px] lg:h-[120px] rounded-xl bg-black relative'
                          >
                            <img
                              src={getPicture(avatar, 'avatars', false)}
                              srcSet={getPicture(avatar, 'avatars', true)}
                              alt={`${avatar.name} picture`}
                              className='object-cover size-full'
                            />

                            <div className='absolute top-2 left-2 z-10'>
                              <div className='flex items-center gap-2'>
                                {avatar.userId === me.id && (
                                  <span className='text-xs bg-neutral-04 text-neutral-01 px-2 py-1 rounded-full'>👤</span>
                                )}
                                {avatar.published && (
                                  <span className='px-2 py-1 text-xs bg-base-black text-white rounded-full'>Published</span>
                                )}
                              </div>
                            </div>
                          </Link>

                          <div className='p-3 flex lg:items-center gap-5 justify-between flex-1'>
                            <div className='flex flex-col gap-1 min-w-0 flex-1'>
                              <h4 className='text-body-sm font-semibold text-base-black truncate'>{avatar.name}</h4>

                              <p className='truncate text-body-sm font-semibold text-neutral-01'>{avatar.character}</p>
                            </div>
                            <div className='flex items-center gap-3'>
                              {avatar?.chats && avatar?.chats.length > 0 ? (
                                <Button.Root size='sm' className='px-5' asChild>
                                  <Link to={`/chats/${avatar.chats[0].id}`}>Continue Chat</Link>
                                </Button.Root>
                              ) : (
                                <Button.Root type='button' size='sm' className='px-5' onClick={() => handleCreateChat(avatar.id)}>
                                  Chat
                                </Button.Root>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {avatars.length > 4 && (
                    <div className='mx-auto -mt-2'>
                      <Button.Root variant='secondary' className='px-4 h-10 gap-2' onClick={handleShowAll}>
                        {showAll ? 'Collapse' : 'Show all'}
                        <Button.Icon
                          as={Icons.chevronDown}
                          className={`size-6 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                        />
                      </Button.Root>
                    </div>
                  )}
                </div>
              ) : (
                <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
                  <h1 className='text-heading-h2'>📚</h1>
                  <div className='flex flex-col items-center sm:gap-2 gap-1'>
                    <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Scenarios Yet</h4>
                    <Link
                      to='/scenarios'
                      className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
                    >
                      Add new scenario
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='flex size-full flex-col gap-5 md:pl-4 md:max-w-[310px]'>
            <div className='relative'>
              <label className='sm:h-60 h-[263px] w-full bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl relative'>
                {scenario.picture ? (
                  <div className='size-full'>
                    <img
                      src={getPicture(scenario, 'scenarios', false)}
                      srcSet={getPicture(scenario, 'scenarios', true)}
                      alt={scenario.name}
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
            <DetailCard isScenario title='Chat Model' className='pb-3'>
              <div className='flex flex-col'>
                <div className='flex flex-col gap-4 pb-[18px]'>
                  <DetailRow title='Name' value={formatModelName(scenario.chatModel?.providerModelName || 'N/A')} />
                  <DetailRow title='AI Provider Name' value={formatModelName(scenario.chatModel?.aiProvider?.name || 'N/A')} />
                  <DetailRow title='Context Window' value={`${formatNumberWithCommas(scenario.chatModel?.contextWindow || 0)} token`} />
                  <DetailRow title='Censored' value={scenario.chatModel?.censored ? 'Yes' : 'No'} />
                  <DetailRow
                    title='Input Token Cost'
                    value={`$${scientificNumConvert((scenario.chatModel?.dollarPerInputToken || 0) * 1000000)}`}
                  />
                  <DetailRow
                    title='Output Token Cost'
                    value={`$${scientificNumConvert((scenario.chatModel?.dollarPerOutputToken || 0) * 1000000)}`}
                  />

                  {scenario.chatModel?.error && (
                    <div className='flex gap-1 overflow-hidden'>
                      <DetailRow title='Embedding Error' value={''} />
                      <Tooltip
                        side={'top'}
                        trigger={<Icons.warning className='size-4 text-specials-danger' />}
                        content={scenario.chatModel.error}
                        popoverClassName='max-w-[320px]'
                        className={'max-w-[310px]'}
                      />
                    </div>
                  )}
                </div>
                <Accordion.Root type='single' collapsible className='w-full'>
                  <Accordion.Item value='parameters'>
                    <Accordion.Trigger className='flex items-center justify-center w-full py-2 text-sm font-medium text-neutral-01 hover:text-base-black transition-colors group'>
                      <span className='group-data-[state=closed]:block group-data-[state=open]:hidden'>Show Details</span>
                      <span className='group-data-[state=closed]:hidden group-data-[state=open]:block'>Hide Details</span>
                      <Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180' />
                    </Accordion.Trigger>
                    <Accordion.Content className='overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'>
                      <div className='flex flex-col gap-4 pt-[18px]'>
                        <DetailRow title='Temperature' value={scenario.temperature} />
                        <DetailRow title='TopP' value={scenario.topP} />
                        <DetailRow title='Frequency Penalty' value={scenario.frequencyPenalty} />
                        <DetailRow title='Presence Penalty' value={scenario.presencePenalty} />
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>
            </DetailCard>
            <DetailCard isScenario title='Embedding Model'>
              <div className='flex flex-col gap-4'>
                <DetailRow title='Name' value={formatModelName(scenario.embeddingModel?.providerModelName || 'N/A')} />
                <DetailRow title='AI Provider Name' value={formatModelName(scenario.embeddingModel?.aiProvider?.name || 'N/A')} />
                <DetailRow
                  title='Input Token Cost'
                  value={`$${scientificNumConvert((scenario.embeddingModel?.dollarPerInputToken || 0) * 1000000)}`}
                />
                <DetailRow
                  title='Output Token Cost'
                  value={`$${scientificNumConvert((scenario.embeddingModel?.dollarPerOutputToken || 0) * 1000000)}`}
                />

                {scenario.embeddingModel?.error && (
                  <div className='flex justify-between w-full gap-1 overflow-hidden'>
                    <DetailRow title='Embedding Error' value={''} />

                    <Tooltip
                      side={'top'}
                      trigger={<Icons.warning className='size-4 text-specials-danger' />}
                      content={scenario.embeddingModel.error}
                      popoverClassName='max-w-[320px]'
                      className={'max-w-[310px]'}
                    />
                  </div>
                )}
              </div>
            </DetailCard>
            <DetailCard isScenario title='Reasoning Model'>
              {scenario.reasoningModel ? (
                <div className='flex flex-col gap-4'>
                  <DetailRow title='Name' value={formatModelName(scenario.reasoningModel.providerModelName)} />
                  <DetailRow title='AI Provider Name' value={formatModelName(scenario.reasoningModel.aiProvider?.name)} />
                  <DetailRow
                    title='Input Token Cost'
                    value={`$${scientificNumConvert(scenario.reasoningModel.dollarPerInputToken * 1000000)}`}
                  />
                  <DetailRow
                    title='Output Token Cost'
                    value={`$${scientificNumConvert(scenario.reasoningModel.dollarPerOutputToken * 1000000)}`}
                  />

                  {scenario.reasoningModel?.error && (
                    <div className='flex gap-1 overflow-hidden'>
                      <DetailRow title='Embedding Error' value={''} />
                      <Tooltip
                        side={'top'}
                        trigger={<Icons.warning className='size-4 text-specials-danger' />}
                        content={scenario.reasoningModel.error}
                        popoverClassName='max-w-[320px]'
                        className={'max-w-[310px]'}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-neutral-01 text-body-sm'>No reasoning model configured</p>
              )}
            </DetailCard>
            <DetailCard isScenario>
              <div className='flex flex-col gap-4'>
                <DetailRow title='Created at: ' value={createdDate} />
                <DetailRow title='Updated at:' value={updatedDate} />
              </div>
            </DetailCard>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
