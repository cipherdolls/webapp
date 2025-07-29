import { Link, NavLink, Outlet, useNavigate, useRouteLoaderData, useSearchParams } from 'react-router';
import type { GenderFilter, ScenariosPaginated, User } from '~/types';
import type { Route } from './+types/_main._general.scenarios';
import { fetchPaginatedData } from '~/utils/fetchWithAuth';
import SearchScenarios from '~/components/ui/search-scenarios';
import React, { useEffect, useMemo, useState } from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll';
import { getPicture } from '~/utils/getPicture';
import * as Popover from '~/components/ui/popover';
import RecommendedBadge from '~/components/ui/RecommendedBadge';
import Tooltip from '~/components/ui/tooltip';
import ScenarioAvatarModal from '~/components/ScenarioAvatarModal';

function ScenarioSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5 w-full'>
      <div className='rounded-[10px] h-[52px] bg-gradient-1 w-full animate-pulse mb-8'></div>
      {Array.from({ length: count }).map((_, i) => (
        <div className='flex flex-col gap-5' key={i}>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse max-w-[200px]'></div>
          <div className='grid md:gap-5 gap-3.5 grid-cols-1 sm:grid-cols-2'>
            <div className='rounded-[10px] h-[212px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[212px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[212px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[212px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Scenarios' }];
}

export async function clientLoader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Default to published=true if no filter params provided
  if (!searchParams.has('mine') && !searchParams.has('published')) {
    searchParams.set('published', 'true');
  }

  // Add server-side sorting
  searchParams.set('sortBy', 'updatedAt');
  searchParams.set('sortOrder', 'desc');

  const scenariosPaginated = await fetchPaginatedData<ScenariosPaginated>('scenarios', searchParams, 1, 10);

  return {
    scenariosPaginated,
    searchParams: Object.fromEntries(searchParams.entries()),
  };
}

