import ChatWelcome from '~/components/chat/ChatWelcome';
import { useMediaQuery } from 'usehooks-ts';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';

export default function ChatsIndex() {
  const { data: chatsData } = useChats();
  const { data: avatarsData } = useAvatars();

  const isDesktopView = useMediaQuery('(min-width: 1024px)');
  const navigate = useNavigate();

  useEffect(() => {
    if (chatsData && chatsData.length > 0 && isDesktopView) {
      const firstChat = chatsData[0];
      navigate(`/chats/${firstChat.id}`);
    }
  }, [chatsData, isDesktopView, navigate]);

  return <ChatWelcome chats={chatsData || []} avatars={avatarsData?.data || []} />;
}
