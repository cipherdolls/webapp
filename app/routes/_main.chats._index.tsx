import ChatWelcome from '~/components/chat/ChatWelcome';
import { useMediaQuery } from 'usehooks-ts';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { ROUTES } from '~/constants';
import { useUser } from '~/hooks/queries/userQueries';
import { useAuthStore } from '~/store/useAuthStore';
import { WelcomeOnboardWizard } from '~/components/WelcomeOnboardWizard';

export default function ChatsIndex() {
  const { data: chatsData } = useChats();
  const { data: avatarsData } = useAvatars();
  const { data: user, isLoading: isUserLoading } = useUser();
  const { isOnboardWizardCompleted, setOnboardWizardCompleted } = useAuthStore();

  const navigate = useNavigate()
  const isDesktopView = useMediaQuery('(min-width: 1024px)');

  const handleClose = () => {
    setOnboardWizardCompleted(true)
  }

  useEffect(() => {
    if (chatsData && chatsData.length > 0 && isDesktopView) {
      const firstChat = chatsData[0];
      navigate(`${ROUTES.chats}/${firstChat.id}`);
    }
  }, [chatsData, isDesktopView, navigate]);

  useEffect(() => {
    if (user && user?.tokenAllowance > 0) {
      setOnboardWizardCompleted(true);
    } else {
      setOnboardWizardCompleted(false);
    }
  }, [user]);

  if (!user) return null;

  return isOnboardWizardCompleted ? (
    <ChatWelcome chats={chatsData || []} avatars={avatarsData?.data || []} />
  ) : (
    <WelcomeOnboardWizard me={user} onClose={handleClose}/>
  );
}
