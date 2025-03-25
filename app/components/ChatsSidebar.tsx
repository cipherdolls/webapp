import { NavLink } from 'react-router';
import type { Avatar, Chat } from '~/types';
import { cn } from '~/utils/cn';
import { Icons } from './ui/icons';
import AvatarCard from './AvatarCardReusable';
import * as Button from './ui/button/button';
import AvatarSelectModal from './AvatarSelectModal';

interface ChatsSidebarProps {
  chats: Chat[];
  avatars: Avatar[];
}

const ChatsSidebar = ({ chats, avatars }: ChatsSidebarProps) => {
  const showChatsButton = chats.length > 0 && avatars.some((avatar) => avatar.chats.length === 0);

  return (
    <div
      className={cn('pb-3 px-2 md:pb-0 md:px-0 h-full w-full md:w-[348px] shrink-0 flex flex-col', {
        'max-w-0 p-0': chats.length === 0,
      })}
    >
      <div className='px-5 py-[18px] flex items-center justify-between'>
        <h3 className='text-heading-h3'>Chats</h3>
        {showChatsButton && (
          <AvatarSelectModal avatars={avatars}>
            <Button.Root size='icon' aria-label='New Chat' className='shrink-0'>
              <Button.Icon as={Icons.chat} />
            </Button.Root>
          </AvatarSelectModal>
        )}
      </div>
      <div className='flex-1 sm:px-2 scrollbar-medium overflow-auto bg-gradient-1 rounded-xl sm:bg-none sm:rounded-none'>
        <div className='flex flex-col '>
          {chats.map((chat) => (
            <NavLink
              key={chat.id}
              to={`/chats/${chat.id}`}
              className={({ isActive }) =>
                cn('rounded-xl group', {
                  'bg-white sm:bg-neutral-05 active': isActive,
                })
              }
            >
              <AvatarCard avatar={chat.avatar}>
                <AvatarCard.Avatar />
                <AvatarCard.Content>
                  <AvatarCard.Name className='@max-[400px]:text-body-md' />
                  <div className='flex items-center gap-x-2 max-w-full'>
                    {/* TODO: add last message */}
                    <AvatarCard.Description>Some text here Some text here Some text here text here Some text here</AvatarCard.Description>

                    {/* TODO: add logic for indicator */}
                    <Icons.indicator className='shrink-0 ml-auto' />
                  </div>
                </AvatarCard.Content>
              </AvatarCard>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatsSidebar;