export default function ScenariosIndex({ loaderData }: Route.ComponentProps) {
  const { scenariosPaginated, searchParams: initialSearchParams } = loaderData;

  const me = useRouteLoaderData('routes/_main') as User;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const showMyScenarios = searchParams.has('mine');
  const searchQuery = searchParams.get('name') || '';
  const userGenderFilter = (searchParams.get('userGender') as GenderFilter) || 'All';
  const avatarGenderFilter = (searchParams.get('avatarGender') as GenderFilter) || 'All';

  // Check if there are any active filters (excluding the default published=true and mine toggle)
  const hasActiveFilters = searchQuery.length > 0 || userGenderFilter !== 'All' || avatarGenderFilter !== 'All';

  const fetchMoreWithParams = async (page: number) => {
    // Use the initial search params from the loader which include all defaults and normalization
    const currentSearchParams = new URLSearchParams(initialSearchParams);

    // Override with any current URL changes (like search input)
    for (const [key, value] of searchParams.entries()) {
      currentSearchParams.set(key, value);
    }

    // Add server-side sorting
    currentSearchParams.set('sortBy', 'updatedAt');
    currentSearchParams.set('sortOrder', 'desc');

    return fetchPaginatedData<ScenariosPaginated>('scenarios', currentSearchParams, page, 10);
  };

  const infiniteScroll = useInfiniteScroll({
    initialData: scenariosPaginated.data,
    initialMeta: scenariosPaginated.meta,
    fetchMore: fetchMoreWithParams,
    enabled: hasInitiallyLoaded,
  });

  const handleToggle = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('mine');
    newSearchParams.delete('published');

    if (showMyScenarios) {
      newSearchParams.set('published', 'true');
    } else {
      newSearchParams.set('mine', 'true');
    }

    navigate(`/scenarios?${newSearchParams.toString()}`);
  };

  const handleClearFilters = () => {
    // Navigate to default state (public scenarios only)
    navigate('/scenarios?published=true');
  };

  const handleUserGenderFilterChange = (filter: GenderFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (filter === 'All') {
      newSearchParams.delete('userGender');
    } else {
      newSearchParams.set('userGender', filter);
    }
    navigate(`/scenarios?${newSearchParams.toString()}`);
  };

  const handleAvatarGenderFilterChange = (filter: GenderFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (filter === 'All') {
      newSearchParams.delete('avatarGender');
    } else {
      newSearchParams.set('avatarGender', filter);
    }
    navigate(`/scenarios?${newSearchParams.toString()}`);
  };

  const filteredAndSortedScenarios = useMemo(() => {
    return infiniteScroll.data;
  }, [infiniteScroll.data]);

  useEffect(() => {
    if (loaderData) {
      const timer = setTimeout(() => {
        setHasInitiallyLoaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loaderData]);

  if (!hasInitiallyLoaded || !loaderData) {
    return (
      <>
        <ScenarioSkeleton />
        <Outlet />
      </>
    );
  }

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between sm:mt-8 mb-4'>
        <h2 className='text-2xl font-semibold '>Scenarios</h2>

        <NavLink to={'/scenarios/new'}>
          <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
            <Button.Icon as={Icons.add} />
            Add New Scenario
          </Button.Root>
        </NavLink>
      </div>

      <div className='flex flex-col gap-5'>
        <SearchScenarios />
        <div className='flex flex-col gap-4 md:flex-row items-center justify-between'>
          <div className='flex flex-1 items-center gap-3'>
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer navigation-exclude ${
                !showMyScenarios ? 'bg-gradient-1 text-base-black' : 'text-base-black hover:bg-neutral-05'
              }`}
            >
              <p className='text-body-md font-medium'>Public Scenarios</p>
            </button>
            <span className='text-neutral-01'>|</span>
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer navigation-exclude ${
                showMyScenarios ? 'bg-gradient-1 text-base-black' : 'text-base-black hover:bg-neutral-05'
              }`}
            >
              <p className='text-body-md font-medium'>My Scenarios</p>
            </button>
          </div>

          <div className='flex items-center gap-3 md:justify-end md:flex-wrap'>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className='flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer navigation-exclude text-red-600 hover:bg-red-50'
              >
                <Icons.close className='size-4' />
                <p className='text-body-md font-medium'>Clear filters</p>
              </button>
            )}
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button.Root variant='secondary' size='sm' className='px-2 sm:px-4'>
                  <Icons.preferences className='size-4' />
                  User Gender: {userGenderFilter}
                  <Icons.chevronDown className='size-4' />
                </Button.Root>
              </Popover.Trigger>
              <Popover.Content className='w-48 p-0'>
                <div className='p-1'>
                  {(['All', 'Male', 'Female', 'Other'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleUserGenderFilterChange(filter)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        userGenderFilter === filter ? 'bg-gradient-1 text-base-black font-medium' : 'text-neutral-01 hover:bg-neutral-05'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Root>

            <Popover.Root>
              <Popover.Trigger asChild>
                <Button.Root variant='secondary' size='sm' className='px-2 sm:px-4'>
                  <Icons.preferences className='size-4' />
                  Avatar Gender: {avatarGenderFilter}
                  <Icons.chevronDown className='size-4' />
                </Button.Root>
              </Popover.Trigger>
              <Popover.Content className='w-48 p-0'>
                <div className='p-1'>
                  {(['All', 'Male', 'Female', 'Other'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleAvatarGenderFilterChange(filter)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        avatarGenderFilter === filter ? 'bg-gradient-1 text-base-black font-medium' : 'text-neutral-01 hover:bg-neutral-05'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
        </div>
        <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5 pb-10'>
          {filteredAndSortedScenarios.length === 0 ? (
            <p className='text-body-md text-neutral-01 text-center md:col-span-2 col-span-1'>
              {showMyScenarios ? 'No scenarios found.' : 'No published scenarios found.'}
            </p>
          ) : (
            filteredAndSortedScenarios.map((scenario) => (
              <div className='transition-all duration-500 ease-out' key={scenario.id}>
                <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                  <Link to={`/scenarios/${scenario.id}`} className='block h-[200px] sm:h-[152px] md:h-[200px] rounded-xl bg-black relative'>
                    <img
                      src={getPicture(scenario, 'scenarios', false)}
                      srcSet={getPicture(scenario, 'scenarios', true)}
                      alt={`${scenario.name} picture`}
                      className='object-cover size-full'
                    />
                    {!showMyScenarios && me.id === scenario.userId && (
                      <div className='absolute top-2 left-2 z-10'>
                        <div className='flex items-center gap-1 bg-gradient-1 py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                          🌐
                          <span>By you</span>
                        </div>
                      </div>
                    )}
                    {(scenario.userGender || scenario.avatarGender) && (
                      <div className='absolute top-2 right-2 z-10'>
                        <div className='flex items-center gap-1'>
                          {scenario.userGender && (
                            <div className='bg-gradient-1 py-1 px-2 rounded-full text-label text-base-black font-semibold'>
                              👤 {scenario.userGender}
                            </div>
                          )}
                          {scenario.avatarGender && (
                            <div className='bg-gradient-1 py-1 px-2 rounded-full text-label text-base-black font-semibold'>
                              🤖 {scenario.avatarGender}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>
                  <div className='py-[18px] px-5 flex lg:items-center gap-5 justify-between flex-1 lg:flex-row flex-col'>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <h4 className='text-heading-h4 text-base-black'>{scenario.name}</h4>
                        <RecommendedBadge recommended={scenario.recommended} tooltipText='Recommended' className='pt-1' />

                        {scenario.chatModel.error && (
                          <Tooltip
                            side={'top'}
                            trigger={<Icons.warning className='size-4 text-specials-danger' />}
                            content={scenario.chatModel.error}
                            className='max-w-[350px]'
                            popoverClassName='max-w-[320px]'
                          />
                        )}

                        {scenario.embeddingModel.error && (
                          <Tooltip
                            side={'top'}
                            trigger={<Icons.warning className='size-4 text-specials-danger' />}
                            content={scenario.embeddingModel.error}
                            className='max-w-[350px]'
                            popoverClassName='max-w-[320px]'
                          />
                        )}

                        {scenario.reasoningModel?.error && (
                          <Tooltip
                            side={'top'}
                            trigger={<Icons.warning className='size-4 text-specials-danger' />}
                            content={scenario.reasoningModel?.error}
                            className='max-w-[350px]'
                            popoverClassName='max-w-[320px]'
                          />
                        )}
                      </div>
                      {scenario.introduction && <p className='text-body-md text-neutral-01 line-clamp-2'>{scenario.introduction}</p>}
                    </div>
                    <div className='flex items-center gap-3'>
                      <ScenarioAvatarModal scenario={scenario}>
                        <Button.Root size='sm' className='px-5'>
                          {scenario.chats && scenario.chats.length > 0 ? 'Continue Chat' : 'Chat'}
                        </Button.Root>
                      </ScenarioAvatarModal>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {infiniteScroll.error && (
          <div className='text-center text-red-500 py-4'>
            <p>Failed to load scenarios: {infiniteScroll.error}</p>
          </div>
        )}
        {infiniteScroll.loading && (
          <div className='text-center py-4'>
            <div className='inline-flex items-center gap-2'>
              <Icons.loading className='size-4 animate-spin' />
              <span className='text-neutral-01'>Loading more scenarios...</span>
            </div>
          </div>
        )}
        {infiniteScroll.hasMore && !infiniteScroll.loading && <div ref={infiniteScroll.triggerRef} className='h-4' />}
        <Outlet />
      </div>
    </div>
  );
}
