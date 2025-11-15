import { useMemo, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Tabs from '@radix-ui/react-tabs';
import { Icons } from './ui/icons';
import { getPicture } from '~/utils/getPicture';
import type { Avatar, Scenario } from '~/types';
import { Loader2, ThumbsUp } from 'lucide-react';
import { cn } from '~/utils/cn';
import { useAuthStore } from '~/store/useAuthStore';
import { useShallow } from 'zustand/react/shallow';
import LoginButton from './website/LoginButton';
import FreeToUseBadge from './FreeToUseBadge';

interface SelectionControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
}

interface SelectionListProps<T> {
  items: T[];
  recommendedItems: T[];
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  renderItem: (item: T, isRecommended?: boolean) => React.ReactNode;
}

interface SelectionActionsProps {
  onPrimary: () => void;
  primaryLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  customPrimary?: ReactNode;
}

interface SelectionModalProps<T> {
  type: 'avatar' | 'scenario';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedScenario: Scenario | null;
  selectedAvatar: Avatar | null;
  children: ReactNode;
  controls: SelectionControlsProps;
  list: SelectionListProps<T>;
  actions: SelectionActionsProps;
  isOverlayed?: boolean; // Optional prop to control the blur effect
}

const ITEMS_PER_PAGE = 4;

const SkeletonItem = () => (
  <div className='flex items-start gap-3 p-3 rounded-xl border border-neutral-04 animate-pulse'>
    <div className='w-12 h-12 rounded-full bg-neutral-04' />
    <div className='flex-1 min-w-0'>
      <div className='h-4 bg-neutral-04 rounded mb-2 w-3/4' />
      <div className='h-[17px] bg-neutral-04 rounded w-full' />
      <div className='h-[17px] bg-neutral-04 rounded w-full mt-1.5' />
    </div>
  </div>
);

