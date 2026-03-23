import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import { Icons } from './ui/icons';
import FreeToUseBadge from './FreeToUseBadge';
import SelectionModal from './SelectionModal';
import { useChatSelectionWizard } from '~/hooks/chatSelection/useChatSelectionWizard';
import Tooltip from './ui/tooltip';

import type { Avatar, Scenario } from '~/types';

/**
 * Shared modal/wizard that allows users to start a chat by selecting the missing party.
 *
 * There are two supported modes:
 * - `avatar-to-scenario`: an avatar is fixed and the user selects the scenario (existing AvatarScenarioModal use case)
 * - `scenario-to-avatar`: a scenario is fixed and the user selects the avatar (existing ScenarioAvatarModal use case)
 *
 * The wizard manages fetching, selection, confirms, and chat creation.
 */
export type ChatSelectionWizardMode = 'avatar-to-scenario' | 'scenario-to-avatar';

type AvatarToScenarioWizardProps = {
  mode: 'avatar-to-scenario';
  avatar: Avatar;
  scenario?: never;
  children: React.ReactNode;
  customAction?: {
    text?: string;
    onClick?: (avatar: Avatar, scenario: Scenario | null) => void;
  };
};

type ScenarioToAvatarWizardProps = {
  mode: 'scenario-to-avatar';
  scenario: Scenario;
  avatar?: never;
  children: React.ReactNode;
};

export type ChatSelectionWizardProps = AvatarToScenarioWizardProps | ScenarioToAvatarWizardProps;

const ChatSelectionWizard: React.FC<ChatSelectionWizardProps> = (props) => {
  const wizard = useChatSelectionWizard(props);

  if (wizard.variant === 'avatar-to-scenario') {
    return (
      <SelectionModal<Scenario>
        type='scenario'
        isOpen={wizard.isOpen}
        onOpenChange={wizard.setIsOpen}
        selectedAvatar={wizard.selectedAvatar}
        selectedScenario={wizard.selectedScenario}
        controls={{
          searchValue: wizard.searchValue,
          onSearchChange: wizard.onSearchChange,
        }}
        list={{
          items: wizard.items,
          recommendedItems: wizard.recommendedItems,
          isLoading: wizard.isLoading,
          hasNextPage: wizard.hasNextPage,
          fetchNextPage: wizard.fetchNextPage,
          isFetchingNextPage: wizard.isFetchingNextPage,
          renderItem: (item, _isRecommended) => (
            <ScenarioItem
              key={item.id}
              item={item}
              isSelected={wizard.selectedScenario?.id === item.id}
              onClick={() => wizard.onItemSelect(item)}
            />
          ),
        }}
        actions={{
          onPrimary: wizard.onSave,
          primaryLabel: wizard.customActionButtonText ?? 'Start Chat',
          disabled: wizard.isActionDisabled,
          loading: wizard.isActionLoading,
        }}
        isOverlayed={wizard.isOverlayed}
      >
        {props.children}
      </SelectionModal>
    );
  }

  return (
    <SelectionModal<Avatar>
      type='avatar'
      isOpen={wizard.isOpen}
      onOpenChange={wizard.setIsOpen}
      selectedAvatar={wizard.selectedAvatar}
      selectedScenario={wizard.selectedScenario}
      controls={{
        searchValue: wizard.searchValue,
        onSearchChange: wizard.onSearchChange,
      }}
      list={{
        items: wizard.items,
        recommendedItems: wizard.recommendedItems,
        isLoading: wizard.isLoading,
        hasNextPage: wizard.hasNextPage,
        fetchNextPage: wizard.fetchNextPage,
        isFetchingNextPage: wizard.isFetchingNextPage,
        renderItem: (item, _isRecommended) => (
          <AvatarItem
            key={item.id}
            item={item}
            isSelected={wizard.selectedAvatar?.id === item.id}
            onClick={() => wizard.onItemSelect(item)}
          />
        ),
      }}
      actions={{
        onPrimary: wizard.onSave,
        primaryLabel: 'Start Chat',
        disabled: wizard.isActionDisabled,
        loading: wizard.isActionLoading,
      }}
      isOverlayed={wizard.isOverlayed}
    >
      {props.children}
    </SelectionModal>
  );
};

export default ChatSelectionWizard;

const ScenarioItem = ({ item, isSelected, onClick }: { item: Scenario; isSelected: boolean; onClick: () => void }) => {
  const isFree = item.free;
  return (
    <button
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

      <div className='absolute right-1 -top-2.5 flex gap-1'>
        {item.userGender === 'Male' || item.userGender === 'Female' || item.avatarGender === 'Male' || item.avatarGender === 'Female' ? (
          item.userGender === item.avatarGender && (item.userGender === 'Male' || item.userGender === 'Female') ? (
            <Tooltip
              side='top'
              variant='light'
              trigger={
                <div
                  className={cn(
                    'flex py-0.5 px-1.5 gap-0.5 rounded-full text-xs text-base-black font-semibold',
                    item.userGender === 'Male' && 'bg-[#069cf3]',
                    item.userGender === 'Female' && 'bg-[#FF85B7]'
                  )}
                >
                  {item.userGender === 'Male' ? '🧔🏻‍♂️' : '👩🏻'}
                </div>
              }
              content={`Both user and avatar are ${item.userGender?.toLowerCase()} in this scenario`}
            />
          ) : (
            <div className='flex rounded-full overflow-hidden text-xs text-base-black font-semibold'>
              {(item.userGender === 'Male' || item.userGender === 'Female') && (
                <Tooltip
                  side='top'
                  variant='light'
                  trigger={
                    <div
                      className={cn(
                        'flex py-0.5 px-1.5 gap-0.5',
                        item.userGender === 'Male' && 'bg-[#069cf3]',
                        item.userGender === 'Female' && 'bg-[#FF85B7]'
                      )}
                    >
                      {item.userGender === 'Male' ? '🧔🏻‍♂️' : '👩🏻'}
                    </div>
                  }
                  content={`User is ${item.userGender?.toLowerCase()} in this scenario`}
                />
              )}
              {(item.avatarGender === 'Male' || item.avatarGender === 'Female') && (
                <Tooltip
                  side='top'
                  variant='light'
                  trigger={
                    <div
                      className={cn(
                        'flex py-0.5 px-1.5 gap-0.5',
                        item.avatarGender === 'Male' && 'bg-[#069cf3]',
                        item.avatarGender === 'Female' && 'bg-[#FF85B7]'
                      )}
                    >
                      {item.avatarGender === 'Male' ? '🧔🏻‍♂️' : '👩🏻'}
                    </div>
                  }
                  content={`Avatar is ${item.avatarGender?.toLowerCase()} in this scenario`}
                />
              )}
            </div>
          )
        ) : (
          (item.userGender || item.avatarGender) && (
            <Tooltip
              side='top'
              variant='light'
              trigger={
                <div className='flex py-0.5 px-1.5 gap-0.5 rounded-full bg-gradient-1 text-xs text-base-black font-semibold'>👤</div>
              }
              content='Gender is not specified in this scenario'
            />
          )
        )}
        {isFree && <FreeToUseBadge />}
      </div>
    </button>
  );
};

const AvatarItem = ({ item, isSelected, onClick }: { item: Avatar; isSelected: boolean; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl border transition-all text-left w-full relative',
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-04 hover:border-neutral-03 hover:bg-neutral-05'
      )}
      disabled={isSelected}
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
    </button>
  );
};
