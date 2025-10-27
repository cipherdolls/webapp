import { useState, useRef, useEffect } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import * as Tabs from '@radix-ui/react-tabs';
import { Icons } from './ui/icons';
import { getPicture } from '~/utils/getPicture';
import type { Avatar, Scenario } from '~/types';
import { ThumbsUp } from 'lucide-react';

interface SelectionModalProps<T> {
  type: 'avatar' | 'scenario';
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedScenario: Scenario | null;
  selectedAvatar: Avatar | null;
  onSave: () => void;
  children: React.ReactNode;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  items: T[];
  recommendedItems: T[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  renderItem: (item: T, isRecommended?: boolean) => React.ReactNode;
}

const ITEMS_PER_PAGE = 4;
const DEBOUNCE_DELAY = 300;

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
  onSave,
  children,
  isLoading,
  onSearchChange,
  items,
  recommendedItems,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  renderItem,
}: SelectionModalProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounceValue(searchValue, DEBOUNCE_DELAY);

  useEffect(() => {
    onSearchChange?.(debouncedSearchValue);
  }, [debouncedSearchValue, onSearchChange]);

  const handleSave = async () => {
    onSave();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
  };

  const isAvatar = type === 'avatar';

  const isNoRecommendedItems = recommendedItems && recommendedItems.length === 0;

  return (
    <Modal.Root open={isOpen} onOpenChange={onOpenChange}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content className='max-w-2xl'>
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

        <Modal.Body className='py-6'>
          <Tabs.Root defaultValue={isNoRecommendedItems ? 'all' : 'recommended'} className='w-full'>
            {!isNoRecommendedItems && (
              <>
                <Tabs.List className='flex  mb-6'>
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
                  <div className='flex flex-col gap-4'>
                    {/* Get recommended items based on type */}

                    {recommendedItems && recommendedItems.length > 0 ? (
                      <div className='flex flex-col gap-4 max-h-96 overflow-y-auto'>
                        {recommendedItems.map((item) => renderItem(item as T, true))}
                      </div>
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
                <Input.Root>
                  <Input.Input
                    type='text'
                    placeholder={`Search ${isAvatar ? 'Avatars' : 'Scenarios'}...`}
                    className='py-2 pl-10 text-sm'
                    value={searchValue}
                    onChange={handleSearchChange}
                    autoComplete='off'
                  />
                  <Input.Icon as={Icons.search} className='[&_svg]:size-4 peer-focus:bg-transparent!' />
                </Input.Root>

                {isLoading && (
                  <>
                    {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
                      <SkeletonItem key={`skeleton-${index}`} />
                    ))}
                  </>
                )}
                <div className='flex flex-col gap-4 max-h-96 overflow-y-auto'>
                  {items.map((item) => renderItem(item, false))}

                  {items.length === 0 && !isLoading && (
                    <div className='text-center py-8 text-neutral-01'>
                      <p>{`No ${isAvatar ? 'Avatars' : 'Scenarios'} found`}</p>
                      {searchValue && <p className='text-sm mt-1'>Try adjusting your search terms</p>}
                    </div>
                  )}

                  {hasNextPage && (
                    <div className='flex justify-center py-3'>
                      <Button.Root
                        variant='secondary'
                        size='sm'
                        className='px-6'
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? 'Loading...' : 'Load More'}
                      </Button.Root>
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root variant='secondary' className='w-full'>
              Cancel
            </Button.Root>
          </Modal.Close>
          <Button.Root onClick={handleSave} className='w-full'>
            Start Chat
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default SelectionModal;
