import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import * as Modal from '~/components/ui/new-modal';
import * as Button from '~/components/ui/button/button';
import * as Input from '~/components/ui/input/input';
import { Icons } from './ui/icons';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';
import { fetchPaginatedData } from '~/utils/fetchWithAuth';
import type { Avatar, Scenario } from '~/types';

interface SelectionModalProps {
  type: 'avatar' | 'scenario';
  scenario?: Scenario;
  avatar?: Avatar;
  onSave: (selectedIds: string[]) => void;
  onClose?: () => void;
  children: React.ReactNode;
}

type TabType = 'recommended' | 'others';

const ITEMS_PER_PAGE = 4;
const DEBOUNCE_DELAY = 300;

const SelectionModal: React.FC<SelectionModalProps> = ({ type, scenario, avatar, onSave, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('recommended');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounceValue(searchValue, DEBOUNCE_DELAY);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [othersData, setOthersData] = useState<(Avatar | Scenario)[]>([]);
  const [othersPage, setOthersPage] = useState(1);
  const [hasMoreOthers, setHasMoreOthers] = useState(true);
  const fetchingRef = useRef(false);

  const allRecommendedItems = type === 'avatar' 
    ? (avatar?.scenarios || []) as Scenario[]
    : (scenario?.avatars || []) as Avatar[];

  const [displayedRecommendedItems, setDisplayedRecommendedItems] = useState<(Avatar | Scenario)[]>([]);
  const [recommendedPage, setRecommendedPage] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('recommended');
      setSelectedItem(null);
      setSearchValue('');
      setOthersData([]);
      setOthersPage(1);
      setHasMoreOthers(true);
      setLoading(false);
      setLoadingMore(false);
      setDisplayedRecommendedItems([]);
      setRecommendedPage(1);
      fetchingRef.current = false;
    }
  }, [isOpen]);

  const fetchOthersData = useCallback(
    async (isLoadMore = false, forceTab?: TabType) => {
      const currentTab = forceTab || activeTab;
      if (currentTab !== 'others') return;
      if (isLoadMore && (!hasMoreOthers || loadingMore)) return;
      if (!isLoadMore && loading) return;
      if (fetchingRef.current) return;

      fetchingRef.current = true;

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const endpoint = type === 'avatar' ? 'scenarios' : 'avatars';
        const params = new URLSearchParams();
        params.set('published', 'true');
        if (debouncedSearchValue.trim()) {
          params.set('name', debouncedSearchValue.trim());
        }

        const pageToFetch = isLoadMore ? othersPage + 1 : 1;
        const data = await fetchPaginatedData<{ data: (Avatar | Scenario)[]; meta: { totalPages: number; page: number } }>(
          endpoint,
          params,
          pageToFetch,
          ITEMS_PER_PAGE
        );

        if (isLoadMore) {
          setOthersData((prev) => [...prev, ...(data.data || [])] as typeof prev);
          setOthersPage(pageToFetch);
        } else {
          setOthersData((data.data || []) as Avatar[] | Scenario[]);
          setOthersPage(1);
        }

        setHasMoreOthers(pageToFetch < data.meta.totalPages);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (!isLoadMore) setOthersData([]);
      } finally {
        fetchingRef.current = false;
        if (isLoadMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [type, debouncedSearchValue, hasMoreOthers, othersPage, loading, loadingMore]
  );

  const loadMoreRecommendedItems = useCallback(() => {
    const startIndex = (recommendedPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newItems = allRecommendedItems.slice(startIndex, endIndex);

    if (recommendedPage === 1) {
      setDisplayedRecommendedItems(newItems);
    } else {
      setDisplayedRecommendedItems((prev) => [...prev, ...newItems] as typeof prev);
    }

    setRecommendedPage((prev) => prev + 1);
  }, [allRecommendedItems.length, recommendedPage]);

  const hasMoreRecommended = displayedRecommendedItems.length < allRecommendedItems.length;
  useEffect(() => {
    if (activeTab === 'recommended' && displayedRecommendedItems.length === 0 && allRecommendedItems.length > 0) {
      const newItems = allRecommendedItems.slice(0, ITEMS_PER_PAGE);
      setDisplayedRecommendedItems(newItems);
      setRecommendedPage(2);
    }
  }, [activeTab, displayedRecommendedItems.length, allRecommendedItems.length]);

  useEffect(() => {
    if (activeTab === 'others' && othersData.length === 0 && !loading && !fetchingRef.current) {
      fetchOthersData(false, 'others');
    }
  }, [activeTab, othersData.length, loading]);

  useEffect(() => {
    if (activeTab === 'others' && !loading && !fetchingRef.current) {
      setOthersData([]);
      setOthersPage(1);
      setHasMoreOthers(true);
      fetchOthersData();
    }
  }, [debouncedSearchValue]);

  const loadMoreOthers = () => {
    if (!loading && !loadingMore && hasMoreOthers && !fetchingRef.current) {
      fetchOthersData(true);
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId === selectedItem ? null : itemId);
  };

  const selectedItemData = useMemo(() => 
    selectedItem ? [...allRecommendedItems, ...othersData].find((item) => item.id === selectedItem) : null,
    [selectedItem, allRecommendedItems, othersData]
  );

  const headerScenario = useMemo(() => 
    type === 'avatar' ? (selectedItemData as Scenario) || scenario : scenario,
    [type, selectedItemData, scenario]
  );

  const headerAvatar = useMemo(() => 
    type === 'scenario' ? (selectedItemData as Avatar) || avatar : avatar,
    [type, selectedItemData, avatar]
  );

  const handleSave = () => {
    if (selectedItem) {
      onSave([selectedItem]);
      setIsOpen(false);
    }
  };

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

  const SearchSkeleton = () => (
    <div className='animate-pulse'>
      <div className='h-[39px] bg-neutral-04 rounded-lg' />
    </div>
  );

  const isAvatar = (item: Avatar | Scenario): item is Avatar => 'character' in item;
  
  const renderItem = useCallback((item: Avatar | Scenario) => {
    const isSelected = selectedItem === item.id;
    const itemType = isAvatar(item) ? 'avatar' : 'scenario';

    return (
      <button
        key={item.id}
        onClick={() => handleItemSelect(item.id)}
        className={cn(
          'flex items-start gap-3 p-3 rounded-xl border transition-all text-left w-full',
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-04 hover:border-neutral-03 hover:bg-neutral-05'
        )}
      >
        <div className='relative'>
          <img
            src={getPicture(item, itemType === 'avatar' ? 'avatars' : 'scenarios', false)}
            srcSet={getPicture(item, itemType === 'avatar' ? 'avatars' : 'scenarios', true)}
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
          {isAvatar(item) && item.shortDesc && (
            <p className='text-sm text-neutral-01 line-clamp-2'>{item.shortDesc}</p>
          )}
          {!isAvatar(item) && item.introduction && (
            <p className='text-sm text-neutral-01 line-clamp-2'>{item.introduction}</p>
          )}
        </div>
      </button>
    );
  }, [selectedItem, handleItemSelect]);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content className='max-w-2xl'>
        <div className='relative h-32 -mx-8 -mt-8 mb-6'>
          <div className='absolute inset-0 bg-gradient-1 rounded-t-xl overflow-hidden'>
            {headerScenario?.picture ? (
              <img
                src={getPicture(headerScenario, 'scenarios', false)}
                srcSet={getPicture(headerScenario, 'scenarios', true)}
                alt={headerScenario.name}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-gradient-1 opacity-30' />
            )}
          </div>

          {headerAvatar?.picture && (
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2'>
              <div className='w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg'>
                <img
                  src={getPicture(headerAvatar, 'avatars', false)}
                  srcSet={getPicture(headerAvatar, 'avatars', true)}
                  alt={headerAvatar.name}
                  className='w-full h-full object-cover'
                />
              </div>
            </div>
          )}
        </div>

        <Modal.Title className='text-center mt-14'>Select {type === 'avatar' ? 'Scenarios' : 'Avatars'}</Modal.Title>

        <Modal.Description className='text-center'>
          Choose {type === 'avatar' ? 'scenarios' : 'avatars'} for "{type === 'avatar' ? headerAvatar?.name : headerScenario?.name}"
        </Modal.Description>

        <Modal.Body className='py-6'>
          <div className='border-b border-neutral-04 mb-6'>
            <div className='flex'>
              <button
                onClick={() => setActiveTab('recommended')}
                className={cn(
                  'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'recommended' ? 'border-primary text-primary' : 'border-transparent text-neutral-01 hover:text-base-black'
                )}
              >
                Recommended
              </button>
              <button
                onClick={() => setActiveTab('others')}
                className={cn(
                  'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'others' ? 'border-primary text-primary' : 'border-transparent text-neutral-01 hover:text-base-black'
                )}
              >
                Others
              </button>
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            {activeTab === 'recommended' ? (
              <div className='flex flex-col gap-3 max-h-96 overflow-y-auto'>
                {displayedRecommendedItems.length > 0 ? (
                  <>
                    <div className='flex flex-col gap-3'>{displayedRecommendedItems.map((item) => renderItem(item))}</div>
                    {hasMoreRecommended && (
                      <div className='flex justify-center pt-3'>
                        <Button.Root variant='secondary' size='sm' className='px-6' onClick={loadMoreRecommendedItems}>
                          Load More
                        </Button.Root>
                      </div>
                    )}
                  </>
                ) : (
                  <div className='text-center py-8 text-neutral-01'>
                    <p>No recommended {type === 'avatar' ? 'scenarios' : 'avatars'} available</p>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex flex-col gap-4'>
                {loading && othersData.length === 0 ? (
                  <SearchSkeleton />
                ) : (
                  <Input.Root>
                    <Input.Input
                      type='text'
                      placeholder={`Search ${type === 'avatar' ? 'scenarios' : 'avatars'}...`}
                      className='py-2 pl-10 text-sm'
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      autoComplete='off'
                    />
                    <Input.Icon as={Icons.search} className='[&_svg]:size-4' />
                  </Input.Root>
                )}

                {othersData.length > 0 || loading ? (
                  <div className='flex flex-col gap-3 max-h-96 overflow-y-auto'>
                    {othersData.map((item) => renderItem(item))}
                    
                    {loading && (
                      <>
                        {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
                          <SkeletonItem key={`skeleton-${index}`} />
                        ))}
                      </>
                    )}
                    
                    {othersData.length > 0 && hasMoreOthers && !loading && (
                      <div className='flex justify-center py-3'>
                        <Button.Root 
                          variant='secondary' 
                          size='sm'
                          className='px-6'
                          onClick={loadMoreOthers}
                          disabled={loadingMore}
                        >
                          {loadingMore ? 'Loading...' : 'Load More'}
                        </Button.Root>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='text-center py-8 text-neutral-01'>
                    <p>No {type === 'avatar' ? 'scenarios' : 'avatars'} found</p>
                    {searchValue && <p className='text-sm mt-1'>Try adjusting your search terms</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root variant='secondary' className='w-full'>
              Cancel
            </Button.Root>
          </Modal.Close>
          <Button.Root onClick={handleSave} disabled={!selectedItem} className='w-full'>
            Save
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default SelectionModal;
