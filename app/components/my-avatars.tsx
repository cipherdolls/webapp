import React, { useState, useMemo } from 'react';
import { Form, Link } from 'react-router';
import * as Button from '~/components/ui/button/button';
import { PATHS, PICTURE_SIZE } from '~/constants';
import type { Avatar } from '~/types';
import { getPicture } from '~/utils/getPicture';
import { Icons } from './ui/icons';
import PlayerButton from './PlayerButton';

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

  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>My Avatars</h3>

      <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5'>
        {sortedAvatars.length === 0 ? (
          <p className='text-body-md text-neutral-01 text-center md:col-span-2 col-span-1'>No avatars found.</p>
        ) : (
          sortedAvatars.map((avatar, index) => (
            <div className={`${!showAll && index >= 4 ? 'hidden' : 'transition-all duration-500 ease-out'}`} key={index}>
              <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                <Link to={`/avatars/${avatar.id}`} className='block h-[200px] sm:h-[152px] md:h-[200px] rounded-xl bg-black relative'>
                  <img
                    src={getPicture(avatar, 'avatars', false)}
                    srcSet={getPicture(avatar, 'avatars', true)}
                    alt={`${avatar.name} picture`}
                    className='object-cover size-full'
                  />
                  {avatar.gender === 'Female' ? (
                    <div className='absolute bottom-2 left-2 z-10'>
                      <div className='flex items-center gap-1 bg-[#FF85B7] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                        👩🏻
                        <span>Female</span>
                      </div>
                    </div>
                  ) : avatar.gender === 'Male' ? (
                    <div className='absolute bottom-2 left-2 z-10'>
                      <div className='flex items-center gap-1 bg-[#85D2FF] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                        🧔🏻‍♂️
                        <span>Male</span>
                      </div>
                    </div>
                  ) : null}
                </Link>
                <div className='py-[18px] px-5 flex lg:items-center gap-5 justify-between flex-1 lg:flex-row flex-col'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <h4 className='text-heading-h4 text-base-black'>{avatar.name}</h4>
                      <Icons.thumb />
                    </div>
                    <p className='text-body-md text-neutral-01 line-clamp-1'>{avatar.shortDesc}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <PlayerButton variant='secondary' audioSrc={PATHS.avatarAudio(avatar.id)} />

                    {avatar.chats.length > 0 ? (
                      <Link to={`/chats/${avatar.chats[0].id}`}>
                        <Button.Root size='sm' className='px-5'>
                          Continue Chat
                        </Button.Root>
                      </Link>
                    ) : (
                      <Form method='POST' action='/chats'>
                        <input hidden name='avatarId' id='avatarId' value={avatar.id} readOnly />
                        <Button.Root type='submit' size='sm' className='px-5'>
                          Chat
                        </Button.Root>
                      </Form>
                    )}
                  </div>
                </div>
              </div>
              {sortedAvatars.length > 6 && !showAll && index >= 4 && (
                <div className='absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 via-black/5 to-transparent pointer-events-none transition-opacity duration-200 ease-in-out rounded-b-xl'></div>
              )}
            </div>
          ))
        )}
      </div>
      {sortedAvatars.length > 4 && (
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
