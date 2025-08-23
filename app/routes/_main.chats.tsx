import { Outlet } from 'react-router';
import type { Route } from './+types/_main.chats';
import ChatsSidebar from '~/components/ChatsSidebar';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export default function ChatsIndex() {
  const { data: avatarsData } = useAvatars();
  const { data: chatsData, isLoading: isChatsLoading } = useChats();

  const avatars = avatarsData?.data || [];
  const chats = chatsData || [];

  return (
    <>
      <main className='flex flex-1 sm:py-2 sm:pr-2 overflow-hidden'>
        <div className='flex flex-1 sm:rounded-xl sm:bg-gradient-1 overflow-hidden'>
          <ChatsSidebar chats={chats} avatars={avatars} isChatsLoading={isChatsLoading} />
          <div className='flex flex-1'>
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}
