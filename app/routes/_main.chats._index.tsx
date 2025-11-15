import ChatWelcomeEmpty from '~/components/chat/ChatWelcomeEmpty';
import { useMediaQuery } from 'usehooks-ts';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { ROUTES } from '~/constants';
import { useUser } from '~/hooks/queries/userQueries';

export default function ChatsIndex() {
  const { data: chatsData, isLoading: isChatsLoading } = useChats();
  const { data: avatarsData, isLoading: isAvatarsLoading } = useAvatars({ published: 'true' });
  const { data: user, isLoading: isUserLoading } = useUser();

  const navigate = useNavigate()
  const isDesktopView = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (chatsData && chatsData.length > 0 && isDesktopView) {
      const firstChat = chatsData[0];
      navigate(`${ROUTES.chats}/${firstChat.id}`, { replace: true });
    }
  }, [chatsData, isDesktopView, navigate]);

  // Show empty welcome if no chats exist and data is loaded
  if (!isChatsLoading && !isUserLoading && !isAvatarsLoading && (!chatsData || chatsData.length === 0)) {
    return <ChatWelcomeEmpty avatars={avatarsData?.data || []} user={user!} />;
  }

  // Show loading state only while data is being fetched
  return null;
}
