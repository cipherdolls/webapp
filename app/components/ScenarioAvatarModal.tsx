import { useNavigate } from 'react-router';
import SelectionModal from './SelectionModal';
import type { Avatar, Chat, Scenario } from '~/types';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import { Icons } from './ui/icons';
import { useCreateChat, useDeleteChat } from '~/hooks/queries/chatMutations';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useState, useCallback, useEffect } from 'react';
import { useInfiniteAvatars } from '~/hooks/queries/avatarQueries';
import { ROUTES } from '~/constants';

interface ScenarioAvatarModalProps {
  scenario: Scenario;
  children: React.ReactNode;
  chats?: Chat[];
}

const ScenarioAvatarModal: React.FC<ScenarioAvatarModalProps> = ({ scenario, children, chats }) => {
  const navigate = useNavigate();
  const { mutate: createChat, isPending: isPendingCreateChat, error: errorCreateChat } = useCreateChat();
  const { mutate: deleteChat, isPending: isDeletingChat, error: errorDeleteChat } = useDeleteChat();

  const confirm = useConfirm();

  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  //  TODO: Add filter to the scenarios on the backend to get only recommended scenarios for the avatar by avatarId
  const {
    data: avatarsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteAvatars({
    published: 'true',
    name: searchTerm || '',
    gender: scenario.avatarGender || undefined,
  });

  const avatars = avatarsData?.pages.flatMap((page) => page.data) || [];

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  //  TODO: Move this logic to the backend of the delete avatar!!
  const handleItemSelect = (item: Avatar) => {
    setSelectedAvatar(item);
  };

  // Auto-select first avatar when modal opens
  useEffect(() => {
    if (isOpen && !selectedAvatar) {
      // First try to select from recommended avatars
      if (scenario.avatars && scenario.avatars.length > 0) {
        setSelectedAvatar(scenario.avatars[0]);
      }
      // If no recommended avatars, select first from all avatars
      else if (avatars && avatars.length > 0) {
        setSelectedAvatar(avatars[0]);
      }
    }
  }, [isOpen, selectedAvatar, scenario.avatars, avatars]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAvatar(null);
    }
  }, [isOpen]);

  const handleCreateChat = async () => {
    if (selectedAvatar) {
      const hasChatWithSameScenario = selectedAvatar.chats?.find((chat) => chat.scenarioId === scenario.id);

      if (hasChatWithSameScenario) {
        const confirmResult = await confirm({
          icon: '🗑️',
          title: 'Delete Previous Chat?',
          body: 'If you create a new chat with this scenario, your previous chat will be permanently deleted and cannot be restored. Do you want to continue?',
          actionButton: 'Yes, Create New',
        });

        if (!confirmResult) return;

        deleteChat(hasChatWithSameScenario.id, {
          onSuccess: () => {
            createChat(
              { avatarId: selectedAvatar.id, scenarioId: scenario.id },
              {
                onSuccess: (newChat) => {
                  setSelectedAvatar(null);
                  navigate(`${ROUTES.chats}/${newChat.id}`);
                  setIsOpen(false);
                },
              }
            );
          },
        });
      } else {
        createChat(
          { avatarId: selectedAvatar.id, scenarioId: scenario.id },
          {
            onSuccess: (newChat) => {
              setSelectedAvatar(null);
              navigate(`${ROUTES.chats}/${newChat.id}`);
              setIsOpen(false);
            },
          }
        );
      }
    }
  };

  return (
    <SelectionModal
      type='avatar'
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      selectedAvatar={selectedAvatar}
      selectedScenario={scenario}
      onSave={handleCreateChat}
      onSearchChange={handleSearchChange}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      items={avatars}
      recommendedItems={scenario.avatars ?? []}
      renderItem={(item: Avatar, isRecommended?: boolean) => {
        const isRecommendedItem = isRecommended || scenario.avatars?.some((scenarioAvatar) => scenarioAvatar.id === item.id);
        const isSelected = selectedAvatar?.id === item.id;
        return (
          <AvatarItem
            key={item.id}
            item={item}
            isSelected={isSelected}
            isRecommended={isRecommendedItem ?? false}
            onClick={() => handleItemSelect(item)}
          />
        );
      }}
    >
      {children}
    </SelectionModal>
  );
};

export default ScenarioAvatarModal;

const AvatarItem = ({
  item,
  isSelected,
  isRecommended,
  onClick,
}: {
  item: Avatar;
  isSelected: boolean;
  isRecommended: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      key={item.id}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border transition-all text-left w-full relative',
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-04 hover:border-neutral-03 hover:bg-neutral-05'
      )}
    >
      <div className='relative'>
        <img
          src={getPicture(item, 'avatars', false)}
          srcSet={getPicture(item, 'avatars', true)}
          alt={item.name}
          className='w-12 h-12 rounded-full object-cover'
        />
        {isSelected && (
          <div className='absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
            <Icons.check className='w-3 h-3 text-white' />
          </div>
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <h4 className='font-semibold text-base-black truncate'>{item.name}</h4>
        <p className='text-sm text-neutral-01 line-clamp-2'>{item.shortDesc}</p>
      </div>

      {isRecommended && (
        <div className='absolute right-1 top-1 text-xs  h-5  rounded-full flex items-center bg-specials-success text-white px-2 py-2  gap-2 justify-center'>
          Recommended
        </div>
      )}
    </button>
  );
};
