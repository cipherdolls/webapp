import { useMemo, useState } from 'react';
import type { Avatar, User } from '~/types';
import { Icons } from './ui/icons';
import { Form, Link, useRouteLoaderData } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import * as Button from '~/components/ui/button/button';
import PlayerButton from './PlayerButton';
import { PATHS } from '~/constants';
import * as Popover from '~/components/ui/popover';

type GenderFilter = 'All' | 'Male' | 'Female';

const PublicAvatars = ({ avatars }: { avatars: Avatar[] }) => {
  const me = useRouteLoaderData('routes/_main') as User;
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('All');
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleFilterChange = (filter: GenderFilter) => {
    setGenderFilter(filter);
    setPopoverOpen(false);
  };

  const filteredAndSortedAvatars = useMemo(() => {
    return [...avatars]
      .filter((avatar) => avatar.published === true)
      .filter((avatar) => {
        if (genderFilter === 'All') return true;
        return avatar.gender === genderFilter;
      })
      .sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [avatars, genderFilter]);

  return (
    <div className='flex flex-col gap-5 pb-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-heading-h3 text-base-black'>Public Avatars</h3>
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger className={'group navigation-exclude'}>
            <div className='flex items-center gap-2'>
              <p className='text-body-md text-base-black'>{genderFilter === 'All' ? 'All genders' : genderFilter}</p>
              <Icons.chevronDown className='size-6' />
            </div>
          </Popover.Trigger>
          <Popover.Content side='bottom' align='end' className='flex flex-col navigation-exclude !w-[200px]'>
            <button
              onClick={() => handleFilterChange('All')}
              className={`cursor-pointer text-left w-full py-3.5 px-3 navigation-exclude ${genderFilter === 'All' ? 'bg-neutral-05' : 'hover:bg-neutral-05'} text-base-black bg-white transition-colors text-body-md font-semibold rounded-[10px]`}
            >
              All genders
            </button>
            <button
              onClick={() => handleFilterChange('Male')}
              className={`cursor-pointer text-left w-full py-3.5 px-3 navigation-exclude ${genderFilter === 'Male' ? 'bg-neutral-05' : 'hover:bg-neutral-05'} text-base-black bg-white transition-colors text-body-md font-semibold rounded-[10px]`}
            >
              Male
            </button>
            <button
              onClick={() => handleFilterChange('Female')}
              className={`cursor-pointer text-left w-full py-3.5 px-3 navigation-exclude ${genderFilter === 'Female' ? 'bg-neutral-05' : 'hover:bg-neutral-05'} text-base-black bg-white transition-colors text-body-md font-semibold rounded-[10px]`}
            >
              Female
            </button>
          </Popover.Content>
        </Popover.Root>
      </div>
      <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5'>
        {filteredAndSortedAvatars.length === 0 ? (
          <p className='text-body-md text-neutral-01 text-center md:col-span-2 col-span-1'>No published avatars found.</p>
        ) : (
          filteredAndSortedAvatars.map((avatar, index) => (
            <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden' key={index}>
              <Link to={`/avatars/${avatar.id}`} className='block h-[200px] sm:h-[152px] md:h-[200px] rounded-xl bg-black relative'>
                <img
                  src={getPicture(avatar, 'avatars', false)}
                  srcSet={getPicture(avatar, 'avatars', true)}
                  alt={`${avatar.name} picture`}
                  className='object-cover size-full'
                />
                {me.id === avatar.userId && (
                  <div className='absolute top-2 left-2 z-10'>
                    <div className='flex items-center gap-1 bg-gradient-1 py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                      🌐
                      <span>By you</span>
                    </div>
                  </div>
                )}
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
                  <p className='text-body-md text-neutral-01 line-clamp-2'>{avatar.shortDesc}</p>
                </div>
                <div className='flex items-center gap-3'>
                  <PlayerButton variant='secondary' audioSrc={PATHS.ttsVoice(avatar.ttsVoiceId)} />

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
          ))
        )}
      </div>
    </div>
  );
};

export default PublicAvatars;
