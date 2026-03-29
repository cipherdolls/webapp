import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { useDebounceValue } from 'usehooks-ts';

import { useInfiniteScenarios } from '~/hooks/queries/scenarioQueries';
import { useInfiniteAvatars } from '~/hooks/queries/avatarQueries';
import { useCreateChat, useDeleteChat } from '~/hooks/queries/chatMutations';
import { useConfirm, useAlert } from '~/providers/AlertDialogProvider';
import { useAuthStore } from '~/store/useAuthStore';
import { useUser } from '~/hooks/queries/userQueries';
import { ROUTES, TOKEN_BALANCE } from '~/constants';

import type { Avatar, Scenario, Chat } from '~/types';
import type { ChatSelectionWizardProps, ChatSelectionWizardMode } from '~/components/ChatSelectionWizard';

type BaseWizardState = {
  variant: ChatSelectionWizardMode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  onSave: () => Promise<void>;
  isOverlayed: boolean;
  isActionDisabled: boolean;
  isActionLoading: boolean;
};

export type AvatarScenarioWizardState = BaseWizardState & {
  variant: 'avatar-to-scenario';
  selectedAvatar: Avatar;
  selectedScenario: Scenario | null;
  items: Scenario[];
  recommendedItems: Scenario[];
  onItemSelect: (scenario: Scenario) => void;
  customActionButtonText?: string;
};

export type ScenarioAvatarWizardState = BaseWizardState & {
  variant: 'scenario-to-avatar';
  selectedAvatar: Avatar | null;
  selectedScenario: Scenario;
  items: Avatar[];
  recommendedItems: Avatar[];
  onItemSelect: (avatar: Avatar) => void;
};

export type UseChatSelectionWizardReturn = AvatarScenarioWizardState | ScenarioAvatarWizardState;

type StartChatArgs = {
  avatarId: string;
  scenarioId: string;
  existingChatId?: string;
  afterSuccess: (newChat: Chat) => void;
};

