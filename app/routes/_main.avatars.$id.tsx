import { Form, Link, redirect } from 'react-router';
import type { Avatar, Chat } from '~/types';
import ChatDestroy from './chats.$id.destroy';
import type { Route } from './+types/_main.avatars.$id';
import AvatarDestroy from './avatars.$id.destroy';
import { Icons } from '~/components/ui/icons';
import { useEffect, useRef, useState } from 'react';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import { PICTURE_SIZE } from '~/constants';
import DeleteAvatarModal from '~/components/deleteAvatarModal';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const avatarId = params.id;
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const headers = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const res = await fetch(`${backendUrl}/avatars/${avatarId}`, headers);
    return await res.json();
  } catch (error) {
    return redirect('/signin');
  }
}

export default function AvatarShow({ loaderData }: Route.ComponentProps) {
  const avatar: Avatar = loaderData;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [availability, setAvailability] = useState<'private' | 'public'>('private');
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preventFileOpen, setPreventFileOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    if (preventFileOpen) {
      e.preventDefault();
      setPreventFileOpen(false);
      return;
    }
  };

  const handleTrashClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedImage(null);

    setPreventFileOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(avatar.character);
    setCopied(true);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    const timeoutId = setTimeout(() => setCopied(false), 2000);
    copyTimeoutRef.current = timeoutId;
  };

  return (
    <div className='flex flex-col sm:gap-10 gap-4 md:gap-16 w-full'>
      <div className='flex items-center justify-between sm:px-0 px-4.5'>
        <Link to={'/'} className='flex items-center gap-3 sm:gap-4'>
          <Icons.chevronLeft />
          <div className='flex sm:items-center sm:flex-row flex-col sm:gap-3 gap-1'>
            <h3 className='text-body-sm font-semibold sm:text-heading-h3 text-base-black'>{avatar.name}</h3>
            <span className='text-neutral-01 text-body-lg sm:block hidden'>•</span>
            <span className='text-neutral-01 text-body-sm sm:text-body-lg'>Fun cipherdoll</span>
          </div>
        </Link>
        <div className='md:flex hidden items-center gap-3'>
          <button className='bg-neutral-04 py-3.5 w-[130px] flex items-center justify-center text-body-md font-semibold text-base-black rounded-full'>
            Duplicate
          </button>
          <Link
            to={`/avatars/${avatar.id}/edit`}
            className='bg-neutral-04 py-3.5 w-[130px] flex items-center justify-center text-body-md font-semibold text-base-black rounded-full'
          >
            Edit
          </Link>
          <DeleteAvatarModal />
        </div>
        {/* TODO: How is this gonna work? */}
        <div className='md:hidden flex'>
          <Icons.more />
        </div>
      </div>
      <div className='flex sm:flex-row flex-col-reverse md:gap-0 sm:gap-8 sm:flex-1 sm:divide-x divide-neutral-04 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48 sm:backdrop-blur-none sm:bg-none sm:rounded-none rounded-xl'>
        <div className='sm:pr-4 flex size-full'>
          <div className='sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-xl p-5 flex flex-col gap-5 flex-1 h-max'>
            <div className='flex items-center justify-between'>
              <h3 className='text-heading-h4 sm:text-heading-h3 text-base-black'>Characteristic</h3>
              <div className='flex items-center gap-2'>
                {copied && <span className='text-body-sm font-semibold text-base-black'>Copied</span>}
                <button onClick={handleCopyToClipboard} title='Copy to clipboard' className='hover:opacity-80 transition-opacity'>
                  {copied ? <Icons.copied /> : <Icons.copy />}
                </button>
              </div>
            </div>
            <p className='text-body-md text-base-black'>{avatar.character}</p>
          </div>
        </div>
        <div className='sm:pl-4 sm:max-w-[352px] flex size-full flex-col gap-10'>
          <label
            className='h-60 w-full bg-none sm:bg-transparent bg-neutral-04 sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] sm:backdrop-blur-48 flex flex-col justify-end items-center gap-3.5 rounded-xl cursor-pointer relative'
            onClick={handleLabelClick}
          >
            <input ref={fileInputRef} className='hidden' type='file' name='avatar' accept='image/*' onChange={handleImageChange} />
            {selectedImage ? (
              <div className='size-full'>
                <img src={selectedImage} alt='Selected avatar' className='size-full object-cover rounded-lg' />
              </div>
            ) : avatar.picture ? (
              <div className='size-full'>
                <img
                  src={getPicture(avatar, 'avatars', false, PICTURE_SIZE.avatar)}
                  srcSet={getPicture(avatar, 'avatars', true, PICTURE_SIZE.avatar)}
                  alt={avatar.name}
                  className='size-full object-cover rounded-lg'
                />
              </div>
            ) : (
              <div className='flex items-center justify-center size-full'>
                <Icons.fileUploadIcon />
              </div>
            )}
            <div className='absolute z-10 bottom-3 px-3 w-full'>
              <div className='flex items-center justify-between w-full'>
                <div className='size-10 flex items-center justify-center bg-base-white shadow-bottom-level-1 rounded-full'>
                  <Icons.sound />
                </div>
                <div
                  className={cn(
                    'py-2 px-5 flex items-center justify-center bg-base-white shadow-bottom-level-1 rounded-full',
                    (selectedImage || avatar.picture) && 'divide-x divide-neutral-04 gap-4'
                  )}
                >
                  {(selectedImage || avatar.picture) && (
                    <button type='button' className='pr-4 relative z-10' onClick={handleTrashClick}>
                      <Icons.trash className='text-black' />
                    </button>
                  )}
                  <Icons.fileUpload />
                </div>
              </div>
            </div>
          </label>
          <div className='sm:flex hidden flex-col gap-5'>
            <h1 className='text-base-black text-heading-h3 font-semibold sm:block hidden'>Availability</h1>
            <div className='p-1 bg-none sm:bg-transparent bg-neutral-04 sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] grid grid-cols-2 rounded-xl'>
              <button
                type='button'
                className={cn(
                  'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                  availability === 'private' ? 'bg-white' : 'bg-transparent'
                )}
                onClick={() => setAvailability('private')}
              >
                🔒 Private
              </button>
              <button
                type='button'
                className={cn(
                  'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
                  availability === 'public' ? 'bg-white' : 'bg-transparent'
                )}
                onClick={() => setAvailability('public')}
              >
                🌐 Public
              </button>
            </div>
          </div>
          <div className='sm:flex hidden flex-col gap-5'>
            <h1 className='text-base-black text-heading-h3 font-semibold'>Creator</h1>
            <div className='p-6 bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-xl flex items-center gap-6'>
              <h2 className='text-heading-h2'>💖</h2>
              <div className='flex flex-col gap-1'>
                <p className='text-body-lg font-semibold text-base-black text-left line-clamp-1'>Your Special</p>
                <span className='text-body-md text-neutral-01 text-left'>Made by you</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex sm:hidden flex-col gap-5 sm:static absolute w-full sm:w-auto left-0 px-4.5 pt-4.5 sm:px-0 sm:pt-0 sm:pb-0 pb-8 sm:rounded-t-none rounded-t-xl bottom-0 sm:bg-none bg-[linear-gradient(86.23deg,rgba(254,253,248,0.48)_0%,rgba(255,255,255,0.48)_100%)] shadow-bottom-bar backdrop-blur-48'>
        <h1 className='text-base-black text-heading-h3 font-semibold sm:block hidden'>Availability</h1>
        <div className='p-1 bg-none sm:bg-transparent bg-neutral-04 sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] grid grid-cols-2 rounded-xl'>
          <button
            type='button'
            className={cn(
              'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
              availability === 'private' ? 'bg-white' : 'bg-transparent'
            )}
            onClick={() => setAvailability('private')}
          >
            🔒 Private
          </button>
          <button
            type='button'
            className={cn(
              'flex items-center justify-center py-3 text-body-sm font-semibold rounded-xl transition-colors',
              availability === 'public' ? 'bg-white' : 'bg-transparent'
            )}
            onClick={() => setAvailability('public')}
          >
            🌐 Public
          </button>
        </div>
      </div>
    </div>
  );
}
