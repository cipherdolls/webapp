import type { Route } from './+types/_main._general._id.scenarios.$scenariosId';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { Link, Outlet, useNavigate, useRouteLoaderData } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { getPicture } from '~/utils/getPicture';
import type { User } from '~/types';
import DeleteModal from '~/components/ui/deleteModal';
import { formatModelName } from '~/utils/formatModelName';
import DetailCard from '~/components/ui/detail/detail-card';
import DetailRow from '~/components/ui/detail/detail-row';
import { ViewMore } from '~/view-more';
import { formatDate } from '~/utils/date.utils';
import SelectAvatarModal from '~/components/SelectAvatarModal';

import React, { useMemo, useState } from 'react';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { useScenario } from '~/hooks/queries/scenarioQueries';
import { useDeleteScenario } from '~/hooks/queries/scenarioMutations';
import { useCreateChat } from '~/hooks/queries/chatMutations';
import { useSponsorships } from '~/hooks/queries/sponsorshipQueries';
import ErrorPage from '~/components/ErrorPage';
import { useAlert } from '~/providers/AlertDialogProvider';
import { ROUTES, TOKEN_BALANCE } from '~/constants';
import IntroductionSkeleton from '~/components/ui/IntroductionSkeleton';
import SponsorshipSection from '~/components/SponsorshipSection';
import ModelTabsCard from '~/components/ModelTabsCard';
import { useAuthStore } from '~/store/useAuthStore';
import { useUser } from '~/hooks/queries/userQueries';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Scenario Details' }];
}

