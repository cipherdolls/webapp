import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Icons } from '~/components/ui/icons';
import type { Chat } from '~/types';
import * as Button from '~/components/ui/button/button';
import { getPicture } from '~/utils/getPicture';
import AvatarScenarioModal from './AvatarScenarioModal';
import { useAvatars } from '~/hooks/queries/avatarQueries';

const YourAvatars = ({  chats }: {  chats?: Chat[] }) => {
  const { data: myAvatars, isLoading: avatarsLoading } = useAvatars({ mine: true });

  const avatars = myAvatars?.data || [];

  const [showAll, setShowAll] = useState(false);
  const hasAvatars = avatars.length > 0;

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
      <h3 className='text-heading-h3 text-base-black'>Your Avatars</h3>
      <div className={'bg-gradient-1 rounded-xl p-2 pt-0 flex flex-col'}>
        {hasAvatars ? (
          <>
            <div className='grid grid-cols-2 divide-x py-4 divide-neutral-04'>
              <Link to={'/avatars'} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.search className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Find Avatar
                  </span>
                </div>
              </Link>
              <Link to={'/avatars/new'} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.pen className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Create Avatar
                  </span>
                </div>
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              {sortedAvatars.map((avatar, index) => (
                <div className={`${!showAll && index >= 4 ? 'hidden' : 'transition-all duration-500 ease-out'}`} key={index}>
                  <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                    <Link to={`/avatars/${avatar.id}`} className='block h-[200px] sm:h-[152px] lg:h-[120px] rounded-xl bg-black relative'>
                      <img
                        src={getPicture(avatar, 'avatars', false)}
                        srcSet={getPicture(avatar, 'avatars', true)}
                        alt={`${avatar.name} picture`}
                        className='object-cover size-full'
                      />

                      <div className='absolute top-2 left-2 z-10'>
                        <div className='flex items-center gap-1 bg-gradient-1 py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                          👤
                          <span>By you</span>
                        </div>
                      </div>
                    </Link>

                    <div className='p-3 flex lg:items-center gap-5 justify-between flex-1'>
                      <div className='flex flex-col gap-1 min-w-0 flex-1'>
                        <h4 className='text-body-sm font-semibold text-base-black truncate'>{avatar.name}</h4>

                        <p className='truncate text-body-sm font-semibold text-neutral-01'>{avatar.shortDesc}</p>
                      </div>
                      <div className='flex items-center gap-3 flex-shrink-0'>
                        <AvatarScenarioModal avatar={avatar} chats={chats}>
                          <Button.Root size='sm' className='px-5'>
                            Chat
                          </Button.Root>
                        </AvatarScenarioModal>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
            <h1 className='text-heading-h2'>👤</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Avatars Yet</h4>
              <Link
                to='/avatars'
                className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
              >
                Add new avatar
              </Link>
            </div>
          </div>
        )}
      </div>
      {avatars.length > 4 && (
        <div className='mx-auto -mt-2'>
          <Button.Root variant='secondary' className='px-4 h-10 gap-2' onClick={handleShowAll}>
            {showAll ? 'Collapse' : 'Show all'}
            <Button.Icon as={Icons.chevronDown} className={`size-6 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
          </Button.Root>
        </div>
      )}
    </div>
  );
};

export default YourAvatars;
