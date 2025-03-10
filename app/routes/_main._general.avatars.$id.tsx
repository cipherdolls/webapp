import { Form, Link, redirect, useFetcher, useRouteLoaderData } from 'react-router';
import type { Avatar, Chat, User } from '~/types';
import ChatDestroy from './chats.$id.destroy';
import type { Route } from './+types/_main._general.avatars.$id';
import { Icons } from '~/components/ui/icons';
import { useEffect, useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import { PATHS, PICTURE_SIZE } from '~/constants';
import DeleteAvatarModal from '~/components/deleteAvatarModal';
import PublishAvatarModal from '~/components/publishAvatarModal';
import * as Button from '~/components/ui/button/button';
import PlayerButton from '~/components/PlayerButton';
import ReactMarkdown from 'react-markdown';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
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
    <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full '>
      <div className='flex items-center justify-between sm:px-0 px-4.5'>
        <Link to={'/'} className='flex items-center gap-3 sm:gap-4'>
          <Icons.chevronLeft />
          <div className='flex sm:items-center sm:flex-row flex-col sm:gap-3 gap-1'>
            <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black'>{avatar.name}</h3>
            <span className='text-neutral-01 text-body-lg sm:block hidden'>•</span>
            <span className='text-neutral-01 text-body-sm sm:text-body-lg'>{getTextAfterThe(avatar.shortDesc)}</span>
          </div>
        </Link>
        <div className='md:flex hidden items-center gap-3'>
          <fetcher.Form method='POST' action='/avatars/new'>
            <input hidden readOnly id='name' name='name' defaultValue={`${avatar.name} copy`} />
            <input hidden readOnly id='character' name='character' defaultValue={avatar.character} />
            <input hidden readOnly id='ttsVoiceId' name='ttsVoiceId' defaultValue={avatar.ttsVoiceId} />
            <input hidden readOnly id='shortDesc' name='shortDesc' defaultValue={avatar.shortDesc} />
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
        {/* TODO: How is this gonna work? */}
        <div className='md:hidden flex'>
          <Icons.more />
        </div>
      </div>
      <div className='flex sm:flex-row flex-col-reverse md:gap-0 sm:gap-8 sm:flex-1 sm:divide-x divide-neutral-04 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 sm:backdrop-blur-none sm:bg-none sm:rounded-none rounded-xl pb-2.5'>
        <div className='sm:pr-4 flex size-full'>
          <div className='sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-xl p-5 flex flex-col gap-5 flex-1 h-max text-body-md text-base-black'>
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
            <label className='sm:h-60 h-[263px] w-full bg-none sm:bg-transparent bg-neutral-04 sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'>
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
            <div className='absolute bottom-3 left-3'>
              <PlayerButton variant='white' className='shadow-bottom-level-1' audioSrc={PATHS.ttsVoice(avatar.ttsVoiceId)} />
            </div>
          </div>
          <div className='sm:flex hidden flex-col gap-5'>
            <h1 className='text-base-black text-heading-h3 font-semibold'>Creator</h1>
            <div className='p-6 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-xl flex items-center gap-6'>
              <h2 className='text-heading-h2'>{isPublished ? '👥' : '💖'}</h2>
              <div className='flex flex-col gap-1'>
                <p className='text-body-lg font-semibold text-base-black text-left line-clamp-1'>
                  {isPublished ? 'Published' : 'Your Special'}
                </p>
                <span className='text-body-md text-neutral-01 text-left line-clamp-1'>
                  {me.id === avatar.userId ? 'Made by you' : avatar.userId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