export default function ScenariosId({ params }: Route.ComponentProps) {
  const me = useRouteLoaderData('routes/_main') as User;
  const navigate = useNavigate();
  const { data: mineAvatarsData, isLoading: isLoadingMineAvatars } = useAvatars({ mine: 'true' });
  const { data: scenarioData, isLoading, error: scenarioError } = useScenario(params.scenariosId);
  const { data: sponsorshipsData } = useSponsorships({ scenarioId: params.scenariosId });
  const { mutate: deleteScenario } = useDeleteScenario();
  const { mutate: createChat } = useCreateChat();
  const alert = useAlert();
  const { data: currentUser } = useUser();
  const { isUsingBurnerWallet } = useAuthStore();

  const mineAvatars = useMemo(() => mineAvatarsData?.data || [], [mineAvatarsData]);
  const scenario = useMemo(() => scenarioData || null, [scenarioData]);
  const sponsorships = useMemo(() => sponsorshipsData || [], [sponsorshipsData]);
  const userHasSponsored = useMemo(() => sponsorships.some((s) => s.userId === me.id), [sponsorships, me.id]);
  const isSponsored = useMemo(() => Boolean(sponsorships.length), [sponsorships]);
  const hasMinimumTokens = isUsingBurnerWallet || (currentUser?.tokenSpendable || 0) >= TOKEN_BALANCE.MINIMUM_SPENDABLE;
  const isChatDisabled = !isUsingBurnerWallet && !isSponsored && !hasMinimumTokens;

  const [showAll, setShowAll] = useState(false);

  const mineAvatarsList = mineAvatars;
  const avatars = scenario?.avatars ? scenario.avatars : [];
  const hasAvatars = avatars.length > 0;

  // useUserEvents(me.id, {
  //   onProcessEvent: (processEvent) => {
  //     if (
  //       processEvent.resourceName === 'Scenario' &&
  //       processEvent.resourceId === scenario?.id &&
  //       processEvent.jobName === 'updated' &&
  //       processEvent.jobStatus === 'completed'
  //     ) {
  //       window.location.reload();
  //     }
  //   },
  // });

  if (isLoading) {
    return null;
  }

  if (scenarioError || !scenario) {
    return <ErrorPage code={scenarioError?.code} message={scenarioError?.message} />;
  }
  const createdDate = formatDate(scenario.createdAt);
  const updatedDate = formatDate(scenario.updatedAt);

  const handleDeleteScenario = () => {
    deleteScenario(scenario.id, {
      onSuccess: () => {
        navigate(`${ROUTES.scenarios}?mine=true`);
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
          navigate(`${ROUTES.chats}/${newChat.id}`);
        },
        onError: (error: any) => {
          alert({
            icon: '💰',
            title: 'Insufficient Tokens',
            body: error?.message || `You need at least ${TOKEN_BALANCE.MINIMUM_SPENDABLE} LOV tokens to start a chat. Please add more tokens to continue.`,
          });
        },
      }
    );
  };

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
        <div className='flex items-center justify-between sm:px-0 px-4.5 gap-5'>
          <Link
            to={`${scenario.userId === me.id ? `${ROUTES.scenarios}?mine=true` : ROUTES.scenarios}`}
            className='flex items-center gap-3 sm:gap-4'
          >
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
            {!isLoadingMineAvatars && mineAvatarsList.length > 0 && (
              <SelectAvatarModal
                avatars={mineAvatarsList}
                scenario={scenario}
                triggerContent={
                  <Button.Root variant='primary' className='px-6' disabled={isChatDisabled}>
                    Add to My Avatar
                  </Button.Root>
                }
              />
            )}
            {me.id === scenario.userId && (
              <>
                <Link to={`${ROUTES.scenarios}/${scenario.id}/edit`}>
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
                  href: `${ROUTES.scenarios}/${scenario.id}/edit`,
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
              {scenario.introduction && scenario.introduction.trim() ? (
                <ReactMarkdown>{scenario.introduction}</ReactMarkdown>
              ) : (
                <IntroductionSkeleton />
              )}
            </DetailCard>

            <div className={'bg-gradient-1 rounded-xl p-2 pt-2 flex flex-col'}>
              {hasAvatars ? (
                <div className='flex flex-col gap-5'>
                  <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2'>
                    {avatars.map((avatar, index) => (
                      <div className={`${!showAll && index >= 4 ? 'hidden' : 'transition-all duration-500 ease-out'}`} key={index}>
                        <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                          <Link
                            to={`${ROUTES.avatars}/${avatar.id}`}
                            className='block h-[200px] sm:h-[152px] lg:h-[120px] rounded-xl bg-black relative'
                          >
                            <img
                              src={getPicture(avatar, 'avatars', false)}
                              srcSet={getPicture(avatar, 'avatars', true)}
                              alt={`${avatar.name} picture`}
                              className='object-cover size-full'
                            />

                            {/*<div className='absolute top-2 left-2 z-10'>*/}
                            {/*  <div className='flex items-center gap-2'>*/}
                            {/*    {avatar.userId === me.id && (*/}
                            {/*      <span className='text-xs bg-neutral-04 text-neutral-01 px-2 py-1 rounded-full'>👤</span>*/}
                            {/*    )}*/}
                            {/*    {avatar.published && (*/}
                            {/*      <span className='px-2 py-1 text-xs bg-base-black text-white rounded-full'>Published</span>*/}
                            {/*    )}*/}
                            {/*  </div>*/}
                            {/*</div>*/}
                          </Link>

                          <div className='p-3 flex lg:items-center gap-5 justify-between flex-1'>
                            <div className='flex flex-col gap-1 min-w-0 flex-1'>
                              <h4 className='text-body-sm font-semibold text-base-black truncate'>{avatar.name}</h4>

                              <p className='truncate text-body-sm font-semibold text-neutral-01'>{avatar.shortDesc}</p>
                            </div>
                            <div className='flex items-center gap-3'>
                              {avatar?.chats && avatar?.chats.length > 0 ? (
                                <Button.Root size='sm' className='px-5' asChild>
                                  <Link to={`${ROUTES.chats}/${avatar.chats[0].id}`}>Continue Chat</Link>
                                </Button.Root>
                              ) : (
                                <Button.Root
                                  type='button'
                                  size='sm'
                                  className='px-5'
                                  onClick={() => handleCreateChat(avatar.id)}
                                  disabled={isChatDisabled}
                                >
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
                  <h1 className='text-heading-h2'>🤖</h1>
                  <div className='flex flex-col items-center sm:gap-2 gap-1'>
                    <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Avatars Yet</h4>
                    <Link
                      to={ROUTES.avatars}
                      className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
                    >
                      Add new avatar
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='flex size-full flex-col gap-5 md:pl-4 md:max-w-[360px]'>
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
                {scenario.type === 'ROLEPLAY' && (
                  <div className='absolute top-2 left-2 z-10 flex items-center gap-1 bg-purple-500/90 backdrop-blur-sm py-1 pl-1.5 pr-2 rounded-full text-label text-white font-semibold'>
                    🎭
                    <span>Roleplay</span>
                  </div>
                )}
              </label>
            </div>
            <ModelTabsCard
              chatModel={scenario.chatModel}
              embeddingModel={scenario.embeddingModel}
              reasoningModel={scenario.reasoningModel}
              temperature={scenario.temperature}
              topP={scenario.topP}
              frequencyPenalty={scenario.frequencyPenalty}
              presencePenalty={scenario.presencePenalty}
            />
            <SponsorshipSection
              scenarioId={scenario.id}
              sponsorships={sponsorships}
              currentUserId={me.id}
              userHasSponsored={userHasSponsored}
              isPublishedScenario={scenario.published}
            />
            <DetailCard isScenario>
              <div className='flex flex-col gap-4'>
                <DetailRow title='Created at: ' value={createdDate} />
                <DetailRow title='Updated at:' value={updatedDate} />
                {scenario.nsfw && <DetailRow title='Content Rating:' value='🔞 NSFW' />}
              </div>
            </DetailCard>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
