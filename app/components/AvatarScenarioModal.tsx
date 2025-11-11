import { useNavigate } from 'react-router';
import type { Avatar, Scenario } from '~/types';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '~/utils/cn';
import { useInfiniteScenarios } from '~/hooks/queries/scenarioQueries';
import { useCreateChat, useDeleteChat } from '~/hooks/queries/chatMutations';
import { useUser } from '~/hooks/queries/userQueries';
import { useAuthStore } from '~/store/useAuthStore';
import { useConfirm, useAlert } from '~/providers/AlertDialogProvider';
import SelectionModal from './SelectionModal';
import { getPicture } from '~/utils/getPicture';
import { Icons } from './ui/icons';
import { ROUTES, TOKEN_BALANCE } from '~/constants';
import { useShallow } from 'zustand/react/shallow';

interface AvatarScenarioModalProps {
  avatar: Avatar;
  children: React.ReactNode;
}

const AvatarScenarioModal: React.FC<AvatarScenarioModalProps> = ({ avatar, children }) => {
  const navigate = useNavigate();
  const { mutate: createChat, isPending: isPendingCreateChat, error: errorCreateChat } = useCreateChat();
  const { mutate: deleteChat, isPending: isDeletingChat, error: errorDeleteChat } = useDeleteChat();
  const { data: user } = useUser();
  const { isUsingBurnerWallet } = useAuthStore(
    useShallow((state) => ({
      isUsingBurnerWallet: state.isUsingBurnerWallet,
    }))
  );

  const confirm = useConfirm();
  const alert = useAlert();

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  //  TODO: Add filter to the scenarios on the backend to get only recommended scenarios for the avatar by avatarId
  const {
    data: scenariosData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteScenarios({
    published: 'true',
    name: searchTerm || '',
  });

  const scenarios = scenariosData?.pages.flatMap((page) => page.data) || [];

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleItemSelect = (item: Scenario) => {
    setSelectedScenario(item);
  };

  // Auto-select first scenario when modal opens
  useEffect(() => {
    if (isOpen && !selectedScenario) {
      // First try to select from recommended scenarios
      if (avatar.scenarios && avatar.scenarios.length > 0) {
        setSelectedScenario(avatar.scenarios[0]);
      }
      // If no recommended scenarios, select first from all scenarios
      else if (scenarios && scenarios.length > 0) {
        setSelectedScenario(scenarios[0]);
      }
    }
  }, [isOpen, selectedScenario, avatar.scenarios, scenarios]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedScenario(null);
    }
  }, [isOpen]);

  //  TODO: Move this logic to the backend of the delete avatar!!
  const handleCreateChat = async () => {
    const userTokenSpendable = user?.tokenSpendable || 0;

    if (!isUsingBurnerWallet && userTokenSpendable < TOKEN_BALANCE.MINIMUM_SPENDABLE) {
      alert({
        icon: '💰',
        title: 'Insufficient Tokens',
        body: `You need at least ${TOKEN_BALANCE.MINIMUM_SPENDABLE} LOV tokens to start a chat. Please add more tokens to continue.`,
      });
      return;
    }

    if (selectedScenario) {
      const hasChatWithSameScenario = avatar.chats?.find((chat) => chat.scenarioId === selectedScenario.id);

      if (hasChatWithSameScenario) {
        setIsConfirmOpen(true);

        const confirmResult = await confirm({
          icon: '🗑️',
          title: 'Delete Previous Chat?',
          body: 'If you create a new chat with this scenario, your previous chat will be permanently deleted and cannot be restored. Do you want to continue?',
          actionButton: 'Yes, Create New',
        });

        if (!confirmResult) return setIsConfirmOpen(false);

        deleteChat(hasChatWithSameScenario.id, {
          onSuccess: () => {
            createChat(
              { avatarId: avatar.id, scenarioId: selectedScenario.id },
              {
                onSuccess: (newChat) => {
                  setSelectedScenario(null);
                  navigate(`${ROUTES.chats}/${newChat.id}`);
                  setIsOpen(false);
                  setIsConfirmOpen(false);
                },
              }
            );
          },
        });
      } else {
        createChat(
          { avatarId: avatar.id, scenarioId: selectedScenario.id },
          {
            onSuccess: (newChat) => {
              setSelectedScenario(null);
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
      type='scenario'
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      selectedAvatar={avatar}
      selectedScenario={selectedScenario}
      onSave={handleCreateChat}
      onSearchChange={handleSearchChange}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      items={scenarios}
      recommendedItems={avatar.scenarios ?? []}
      isOverlayed={isConfirmOpen}
      renderItem={(item: Scenario, isRecommended?: boolean) => {
        const isRecommendedItem = isRecommended || avatar.scenarios?.some((scenarioAvatar) => scenarioAvatar.id === item.id);
        const isSelected = selectedScenario?.id === item.id;
        return (
          <ScenarioItem
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

export default AvatarScenarioModal;

const ScenarioItem = ({
  item,
  isSelected,
  isRecommended,
  onClick,
}: {
  item: Scenario;
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
      disabled={isSelected}
    >
      <div className='relative'>
        <img
          src={getPicture(item, 'scenarios', false)}
          srcSet={getPicture(item, 'scenarios', true)}
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
        <p className='text-sm text-neutral-01 line-clamp-2'>{item.introduction}</p>
      </div>

      {isRecommended && (
        <div className='absolute right-1 top-1 text-xs  h-5  rounded-full flex items-center bg-specials-success text-white px-2 py-2  gap-2 justify-center'>
          Recommended
        </div>
      )}
    </button>
  );
};
