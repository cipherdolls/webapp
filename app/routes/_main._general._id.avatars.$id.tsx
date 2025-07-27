import { Form, Link, Outlet, redirect, useRouteLoaderData } from 'react-router';
import type { Avatar, User } from '~/types';
import type { Route } from './+types/_main._general._id.avatars.$id';
import { Icons } from '~/components/ui/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getPicture } from '~/utils/getPicture';
import { PATHS } from '~/constants';
import DeleteAvatarModal from '~/components/deleteAvatarModal';
import * as Button from '~/components/ui/button/button';
import PlayerButton from '~/components/PlayerButton';
import ReactMarkdown from 'react-markdown';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { ViewMore } from '~/view-more';
import AvatarScenarioModal from '~/components/AvatarScenarioModal';
import AvatarCharacterPreview from '~/components/AvatarCharacterPreview';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const avatarId = params.id;
  const res = await fetchWithAuth(`avatars/${avatarId}`);
  return await res.json();
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const avatarId = formData.get('avatarId');

    const res = await fetchWithAuth(`avatars/${avatarId}`, {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      return await res.json();
    }

    const avatar: Avatar = await res.json();
    return redirect(`/avatars/${avatar.id}`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function AvatarShow({ loaderData }: Route.ComponentProps) {
  const avatar: Avatar = loaderData;
  const me = useRouteLoaderData('routes/_main') as User;
  // const fetcher = useFetcher();
  // const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scenarios = avatar.scenarios ? avatar.scenarios : [];
  const hasScenarios = scenarios.length > 0;
  const isPublished = avatar.published;

  const sortedScenarios = useMemo(() => {
    return [...scenarios].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [scenarios]);

  // const handleCopyToClipboard = () => {
  //   navigator.clipboard.writeText(avatar.character);
  //   setCopied(true);
  //
  //   if (copyTimeoutRef.current) {
  //     clearTimeout(copyTimeoutRef.current);
  //   }
  //
  //   const timeoutId = setTimeout(() => setCopied(false), 2000);
  //   copyTimeoutRef.current = timeoutId;
  // };

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  const getTextAfterThe = (text: string): string => {
    const words = text.split(' ');

    if (words.length >= 3 && words[1].toLowerCase() === 'the') {
      return words.slice(2).join(' ');
    }

    return text;
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
        <div className='flex items-center justify-between sm:px-0 px-4.5'>
          <Link to={`${avatar.userId === me.id ? '/avatars?mine=true' : '/avatars'}`} className='flex items-center gap-3 sm:gap-4'>
            <Icons.chevronLeft />
            <div className='flex sm:items-center sm:flex-row flex-col sm:gap-3 gap-1'>
              <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black whitespace-nowrap'>{avatar.name}</h3>
              <span className='text-neutral-01 text-body-lg sm:block hidden'>•</span>
              <span className='text-neutral-01 text-body-sm sm:text-body-lg'>{getTextAfterThe(avatar.shortDesc)}</span>
            </div>
          </Link>
          <div className='md:flex hidden items-center gap-3'>
            <AvatarScenarioModal avatar={avatar}>
              <Button.Root variant='primary' className='px-6'>
                {(avatar.chats?.length || 0) > 0 ? 'Continue Chat' : 'Start Chat'}
              </Button.Root>
            </AvatarScenarioModal>

            {/*<fetcher.Form method='POST' action='/avatars/new'>*/}
            {/*  <input hidden readOnly id='name' name='name' defaultValue={`${avatar.name} copy`} />*/}
            {/*  <textarea hidden readOnly id='character' name='character' defaultValue={avatar.character} />*/}
            {/*  <input hidden readOnly id='ttsVoiceId' name='ttsVoiceId' defaultValue={avatar.ttsVoiceId} />*/}
            {/*  <input hidden readOnly id='shortDesc' name='shortDesc' defaultValue={avatar.shortDesc} />*/}
            {/*  {avatar.scenarios?.map((scenario) => (*/}
            {/*    <input key={scenario.id} hidden readOnly name='scenarioIds[]' defaultValue={scenario.id} />*/}
            {/*  ))}*/}
            {/*  <Button.Root variant='secondary' className='w-[130px]' type='submit'>*/}
            {/*    Duplicate*/}
            {/*  </Button.Root>*/}
            {/*</fetcher.Form>*/}
            {avatar.userId === me.id && (
              <>
                <Link to={`/avatars/${avatar.id}/edit`}>
                  <Button.Root variant='secondary' className='w-[130px]'>
                    Edit
                  </Button.Root>
                </Link>
                <DeleteAvatarModal />
              </>
            )}
          </div>
          <div className='md:hidden flex text-base-black'>
            <ViewMore
              userId={avatar.userId}
              popoverItems={[
                {
                  type: 'link',
                  text: 'Edit',
                  href: `/avatars/${avatar.id}/edit`,
                  visible: me.id === avatar.userId,
                },
                {
                  type: 'component',
                  text: 'Chat',
                  component: (
                    <AvatarScenarioModal avatar={avatar}>
                      <button className='w-full text-left px-3 py-2 text-body-md text-base-black hover:bg-neutral-05 rounded-lg transition-colors'>
                        {(avatar.chats?.length || 0) > 0 ? 'Continue Chat' : 'Chat'}
                      </button>
                    </AvatarScenarioModal>
                  ),
                },
                // {
                //   type: 'form',
                //   text: 'Duplicate',
                //   action: '/avatars/new',
                //   method: 'POST',
                //   formData: {
                //     name: `${avatar.name} copy`,
                //     character: avatar.character,
                //     ttsVoiceId: avatar.ttsVoiceId,
                //     shortDesc: avatar.shortDesc,
                //     'scenarioIds[]': avatar.scenarios?.map((scenario) => scenario.id) || [],
                //   },
                // },
                {
                  type: 'component',
                  text: 'Delete',
                  isDelete: true,
                  component: <DeleteAvatarModal dropdown />,
                  visible: me.id === avatar.userId,
                },
              ]}
            />
          </div>
        </div>

        <div className='flex sm:flex-row flex-col-reverse sm:gap-0 gap-5 sm:flex-1 sm:divide-x divide-neutral-04 sm:backdrop-blur-none sm:bg-none sm:rounded-none rounded-xl pb-2.5'>
          <div className='flex gap-4 flex-col sm:pr-4'>
            <div className='flex w-full h-fit flex-col gap-4'>
              <AvatarCharacterPreview message={<ReactMarkdown>{avatar.character}</ReactMarkdown>} />
            </div>

            <div className={'bg-gradient-1 rounded-xl p-2 pt-2 flex flex-col'}>
              {hasScenarios ? (
                <div className='flex flex-col gap-5'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {sortedScenarios.map((scenario, index) => (
                      <div className={`${!showAll && index >= 4 ? 'hidden' : 'transition-all duration-500 ease-out'}`} key={index}>
                        <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                          <Link
                            to={`/scenarios/${scenario.id}`}
                            className='block h-[200px] sm:h-[152px] lg:h-[120px] rounded-xl bg-black relative'
                          >
                            <img
                              src={getPicture(scenario, 'scenarios', false)}
                              srcSet={getPicture(scenario, 'scenarios', true)}
                              alt={`${scenario.name} picture`}
                              className='object-cover size-full'
                            />

                            <div className='absolute top-2 left-2 z-10'>
                              <div className='flex items-center gap-1 bg-gradient-1 py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                                🌐
                                <span>By you</span>
                              </div>
                            </div>
                          </Link>

                          <div className='p-3 flex lg:items-center gap-5 justify-between flex-1'>
                            <div className='flex flex-col gap-1 min-w-0 flex-1'>
                              <h4 className='text-body-sm font-semibold text-base-black truncate'>{scenario.name}</h4>

                              <p className='truncate text-body-sm font-semibold text-neutral-01'>{scenario.systemMessage}</p>
                            </div>
                            <div className='flex items-center gap-3'>
                              {scenario.chats && scenario.chats.length > 0 ? (
                                <Link to={`/chats/${scenario.chats[0].id}`}>
                                  <Button.Root size='sm' className='px-5'>
                                    Continue Chat
                                  </Button.Root>
                                </Link>
                              ) : (
                                <Form method='POST' action='/chats'>
                                  <input hidden name='scenarioId' id='scenarioId' value={scenario.id} readOnly />
                                  <Button.Root type='submit' size='sm' className='px-5'>
                                    Chat
                                  </Button.Root>
                                </Form>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {scenarios.length > 4 && (
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

          <div className='sm:pl-4 sm:max-w-[352px] flex size-full flex-col gap-10'>
            <div className='relative'>
              <label className='sm:h-60 h-[263px] w-full bg-none sm:bg-transparent bg-neutral-04 sm:bg-gradient-1 sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl relative'>
                {avatar.picture ? (
                  <div className='size-full'>
                    <img
                      src={getPicture(avatar, 'avatars', false)}
                      srcSet={getPicture(avatar, 'avatars', true)}
                      alt={avatar.name}
                      className='size-full object-cover rounded-lg'
                    />
                  </div>
                ) : (
                  <div className='flex items-center justify-center size-full'>
                    <Icons.fileUploadIcon />
                  </div>
                )}
              </label>
              <div className='absolute bottom-3 left-1/2 -translate-x-1/2'>
                <PlayerButton variant='white' className='shadow-bottom-level-1' audioSrc={PATHS.avatarAudio(avatar.id)} />
              </div>
            </div>
            {avatar.gender && (
              <div className='flex flex-col gap-5'>
                <h1 className='text-base-black text-heading-h3 font-semibold'>Gender</h1>
                <div className='p-6 bg-gradient-1 rounded-xl flex items-center gap-6'>
                  <h2 className='text-heading-h2'>{avatar.gender === 'Female' ? '👩🏻' : avatar.gender === 'Male' ? '🧔🏻‍♂' : '-'}</h2>
                  <div className='flex flex-col gap-1'>
                    <p className='text-body-lg font-semibold text-base-black text-left line-clamp-1'>{avatar.gender}</p>
                  </div>
                </div>
              </div>
            )}
            <div className='flex flex-col gap-5 max-sm:-mt-5'>
              <h1 className='text-base-black text-heading-h3 font-semibold'>Creator</h1>
              <div className='p-6 bg-gradient-1 rounded-xl flex items-center gap-6'>
                <h2 className='text-heading-h2'>{isPublished ? '👥' : '💖'}</h2>
                <div className='flex flex-col gap-1 min-w-0 flex-1'>
                  <p className='text-body-lg font-semibold text-base-black text-left truncate'>
                    {isPublished ? 'Published' : 'Your Special'}
                  </p>
                  <span className='text-body-md text-neutral-01 text-left truncate'>
                    {me.id === avatar.userId ? 'Made by you' : avatar.userId}
                  </span>
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
