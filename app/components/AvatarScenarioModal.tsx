import { useFetcher, useNavigate, useRouteLoaderData } from 'react-router';
import SelectionModal from './SelectionModal';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Avatar, Chat, User } from '~/types';

interface AvatarScenarioModalProps {
  avatar: Avatar;
  children: React.ReactNode;
  chats?: Chat[];
}

const AvatarScenarioModal: React.FC<AvatarScenarioModalProps> = ({ avatar, children, chats }) => {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const me = useRouteLoaderData('routes/_main') as User;

  if (!avatar?.id) {
    console.warn('AvatarScenarioModal: Invalid avatar prop provided');
    return null;
  }

  const existingChatsByScenario = new Map<string, Chat>();
  const avatarChats = chats?.filter((chat: Chat) => chat.avatar.id === avatar.id) ?? avatar.chats ?? [];
  avatarChats.forEach((chat: Chat) => {
    if (chat?.scenario?.id) {
      existingChatsByScenario.set(chat.scenario.id, chat);
    }
  });

  const handleSave = async (selectedScenarioIds: string[]) => {
    const selectedScenarioId = selectedScenarioIds[0];
    if (!selectedScenarioId) return;

    const existingChat = existingChatsByScenario.get(selectedScenarioId);

    if (existingChat) {
      navigate(`/chats/${existingChat.id}`);
      return;
    }

    const isScenarioAttached = avatar.scenarios?.some((s) => s.id === selectedScenarioId) ?? false;

    if (!isScenarioAttached && avatar.userId === me.id) {
      try {
        const currentScenarioIds = avatar.scenarios?.map((s) => s.id) || [];
        const updatedScenarioIds = [...currentScenarioIds, selectedScenarioId];

        const avatarFormData = new FormData();
        avatarFormData.append('avatarId', avatar.id);
        avatarFormData.append('name', avatar.name);
        avatarFormData.append('shortDesc', avatar.shortDesc);
        avatarFormData.append('character', avatar.character);
        avatarFormData.append('ttsVoiceId', avatar.ttsVoiceId);
        avatarFormData.append('published', avatar.published.toString());
        avatarFormData.append('language', avatar.language);
        avatarFormData.append('gender', avatar.gender);
        updatedScenarioIds.forEach((id) => {
          avatarFormData.append('scenarioIds[]', id);
        });

        const updateResponse = await fetchWithAuth(`avatars/${avatar.id}`, {
          method: 'PATCH',
          body: avatarFormData,
        });

        if (!updateResponse.ok) {
          console.error('Failed to add scenario to avatar');
        }
      } catch (error) {
        console.error('Error adding scenario to avatar:', error);
      }
    }

    const formData = new FormData();
    formData.append('avatarId', avatar.id);
    formData.append('scenarioId', selectedScenarioId);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/chats',
    });
  };

  const displayScenario = avatar.scenarios?.[0];

  return (
    <SelectionModal type='avatar' avatar={avatar} scenario={displayScenario} onSave={handleSave} onClose={() => {}}>
      {children}
    </SelectionModal>
  );
};

export default AvatarScenarioModal;