export const useChatSelectionWizard = (props: ChatSelectionWizardProps): UseChatSelectionWizardReturn => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const alert = useAlert();
  const { data: user } = useUser();
  const { isUsingBurnerWallet } = useAuthStore(
    useShallow((state) => ({
      isUsingBurnerWallet: state.isUsingBurnerWallet,
    }))
  );

  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat();
  const { mutate: deleteChat, isPending: isDeletingChat } = useDeleteChat();

  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounceValue(searchValue, 300);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isAvatarVariant = props.mode === 'avatar-to-scenario';
  const avatarContext = isAvatarVariant ? props.avatar : null;
  const scenarioContext = !isAvatarVariant ? props.scenario : null;
  const customAction = isAvatarVariant ? props.customAction : undefined;

  const scenarioQueryParams = useMemo(
    () => ({
      published: 'true',
      name: debouncedSearchValue || '',
    }),
    [debouncedSearchValue]
  );

  const avatarQueryParams = useMemo(() => {
    const params: {
      published: string;
      name: string;
    } = {
      published: 'true',
      name: debouncedSearchValue || '',
    };

    return params;
  }, [debouncedSearchValue]);

  const {
    data: rawScenarioPages,
    isLoading: isLoadingScenarios,
    hasNextPage: hasNextScenarioPage,
    fetchNextPage: fetchNextScenarioPage,
    isFetchingNextPage: isFetchingNextScenarioPage,
  } = useInfiniteScenarios(scenarioQueryParams, { enabled: isAvatarVariant });

  const {
    data: rawAvatarPages,
    isLoading: isLoadingAvatars,
    hasNextPage: hasNextAvatarPage,
    fetchNextPage: fetchNextAvatarPage,
    isFetchingNextPage: isFetchingNextAvatarPage,
  } = useInfiniteAvatars(avatarQueryParams, { enabled: !isAvatarVariant });

  const scenarioItems = useMemo(() => rawScenarioPages?.pages.flatMap((page) => page.data) ?? [], [rawScenarioPages]);
  const avatarItems = useMemo(() => rawAvatarPages?.pages.flatMap((page) => page.data) ?? [], [rawAvatarPages]);

  const recommendedScenarios = useMemo(() => avatarContext?.scenarios ?? [], [avatarContext]);
  const recommendedAvatars = useMemo(() => scenarioContext?.avatars ?? [], [scenarioContext]);

  useEffect(() => {
    if (!isOpen) return;

    if (isAvatarVariant) {
      if (selectedScenario) return;
      const nextScenario = recommendedScenarios[0] ?? scenarioItems[0] ?? null;
      if (nextScenario) setSelectedScenario(nextScenario);
    } else {
      if (selectedAvatar) return;
      const nextAvatar = recommendedAvatars[0] ?? avatarItems[0] ?? null;
      if (nextAvatar) setSelectedAvatar(nextAvatar);
    }
  }, [isOpen, isAvatarVariant, selectedScenario, scenarioItems, recommendedScenarios, selectedAvatar, avatarItems, recommendedAvatars]);

  useEffect(() => {
    if (isOpen) return;
    setSelectedScenario(null);
    setSelectedAvatar(null);
    setSearchValue('');
    setIsConfirmOpen(false);
  }, [isOpen]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const startChat = useCallback(
    async ({ avatarId, scenarioId, existingChatId, afterSuccess }: StartChatArgs) => {
      const triggerCreate = () => {
        createChat(
          { avatarId, scenarioId },
          {
            onSuccess: (newChat) => {
              afterSuccess(newChat);
              navigate(`${ROUTES.chats}/${newChat.id}`);
              setIsOpen(false);
              setIsConfirmOpen(false);
            },
            onError: (error: any) => {
              setIsOpen(false);
              setIsConfirmOpen(false);
              alert({
                icon: '💰',
                title: 'Insufficient Tokens',
                body:
                  error?.message ||
                  `You need at least ${TOKEN_BALANCE.MINIMUM_SPENDABLE} USDC to start a chat. Please add more tokens to continue.`,
              });
            },
          }
        );
      };

      if (existingChatId) {
        setIsConfirmOpen(true);
        const confirmResult = await confirm({
          icon: '🗑️',
          title: 'Delete Previous Chat?',
          body: 'If you create a new chat with this scenario, your previous chat will be permanently deleted and cannot be restored. Do you want to continue?',
          actionButton: 'Yes, Create New',
        });

        if (!confirmResult) {
          setIsConfirmOpen(false);
          return;
        }

        deleteChat(existingChatId, {
          onSuccess: () => {
            triggerCreate();
          },
          onError: (error: any) => {
            setIsConfirmOpen(false);
            alert({
              icon: '❌',
              title: 'Error',
              body: error?.message || 'Failed to delete previous chat. Please try again.',
            });
          },
        });

        return;
      }

      triggerCreate();
    },
    [confirm, createChat, deleteChat, navigate]
  );

  const handleAvatarVariantSave = useCallback(async () => {
    if (!isAvatarVariant) return;
    if (!selectedScenario) return;
    if (!avatarContext) return;

    if (customAction?.onClick) {
      await Promise.resolve(customAction.onClick(avatarContext, selectedScenario));
      setIsOpen(false);
      setSelectedScenario(null);
      return;
    }

    const existingChatId = avatarContext.chats?.find((chat) => chat.scenarioId === selectedScenario.id)?.id;

    await startChat({
      avatarId: avatarContext.id,
      scenarioId: selectedScenario.id,
      existingChatId,
      afterSuccess: () => {
        setSelectedScenario(null);
      },
    });
  }, [avatarContext, customAction, isAvatarVariant, selectedScenario, startChat]);

  const handleScenarioVariantSave = useCallback(async () => {
    if (isAvatarVariant) return;
    if (!selectedAvatar) return;
    if (!scenarioContext) return;

    const isFree = Boolean(scenarioContext.free);
    const userTokenSpendable = user?.tokenSpendable ?? 0;

    if (!isUsingBurnerWallet && !isFree && userTokenSpendable < TOKEN_BALANCE.MINIMUM_SPENDABLE) {
      alert({
        icon: '💰',
        title: 'Insufficient Tokens',
        body: `You need at least ${TOKEN_BALANCE.MINIMUM_SPENDABLE} USDC to start a chat. Please add more tokens to continue.`,
      });
      return;
    }

    const existingChatId = selectedAvatar.chats?.find((chat) => chat.scenarioId === scenarioContext.id)?.id;

    await startChat({
      avatarId: selectedAvatar.id,
      scenarioId: scenarioContext.id,
      existingChatId,
      afterSuccess: () => {
        setSelectedAvatar(null);
      },
    });
  }, [alert, isAvatarVariant, isUsingBurnerWallet, scenarioContext, selectedAvatar, startChat, user?.tokenSpendable]);

  const isActionLoading = isCreatingChat || isDeletingChat;
  const avatarVariantDisabled = isAvatarVariant && !selectedScenario;
  const scenarioVariantDisabled = !isAvatarVariant && !selectedAvatar;
  const isActionDisabled = avatarVariantDisabled || scenarioVariantDisabled || isActionLoading;

  if (isAvatarVariant) {
    return {
      variant: 'avatar-to-scenario',
      isOpen,
      setIsOpen,
      searchValue,
      onSearchChange: handleSearchChange,
      isLoading: isLoadingScenarios,
      hasNextPage: hasNextScenarioPage ?? false,
      fetchNextPage: fetchNextScenarioPage,
      isFetchingNextPage: isFetchingNextScenarioPage ?? false,
      onSave: handleAvatarVariantSave,
      isOverlayed: isConfirmOpen,
      isActionDisabled,
      isActionLoading,
      selectedAvatar: avatarContext!,
      selectedScenario,
      items: scenarioItems,
      recommendedItems: recommendedScenarios,
      onItemSelect: setSelectedScenario,
      customActionButtonText: customAction?.text,
    };
  }

  return {
    variant: 'scenario-to-avatar',
    isOpen,
    setIsOpen,
    searchValue,
    onSearchChange: handleSearchChange,
    isLoading: isLoadingAvatars,
    hasNextPage: hasNextAvatarPage ?? false,
    fetchNextPage: fetchNextAvatarPage,
    isFetchingNextPage: isFetchingNextAvatarPage ?? false,
    onSave: handleScenarioVariantSave,
    isOverlayed: isConfirmOpen,
    isActionDisabled,
    isActionLoading,
    selectedAvatar,
    selectedScenario: scenarioContext!,
    items: avatarItems,
    recommendedItems: recommendedAvatars,
    onItemSelect: setSelectedAvatar,
  };
};
