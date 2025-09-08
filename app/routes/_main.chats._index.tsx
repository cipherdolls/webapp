import ChatWelcome from '~/components/chat/ChatWelcome';
import ChatWelcomeEmpty from '~/components/chat/ChatWelcomeEmpty';
import { useMediaQuery } from 'usehooks-ts';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { ROUTES } from '~/constants';
import { useUser } from '~/hooks/queries/userQueries';

export default function ChatsIndex() {
  const { data: chatsData } = useChats();
  const { data: avatarsData } = useAvatars({ published: 'true' });
  const { data: user, isLoading: isUserLoading } = useUser();

  const navigate = useNavigate()
  const isDesktopView = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (chatsData && chatsData.length > 0 && isDesktopView) {
      const firstChat = chatsData[0];
      navigate(`${ROUTES.chats}/${firstChat.id}`);
    }
  }, [chatsData, isDesktopView, navigate]);

  if (!user) return null;

  // Show empty welcome if no chats exist
  if (!chatsData || chatsData.length === 0) {
    return <ChatWelcomeEmpty avatars={avatarsData?.data || []} user={user} />;
  }

  // Show regular welcome if user has chats
  return <ChatWelcome chats={chatsData || []} avatars={avatarsData?.data || []} />;
}
