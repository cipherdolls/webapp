import { Link } from 'react-router';
import { Card } from '~/components/card';
import { Icons } from '~/components/ui/icons';
import { cn } from '~/utils/cn';
import type { Avatar } from '~/types';
import AvatarPicture from './AvatarPicture';
import * as Button from '~/components/ui/button/button';

const YourAvatars = ({ avatars }: { avatars: Avatar[] }) => {
  const hasAvatars = avatars.length > 0;
  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>Your Avatars</h3>
      <div className={cn('p-2 pt-0 rounded-xl flex flex-col', hasAvatars && 'bg-gradient-1')}>
        {hasAvatars ? (
          <>
            <div className='grid grid-cols-2 divide-x py-4 divide-neutral-04'>
              <Link to={'/community/avatars'} className='group '>
                <div className='flex items-center justify-center gap-2'>
                  <Icons.add className='group-hover:text-base-black/50 transition-colors' />
                  <span className='text-body-sm font-semibold text-base-black group-hover:text-base-black/50 transition-colors'>
                    Add Avatar
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {avatars.slice(0, 4).map((avatar, index) => (
                <Link
                  to={`/avatars/${avatar.id}`}
                  className={cn(
                    'bg-white rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/80 hover:drop-shadow-md transition-all group',
                    avatars.length === 1 && 'col-span-2'
                  )}
                  key={index}
                >
                  <AvatarPicture avatar={avatar} className='size-14' />
                  <div className='flex items-center gap-4 min-w-0 flex-1'>
                    <div className='flex flex-col gap-1 overflow-hidden min-w-0 flex-1'>
                      <span className='text-body-sm font-semibold text-base-black truncate'>{avatar.name}</span>
                      <div className='flex items-center gap-2'>
                        <p className={cn('truncate text-body-sm font-semibold text-neutral-01')}>{avatar.shortDesc}</p>
                      </div>
                    </div>

                    <Button.Root
                      variant='secondary'
                      className='h-10 px-0 group-hover:px-6 max-w-0 group-hover:max-w-24 overflow-hidden transition-all duration-200 ease-out'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (avatar.chats && avatar.chats.length > 0) {
                          window.location.href = `/chats/${avatar.chats[0].id}`;
                        }
                      }}
                    >
                      Chat
                    </Button.Root>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6'>
            <h1 className='text-heading-h2'>👤</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Avatars Yet</h4>
              <Link
                to='/avatars/new'
                className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
              >
                Add new avatar
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourAvatars;
