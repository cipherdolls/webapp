import { Form, Link, Outlet, redirect, useFetcher, useRouteLoaderData } from 'react-router';
import type { Avatar, User } from '~/types';
import type { Route } from './+types/_main._general._id.avatars.$id';
import { Icons } from '~/components/ui/icons';
import { useEffect, useRef, useState } from 'react';
import { getPicture } from '~/utils/getPicture';
import { PATHS } from '~/constants';
import DeleteAvatarModal from '~/components/deleteAvatarModal';
import * as Button from '~/components/ui/button/button';
import PlayerButton from '~/components/PlayerButton';
import ReactMarkdown from 'react-markdown';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { ViewMore } from '~/view-more';
import AvatarScenarioModal from '~/components/AvatarScenarioModal';

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
  const fetcher = useFetcher();
  const me = useRouteLoaderData('routes/_main') as User;
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPublished = avatar.published;

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(avatar.character);
    setCopied(true);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    const timeoutId = setTimeout(() => setCopied(false), 2000);
    copyTimeoutRef.current = timeoutId;
  };

  const getTextAfterThe = (text: string): string => {
    const words = text.split(' ');

    if (words.length >= 3 && words[1].toLowerCase() === 'the') {
      return words.slice(2).join(' ');
    }

    return text;
  };

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
            <fetcher.Form method='POST' action='/avatars/new'>
              <input hidden readOnly id='name' name='name' defaultValue={`${avatar.name} copy`} />
              <textarea hidden readOnly id='character' name='character' defaultValue={avatar.character} />
              <input hidden readOnly id='ttsVoiceId' name='ttsVoiceId' defaultValue={avatar.ttsVoiceId} />
              <input hidden readOnly id='shortDesc' name='shortDesc' defaultValue={avatar.shortDesc} />
              {avatar.scenarios?.map((scenario) => (
                <input key={scenario.id} hidden readOnly name='scenarioIds[]' defaultValue={scenario.id} />
              ))}
              <Button.Root variant='secondary' className='w-[130px]' type='submit'>
                Duplicate
              </Button.Root>
            </fetcher.Form>
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
                {
                  type: 'form',
                  text: 'Duplicate',
                  action: '/avatars/new',
                  method: 'POST',
                  formData: {
                    name: `${avatar.name} copy`,
                    character: avatar.character,
                    ttsVoiceId: avatar.ttsVoiceId,
                    shortDesc: avatar.shortDesc,
                    'scenarioIds[]': avatar.scenarios?.map((scenario) => scenario.id) || [],
                  },
                },
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
          <div className='sm:pr-4 flex size-full flex-col gap-4'>
            <div className='bg-gradient-1 rounded-xl p-5 flex flex-col gap-5 flex-1 max-h-max text-body-md text-base-black'>
              <div className='flex items-center justify-between'>
                <h3 className='text-heading-h4 sm:text-heading-h3 text-base-black'>Characteristic</h3>
                <div className='flex items-center gap-2'>
                  {copied && <span className='text-body-sm font-semibold text-base-black'>Copied</span>}
                  <button onClick={handleCopyToClipboard} title='Copy to clipboard' className='hover:opacity-80 transition-opacity'>
                    {copied ? <Icons.copied /> : <Icons.copy />}
                  </button>
                </div>
              </div>
              <ReactMarkdown>{avatar.character}</ReactMarkdown>
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
            {avatar.scenarios && avatar.scenarios.length > 0 && (
              <div className='sm:bg-gradient-1 rounded-xl p-5 flex flex-col gap-5  max-h-max text-body-md text-base-black'>
                <div className='flex flex-col gap-4'>
                  <h3 className='text-heading-h4 sm:text-heading-h3 text-base-black'>Scenarios</h3>
                  <div className='flex flex-col gap-4'>
                    {avatar.scenarios.map((scenario) => (
                      <Link
                        to={`/scenarios/${scenario.id}`}
                        key={scenario.id}
                        className='p-4 border rounded-lg border-neutral-04 hover:border-neutral-01 transition-colors'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-semibold'>{scenario.name}</h4>
                          {scenario.recommended && (
                            <span className='px-2 py-1 text-xs bg-base-black text-white rounded-full'>Recommended</span>
                          )}
                        </div>
                        <p className='text-sm text-neutral-01 line-clamp-2'>{scenario.systemMessage}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