export function SelectionModal<T>({
  type,
  isOpen,
  onOpenChange,
  selectedScenario,
  selectedAvatar,
  children,
  controls,
  list,
  actions,
  isOverlayed,
}: SelectionModalProps<T>) {
  const { isUsingBurnerWallet } = useAuthStore(
    useShallow((state) => ({
      isUsingBurnerWallet: state.isUsingBurnerWallet,
    }))
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [loadMoreRef, { rootRef }] = useInfiniteScroll({
    loading: list.isFetchingNextPage,
    hasNextPage: list.hasNextPage,
    onLoadMore: list.fetchNextPage,
    disabled: !list.hasNextPage,
    rootMargin: '0px 0px 200px 0px',
  });

  const handleScrollContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollContainerRef.current = node;
      rootRef(node);
    },
    [rootRef]
  );

  const isAvatar = type === 'avatar';

  const isNoRecommendedItems = list.recommendedItems && list.recommendedItems.length === 0;
  const isUsingBurnerWalletAndNoSponsor = isUsingBurnerWallet && !selectedScenario?.sponsorships?.length;

  const searchPlaceholder = useMemo(() => {
    if (controls.searchPlaceholder) return controls.searchPlaceholder;
    return `Search ${isAvatar ? 'Avatars' : 'Scenarios'}...`;
  }, [controls.searchPlaceholder, isAvatar]);

  const renderItems = () => {
    if (list.isLoading) {
      return (
        <>
          {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
            <SkeletonItem key={`skeleton-${index}`} />
          ))}
        </>
      );
    }

    return (
      <>
        {list.items.map((item) => list.renderItem(item, false))}

        {list.items.length === 0 && (
          <div className='text-center py-8 text-neutral-01'>
            <p>{`No ${isAvatar ? 'Avatars' : 'Scenarios'} found`}</p>
            {controls.searchValue && <p className='text-sm mt-1'>Try adjusting your search terms</p>}
          </div>
        )}
      </>
    );
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={onOpenChange}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content className={cn('max-w-2xl pb-0', isOverlayed && 'blur-xs')}>
        <div className='relative h-32 -mx-8 -mt-8 mb-6'>
          <div className='absolute inset-0 bg-gradient-1 rounded-t-xl overflow-hidden'>
            {selectedScenario?.picture ? (
              <img
                src={getPicture(selectedScenario, 'scenarios', false)}
                srcSet={getPicture(selectedScenario, 'scenarios', true)}
                alt={selectedScenario.name}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gradient-1 bg-neutral-03' />
            )}
          </div>

          <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2'>
            <div className='w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg'>
              <img
                src={getPicture(selectedAvatar, 'avatars', false)}
                srcSet={getPicture(selectedAvatar, 'avatars', true)}
                alt={selectedAvatar?.name ?? 'Avatar picture'}
                className='w-full h-full object-cover'
              />
            </div>
          </div>
        </div>

        <Modal.Title className='text-center mt-14'>{`Select ${isAvatar ? 'Avatar' : 'Scenario'}`}</Modal.Title>

        <Modal.Description className='text-center'>{`Choose a ${isAvatar ? 'Avatar' : 'Scenario'} for ${isAvatar ? selectedScenario?.name : selectedAvatar?.name}`}</Modal.Description>

        <Modal.Body className='py-3'>
          <Tabs.Root defaultValue={isNoRecommendedItems ? 'all' : 'recommended'} className='w-full'>
            {!isNoRecommendedItems && (
              <>
                <Tabs.List className='flex'>
                  <Tabs.Trigger
                    value='recommended'
                    className='flex-1 py-3 px-1 text-sm border-b-2 border-transparent border-b-gray-300 data-[state=active]:border-base-black data-[state=active]:text-base-black text-neutral-01 hover:text-base-black hover:border-neutral-03 transition duration-400 flex items-center justify-center gap-2'
                  >
                    <ThumbsUp className='w-4 h-4 text-specials-success' />
                    Recommended
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value='all'
                    className='flex-1 py-3 px-1 text-sm border-b-2 border-transparent  border-b-gray-300 data-[state=active]:border-base-black data-[state=active]:text-base-black text-neutral-01 hover:text-base-black hover:border-neutral-03 transition duration-400 flex items-center justify-center gap-2'
                  >
                    All {isAvatar ? 'Avatars' : 'Scenarios'}
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value='recommended' className='focus:outline-none'>
                  <div className='flex flex-col gap-4 max-h-96 overflow-y-auto pt-5'>
                    {/* Get recommended items based on type */}

                    {list.recommendedItems && list.recommendedItems.length > 0 ? (
                      <>{list.recommendedItems.map((item) => list.renderItem(item as T, true))}</>
                    ) : (
                      <div className='text-center py-8 text-neutral-01'>
                        <p>No recommended {isAvatar ? 'Avatars' : 'Scenarios'} found</p>
                      </div>
                    )}
                  </div>
                </Tabs.Content>
              </>
            )}

            <Tabs.Content value='all' className='focus:outline-none'>
              <div className='flex flex-col gap-4'>
                <div className='mt-5 flex flex-col gap-2'>
                  <Input.Root>
                    <Input.Input
                      type='text'
                      placeholder={searchPlaceholder}
                      className='py-2 pl-10 text-sm'
                      value={controls.searchValue}
                      onChange={(e) => controls.onSearchChange(e.target.value)}
                      autoComplete='off'
                    />
                    <Input.Icon as={Icons.search} className='[&_svg]:size-4 peer-focus:bg-transparent!' />
                  </Input.Root>
                  {controls.filters}
                </div>

                <div className='flex flex-col  max-h-96 overflow-y-auto pt-5' ref={handleScrollContainerRef}>
                  <div className='flex flex-col gap-4 flex-1'>
                    {renderItems()}
                  </div>
                  <div ref={loadMoreRef} />
                  {list.isFetchingNextPage && (
                    <div className='flex justify-center py-4'>
                      <Loader2 className='size-8 animate-spin text-neutral-01' />
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </Modal.Body>

        <Modal.Footer className='pt-2 pb-5 flex-col sticky bottom-0 bg-white'>
          {isUsingBurnerWalletAndNoSponsor && (
            <p className='text-center bg-neutral-05 p-2 rounded-md text-sm'>
              This scenario is for registered users. Create a free account to chat with
              {selectedAvatar?.name} or try the <FreeToUseBadge className='inline-block' /> scenario.
            </p>
          )}
          <div className='grid grid-cols-2 gap-2 w-full'>
            <Modal.Close asChild>
              <Button.Root variant='secondary' className='w-full'>
                Cancel
              </Button.Root>
            </Modal.Close>
            {isUsingBurnerWalletAndNoSponsor ? (
              <LoginButton size='md' className='w-full'>
                Create Account
              </LoginButton>
            ) : (
              <>
                {actions.customPrimary ? (
                  actions.customPrimary
                ) : (
                  <Button.Root onClick={actions.onPrimary} className='w-full' disabled={actions.disabled}>
                    {actions.loading ? 'Starting...' : actions.primaryLabel ? actions.primaryLabel : 'Start Chat'}
                  </Button.Root>
                )}
              </>
            )}
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default SelectionModal;
