import { Outlet } from 'react-router';
import type { Route } from './+types/_main.chats';
import ChatsSidebar from '~/components/ChatsSidebar';
import { useChats } from '~/hooks/queries/chatQueries';
import { useAvatars } from '~/hooks/queries/avatarQueries';
import { useUser } from '~/hooks/queries/userQueries';
import { OnboardWizardModal } from '~/components/OnboardWizardModal';
import { useAuthStore } from '~/store/useAuthStore';
import { useEffect } from 'react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chats' }];
}

export default function ChatsIndex() {
  const { data: avatarsData } = useAvatars();
  const { data: chatsData, isLoading: isChatsLoading } = useChats();
  const { data: user, isLoading: isUserLoading } = useUser()
  const { isOnboardWizardCompleted, setOnboardWizardCompleted } = useAuthStore();

  const shouldShowOnboardWizard = isOnboardWizardCompleted ? false : user?.name === 'Adam' && user.gender === null || user?.tokenAllowance === 0;

  const avatars = avatarsData?.data || [];
  const chats = chatsData || [];

  useEffect(() => {
    if (user && user.tokenAllowance > 0) {
      setOnboardWizardCompleted(true);
    }
  }, [user]);

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

      {user && shouldShowOnboardWizard && (
        <OnboardWizardModal me={user} isOpen={shouldShowOnboardWizard} />
      )}
    </>
  );
}
