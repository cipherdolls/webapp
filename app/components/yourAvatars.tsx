import { useState, useMemo } from 'react';
import { Form, Link, useNavigate } from 'react-router';
import { Icons } from '~/components/ui/icons';
import { cn } from '~/utils/cn';
import type { Avatar } from '~/types';
import AvatarPicture from './AvatarPicture';
import * as Button from '~/components/ui/button/button';

const YourAvatars = ({ avatars }: { avatars: Avatar[] }) => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
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
      <div className={cn('p-2 pt-0 rounded-xl flex flex-col', hasAvatars && 'bg-gradient-1')}>
        {hasAvatars ? (
          <>
            <div className='grid grid-cols-2 divide-x py-4 divide-neutral-04'>
              <Link to={'/community/avatars'} className='group '>
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {sortedAvatars.map((avatar, index) => (
                <div className={`${!showAll && index >= 4 ? 'hidden' : 'transition-all duration-500 ease-out'}`} key={index}>
                  <Link
                    to={`/avatars/${avatar.id}`}
                    className={cn(
                      'bg-white rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/80 hover:drop-shadow-md transition-all group',
                      sortedAvatars.length === 1 && 'col-span-2'
                    )}
                  >
                    <AvatarPicture avatar={avatar} className='size-14' />
                    <div className='flex items-center gap-4 min-w-0 flex-1'>
                      <div className='flex flex-col gap-1 overflow-hidden min-w-0 flex-1'>
                        <span className='text-body-sm font-semibold text-base-black truncate'>{avatar.name}</span>
                        <div className='flex items-center gap-2'>
                          <p className={cn('truncate text-body-sm font-semibold text-neutral-01')}>{avatar.shortDesc}</p>
                        </div>
                      </div>
                      {avatar.chats.length > 0 ? (
                        <Button.Root
                          variant='secondary'
                          className='h-10 md:px-0 px-6 md:group-hover:px-6 md:max-w-0 md:group-hover:max-w-24 overflow-hidden transition-all duration-200 ease-out'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (avatar.chats && avatar.chats.length > 0) {
                              navigate(`/chats/${avatar.chats[0].id}`);
                            }
                          }}
                        >
                          Chat
                        </Button.Root>
                      ) : (
                        <Form
                          method='POST'
                          action='/chats'
                          onSubmit={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <input hidden name='avatarId' id='avatarId' value={avatar.id} readOnly />
                          <Button.Root
                            variant='secondary'
                            className='h-10 md:px-0 px-6 md:group-hover:px-6 md:max-w-0 md:group-hover:max-w-24 overflow-hidden transition-all duration-200 ease-out'
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            Chat
                          </Button.Root>
                        </Form>
                      )}
                    </div>
                  </Link>
                </div>
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
