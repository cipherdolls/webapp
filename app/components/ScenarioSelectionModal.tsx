import { useState, useEffect } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import { Icons } from './ui/icons';
import { getPicture } from '~/utils/getPicture';
import type { Avatar, Scenario } from '~/types';

interface ScenarioSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedScenario: Scenario | null;
  selectedAvatar: Avatar | null;
  onScenarioSelect: (scenario: Scenario) => void;
  children: React.ReactNode;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  items: Scenario[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  renderItem: (item: Scenario, isSelected: boolean, onClick: () => void) => React.ReactNode;
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

export function ScenarioSelectionModal({
  isOpen,
  onOpenChange,
  selectedScenario,
  selectedAvatar,
  onScenarioSelect,
  children,
  isLoading,
  onSearchChange,
  items,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  renderItem,
}: ScenarioSelectionModalProps) {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounceValue(searchValue, DEBOUNCE_DELAY);
  const [selectedScenarioInModal, setSelectedScenarioInModal] = useState<Scenario | null>(selectedScenario);

  useEffect(() => {
    onSearchChange?.(debouncedSearchValue);
  }, [debouncedSearchValue, onSearchChange]);

  useEffect(() => {
    setSelectedScenarioInModal(selectedScenario);
  }, [selectedScenario]);

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenarioInModal(scenario);
  };

  const handleConfirmSelection = () => {
    if (selectedScenarioInModal) {
      onScenarioSelect(selectedScenarioInModal);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={onOpenChange}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content className='max-w-2xl'>
        <div className='relative h-32 -mx-8 -mt-8 mb-6'>
          <div className='absolute inset-0 bg-gradient-1 rounded-t-xl overflow-hidden'>
            {selectedScenarioInModal?.picture ? (
              <img
                src={getPicture(selectedScenarioInModal, 'scenarios', false)}
                srcSet={getPicture(selectedScenarioInModal, 'scenarios', true)}
                alt={selectedScenarioInModal.name}
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

        <Modal.Title className='text-center mt-14'>Select Scenario</Modal.Title>

        <Modal.Description className='text-center'>Choose a scenario for {selectedAvatar?.name}</Modal.Description>

        <Modal.Body className='py-6'>
          <div className='flex flex-col gap-4'>
            <Input.Root>
              <Input.Input
                type='text'
                placeholder='Search Scenarios...'
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
              {items.map((scenario) => (
                <div key={scenario.id}>
                  {renderItem(scenario, selectedScenarioInModal?.id === scenario.id, () => handleScenarioSelect(scenario))}
                </div>
              ))}

              {items.length === 0 && !isLoading && (
                <div className='text-center py-8 text-neutral-01'>
                  <p>No Scenarios found</p>
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
          <Button.Root 
            onClick={handleConfirmSelection} 
            className='w-full'
            disabled={!selectedScenarioInModal}
          >
            Select Scenario
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}

export default ScenarioSelectionModal;