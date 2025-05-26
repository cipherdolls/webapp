import type { Chat } from '~/types';
import AvatarPicture from './AvatarPicture';
import { cn } from '~/utils/cn';
import { Link } from 'react-router';

const YourChats = ({ chats }: { chats: Chat[] }) => {
  let isNew = false;
  return (
    <div className='flex flex-col gap-5'>
      <h3 className='text-heading-h3 text-base-black'>Your Chats</h3>
      <div className='grid md:grid-cols-2 grid-cols-1 gap-2'>
        {chats.length > 0 ? (
          chats.map((chat, index) => (
            <Link
              to={`/chats/${chat.id}`}
              className={cn(
                'bg-white rounded-xl p-3 flex items-center gap-4 cursor-pointer hover:bg-white/80 hover:drop-shadow-md transition-all',
                chats.length === 1 && 'col-span-2'
              )}
              key={index}
            >
              <AvatarPicture avatar={chat.avatar} className='size-14' />
              <div className='flex flex-col gap-1 overflow-hidden'>
                <span className='text-body-sm font-semibold text-base-black'>{chat.avatar.name}</span>
                <div className='flex items-center gap-2'>
                  {/* TODO  */}
                  <p className={cn('truncate break-words text-body-sm font-semibold  max-w-max', isNew ? 'text-black' : 'text-neutral-01')}>
                    Sounds exciting, let's make it a memo...
                  </p>
                  {isNew && (
                    <div className='size-3 rounded-full bg-specials-success relative shrink-0'>
                      <div className='size-1 rounded-ful absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full'></div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className='bg-gradient-1 rounded-xl py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6 col-span-2'>
            <h1 className='text-heading-h2'>💬</h1>
            <div className='flex flex-col items-center sm:gap-2 gap-1'>
              <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Chats Yet</h4>
              <Link
                to='/chats'
                className='text-body-md text-neutral-01 sm:text-center text-left underline decoration-neutral-01 underline-offset-2 hover:text-neutral-02 hover:decoration-neutral-02 transition-colors'
              >
                Start new chat
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourChats;
