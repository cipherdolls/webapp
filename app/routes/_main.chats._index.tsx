import ChatWelcomeEmpty from '~/components/chat/ChatWelcomeEmpty';
import { useMediaQuery } from 'usehooks-ts';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { GUEST_MODE_WELCOME_CHATS, ROUTES } from '~/constants';
import { useUser } from '~/hooks/queries/userQueries';
import { useAuthStore } from '~/store/useAuthStore';
import { useCreateChat } from '~/hooks/queries/chatMutations';

export default function ChatsIndex() {
  const { data: chatsData, isLoading: isChatsLoading } = useChats();
  const { data: avatarsData, isLoading: isAvatarsLoading } = useAvatars({ published: 'true' });
  const { data: user, isLoading: isUserLoading } = useUser();
  const { isUsingBurnerWallet } = useAuthStore();
  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat();

  const navigate = useNavigate();
  const isDesktopView = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (chatsData && chatsData.length > 0 && isDesktopView) {
      const firstChat = chatsData[0];
      navigate(`${ROUTES.chats}/${firstChat.id}`, { replace: true });
    }
  }, [chatsData, isDesktopView, navigate]);

  // Create guest mode welcome chats if no chats exist
  useEffect(() => {
    if (isUsingBurnerWallet && !isCreatingChat && chatsData?.length === 0) {
      let firstNewChatId = 0

      const promises = GUEST_MODE_WELCOME_CHATS.map((item) => createChat(
        { avatarId: item.avatarId, scenarioId: item.scenarioId },
        {
          onSuccess: (newChat) => {
            firstNewChatId = newChat.id
          },
        }
      ));

      Promise.all(promises);
      navigate(`${ROUTES.chats}/${firstNewChatId}`)
    }
  }, [isUsingBurnerWallet, chatsData]);

  // Show empty welcome if no chats exist and data is loaded
  if (!isChatsLoading && !isUserLoading && !isAvatarsLoading && (!chatsData || chatsData.length === 0)) {
    return <ChatWelcomeEmpty avatars={avatarsData?.data || []} user={user!} />;
  }

  // Show loading state only while data is being fetched
  return null;
}
