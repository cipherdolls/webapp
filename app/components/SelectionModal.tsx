import { useState, useRef, useEffect } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import { Icons } from './ui/icons';
import { getPicture } from '~/utils/getPicture';
import type { Avatar, Scenario } from '~/types';

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
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  renderItem: (item: T, isSelected: boolean, onClick: () => void) => React.ReactNode;
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
              <div className='w-full h-full bg-gradient-1 bg-neutral-05 opacity-30' />
            )}
          </div>

          {selectedAvatar?.picture && (
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2'>
              <div className='w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg'>
                <img
                  src={getPicture(selectedAvatar, 'avatars', false)}
                  srcSet={getPicture(selectedAvatar, 'avatars', true)}
                  alt={selectedAvatar.name}
                  className='w-full h-full object-cover'
                />
              </div>
            </div>
          )}
        </div>

        <Modal.Title className='text-center mt-14'>{`Select ${isAvatar ? 'Avatar' : 'Scenario'}`}</Modal.Title>

        <Modal.Description className='text-center'>{`Choose a ${isAvatar ? 'Avatar' : 'Scenario'} for ${isAvatar ? selectedScenario?.name : selectedAvatar?.name}`}</Modal.Description>

        <Modal.Body className='py-6'>
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
              {items.map((item) => renderItem(item, false, () => {}))}

              {items.length === 0 && !isLoading && (
                <div className='text-center py-8 text-neutral-01'>
                  <p>{`No ${isAvatar ? 'Avatars' : 'Scenarios'} found`}</p>
                  {searchValue && <p className='text-sm mt-1'>Try adjusting your search terms</p>}
                </div>
              )}

              {hasNextPage && (
                <div className='flex justify-center py-3'>
                  <Button.Root variant='secondary' size='sm' className='px-6' onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Loading...' : 'Load More'}
                  </Button.Root>
                </div>
              )}
            </div>
          </div>
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
