import { useFetcher, useNavigate, useRouteLoaderData } from 'react-router';
import SelectionModal from './SelectionModal';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Chat, Scenario, User } from '~/types';

interface ScenarioAvatarModalProps {
  scenario: Scenario;
  children: React.ReactNode;
  chats?: Chat[];
}

const ScenarioAvatarModal: React.FC<ScenarioAvatarModalProps> = ({ scenario, children, chats }) => {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const me = useRouteLoaderData('routes/_main') as User;

  if (!scenario?.id) {
    console.warn('ScenarioAvatarModal: Invalid scenario prop provided');
    return null;
  }

  const existingChatsByAvatar = new Map<string, Chat>();
  const scenarioChats = chats?.filter((chat) => chat.scenario.id === scenario.id) ?? scenario.chats ?? [];
  scenarioChats.forEach((chat) => {
    if (chat.avatar?.id) {
      existingChatsByAvatar.set(chat.avatar.id, chat);
    }
  });

  const handleSave = async (selectedAvatarIds: string[]) => {
    const selectedAvatarId = selectedAvatarIds[0];
    if (!selectedAvatarId) return;

    const existingChat = existingChatsByAvatar.get(selectedAvatarId);

    if (existingChat) {
      navigate(`/chats/${existingChat.id}`);
      return;
    }

    const isAvatarAttached = scenario.avatars?.some((a) => a.id === selectedAvatarId);

    if (!isAvatarAttached && scenario.userId === me.id) {
      try {
        const currentAvatarIds = scenario.avatars?.map((a) => a.id) || [];
        const updatedAvatarIds = [...currentAvatarIds, selectedAvatarId];

        const scenarioFormData = new FormData();
        scenarioFormData.append('scenarioId', scenario.id);
        scenarioFormData.append('name', scenario.name);
        scenarioFormData.append('systemMessage', scenario.systemMessage);
        scenarioFormData.append('chatModelId', scenario.chatModel.id);
        scenarioFormData.append('embeddingModelId', scenario.embeddingModel.id);
        scenarioFormData.append('temperature', scenario.temperature.toString());
        scenarioFormData.append('topP', scenario.topP.toString());
        scenarioFormData.append('frequencyPenalty', scenario.frequencyPenalty.toString());
        scenarioFormData.append('presencePenalty', scenario.presencePenalty.toString());
        if (scenario.reasoningModel) {
          scenarioFormData.append('reasoningModelId', scenario.reasoningModel.id);
        }
        if (scenario.introduction) {
          scenarioFormData.append('introduction', scenario.introduction);
        }
        if (scenario.published !== undefined) {
          scenarioFormData.append('published', scenario.published.toString());
        }
        if (scenario.userGender) {
          scenarioFormData.append('userGender', scenario.userGender);
        }
        if (scenario.avatarGender) {
          scenarioFormData.append('avatarGender', scenario.avatarGender);
        }

        updatedAvatarIds.forEach((id) => {
          scenarioFormData.append('avatarIds[]', id);
        });

        const updateResponse = await fetchWithAuth(`scenarios/${scenario.id}`, {
          method: 'PATCH',
          body: scenarioFormData,
        });

        if (!updateResponse.ok) {
          console.error('Failed to add avatar to scenario');
        }
      } catch (error) {
        console.error('Error adding avatar to scenario:', error);
      }
    }

    const formData = new FormData();
    formData.append('avatarId', selectedAvatarId);
    formData.append('scenarioId', scenario.id);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/chats',
    });
  };

  const displayAvatar = scenario.avatars?.[0];

  return (
    <SelectionModal type='scenario' scenario={scenario} avatar={displayAvatar} onSave={handleSave} onClose={() => {}}>
      {children}
    </SelectionModal>
  );
};

export default ScenarioAvatarModal;
