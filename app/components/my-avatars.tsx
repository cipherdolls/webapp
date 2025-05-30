import React, { useState, useMemo } from 'react';
import { Form, Link } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { PICTURE_SIZE } from '~/constants';
import type { Avatar } from '~/types';
import { getPicture } from '~/utils/getPicture';
import { Icons } from './ui/icons';
import { cn } from '~/utils/cn';

const MyAvatars = ({ avatars }: { avatars: Avatar[] }) => {
  const [showAll, setShowAll] = useState(false);

  const sortedAvatars = useMemo(() => {
    return [...avatars].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [avatars]);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };

  if (sortedAvatars.length === 0) {
    return (
      <div className='flex flex-col gap-5'>
        <h3 className='text-heading-h3 text-base-black'>My Avatars</h3>
        <p className='text-body-md text-neutral-01'>No avatars found.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>My Avatars</h3>
      <div className={`grid md:gap-5 gap-3.5 ${sortedAvatars.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {sortedAvatars.map((avatar, index) => (
          <div
            className={`${
              !showAll && index >= (avatars.length > 6 ? 6 : 4)
                ? 'hidden'
                : avatars.length > 6 && !showAll && index >= 4
                  ? 'h-6 overflow-hidden relative transition-all duration-300 ease-in-out bg-gradient-to-b from-white to-transparent rounded-t-xl'
                  : 'transition-all duration-500 ease-out'
            }`}
            key={index}
          >
            <div
              className={cn(
                avatars.length > 6 && !showAll && index >= 4 ? 'px-4 py-6' : 'p-4 bg-white ',
                'shadow-bottom-level-1 rounded-xl flex lg:items-center lg:flex-row flex-col justify-between gap-4'
              )}
            >
              <div className='flex items-center gap-[18px]'>
                <div className='shrink-0'>
                  <Link to={`/avatars/${avatar.id}`}>
                    <img
                      src={getPicture(avatar, 'avatars', false, PICTURE_SIZE.avatar)}
                      srcSet={getPicture(avatar, 'avatars', true, PICTURE_SIZE.avatar)}
                      alt={avatar.name}
                      className='lg:size-20 sm:size-16 size-14 rounded-full'
                    />
                  </Link>
                </div>
                <div className='flex flex-col gap-0.5'>
                  <h4 className='text-heading-h4 text-base-black'>{avatar.name}</h4>
                  <p className='text-body-md text-neutral-01 line-clamp-2'>{avatar.shortDesc}</p>
                </div>
              </div>
              {avatar.chats.length > 0 ? (
                <Link to={`/chats/${avatar.chats[0].id}`} className='sm:mx-auto lg:mx-0'>
                  <Button.Root size='sm' className='px-5 h-10'>
                    Continue Chats
                  </Button.Root>
                </Link>
              ) : (
                <Form method='POST' action='/chats' className='lg:mx-0 sm:mx-auto'>
                  <input hidden name='avatarId' id='avatarId' value={avatar.id} readOnly />
                  <Button.Root type='submit' size='sm' className='px-7 h-10'>
                    Chat
                  </Button.Root>
                </Form>
              )}
            </div>
          </div>
        ))}
      </div>
      {avatars.length > 4 && (
        <div className='mx-auto'>
          <Button.Root variant='secondary' className='px-4 h-10 gap-2' onClick={handleShowAll}>
            {showAll ? 'Collapse' : 'Show all'}
            <Button.Icon as={Icons.chevronDown} className={`size-6 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
          </Button.Root>
        </div>
      )}
    </div>
  );
};

export default MyAvatars;
