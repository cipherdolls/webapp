import { Link, NavLink, Outlet, useNavigate, useRouteLoaderData, useSearchParams } from 'react-router';
import type { AvatarsPaginated, User } from '~/types';
import type { Route } from './+types/_main._general.avatars';
import { fetchPaginatedData } from '~/utils/fetchWithAuth';
import SearchAvatars from '~/components/ui/search-avatars';
import React, { useEffect, useMemo, useState } from 'react';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll';
import { getPicture } from '~/utils/getPicture';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import * as Popover from '~/components/ui/popover';
import AvatarScenarioModal from '~/components/AvatarScenarioModal';
import RecommendedBadge from '~/components/ui/RecommendedBadge';

type GenderFilter = 'All' | 'Male' | 'Female';

function AvatarSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-10 pb-5 w-full'>
      <div className='rounded-[10px] h-[52px] bg-gradient-1 w-full animate-pulse mb-8'></div>
      {Array.from({ length: count }).map((_, i) => (
        <div className='flex flex-col gap-5' key={i}>
          <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse max-w-[200px]'></div>
          <div className='grid md:gap-5 gap-3.5 grid-cols-1 sm:grid-cols-2'>
            <div className='rounded-[10px] h-[112px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[112px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[112px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-[112px] bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse'></div>
            <div className='rounded-[10px] h-6 bg-gradient-1 w-full animate-pulse'></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Avatars' }];
}

export async function clientLoader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // Default to published=true if no filter params provided
  if (!searchParams.has('mine') && !searchParams.has('published')) {
    searchParams.set('published', 'true');
  }

  // Ensure gender parameter is properly capitalized for API compatibility
  if (searchParams.has('gender')) {
    const gender = searchParams.get('gender');
    if (gender && gender !== 'All') {
      const capitalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      searchParams.set('gender', capitalizedGender);
    }
  }

  // Add server-side sorting
  searchParams.set('sortBy', 'updatedAt');
  searchParams.set('sortOrder', 'desc');

  const avatarsPaginated = await fetchPaginatedData<AvatarsPaginated>('avatars', searchParams, 1, 10);

  return {
    avatarsPaginated,
    searchParams: Object.fromEntries(searchParams.entries()),
  };
}

export default function AiProvidersIndex({ loaderData }: Route.ComponentProps) {
  const { avatarsPaginated, searchParams: initialSearchParams } = loaderData;

  const me = useRouteLoaderData('routes/_main') as User;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const showMyAvatars = searchParams.has('mine');
  const genderFilter = (searchParams.get('gender') as GenderFilter) || 'All';
  const searchQuery = searchParams.get('name') || '';

  // Check if there are any active filters (excluding the default published=true)
  const hasActiveFilters = showMyAvatars || genderFilter !== 'All' || searchQuery.length > 0;

  const fetchMoreWithParams = async (page: number) => {
    // Use the initial search params from the loader which include all defaults and normalization
    const currentSearchParams = new URLSearchParams(initialSearchParams);

    // Override with any current URL changes (like search input)
    for (const [key, value] of searchParams.entries()) {
      currentSearchParams.set(key, value);
    }

    // Ensure gender parameter is properly capitalized for API compatibility
    if (currentSearchParams.has('gender')) {
      const gender = currentSearchParams.get('gender');
      if (gender && gender !== 'All') {
        const capitalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
        currentSearchParams.set('gender', capitalizedGender);
      }
    }

    // Add server-side sorting
    currentSearchParams.set('sortBy', 'updatedAt');
    currentSearchParams.set('sortOrder', 'desc');

    return fetchPaginatedData<AvatarsPaginated>('avatars', currentSearchParams, page, 10);
  };

  const infiniteScroll = useInfiniteScroll({
    initialData: avatarsPaginated.data,
    initialMeta: avatarsPaginated.meta,
    fetchMore: fetchMoreWithParams,
    enabled: hasInitiallyLoaded,
  });

  const handleToggle = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('mine');
    newSearchParams.delete('published');

    if (showMyAvatars) {
      newSearchParams.set('published', 'true');
    } else {
      newSearchParams.set('mine', 'true');
    }

    navigate(`/avatars?${newSearchParams.toString()}`);
  };

  const handleFilterChange = (filter: GenderFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (filter === 'All') {
      newSearchParams.delete('gender');
    } else {
      newSearchParams.set('gender', filter);
    }

    navigate(`/avatars?${newSearchParams.toString()}`);
    setPopoverOpen(false);
  };

  const handleClearFilters = () => {
    // Navigate to default state (public avatars only)
    navigate('/avatars?published=true');
  };

  const filteredAndSortedAvatars = useMemo(() => {
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
        <AvatarSkeleton />
        <Outlet />
      </>
    );
  }

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between sm:mt-8 mb-4'>
        <h2 className='text-2xl font-semibold '>Avatars</h2>

        <NavLink to={'/avatars/new'}>
          <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
            <Button.Icon as={Icons.add} />
            Add New Avatar
          </Button.Root>
        </NavLink>
      </div>

      <div className='flex flex-col gap-5'>
        <SearchAvatars />
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer navigation-exclude ${
                !showMyAvatars ? 'bg-gradient-1 text-base-black' : 'text-base-black hover:bg-neutral-05'
              }`}
            >
              <p className='text-body-md font-medium'>Public Avatars</p>
            </button>
            <span className='text-neutral-01'>|</span>
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer navigation-exclude ${
                showMyAvatars ? 'bg-gradient-1 text-base-black' : 'text-base-black hover:bg-neutral-05'
              }`}
            >
              <p className='text-body-md font-medium'>My Avatars</p>
            </button>

            <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
              <Popover.Trigger
                className={`group navigation-exclude flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  genderFilter !== 'All' ? 'bg-gradient-1 text-base-black' : 'text-base-black hover:bg-neutral-05'
                }`}
              >
                <p className='text-body-md font-medium capitalize'>{genderFilter === 'All' ? 'All genders' : genderFilter}</p>
                <Icons.chevronDown className='size-6' />
              </Popover.Trigger>
              <Popover.Content side='bottom' align='end' className='flex flex-col navigation-exclude !w-[200px]'>
                <button
                  onClick={() => handleFilterChange('All')}
                  className={`cursor-pointer text-left w-full py-3.5 px-3 navigation-exclude ${genderFilter === 'All' ? 'bg-neutral-05' : 'hover:bg-neutral-05'} text-base-black bg-white transition-colors text-body-md font-semibold rounded-[10px]`}
                >
                  All genders
                </button>
                <button
                  onClick={() => handleFilterChange('Male')}
                  className={`cursor-pointer text-left w-full py-3.5 px-3 navigation-exclude ${genderFilter === 'Male' ? 'bg-neutral-05' : 'hover:bg-neutral-05'} text-base-black bg-white transition-colors text-body-md font-semibold rounded-[10px]`}
                >
                  Male
                </button>
                <button
                  onClick={() => handleFilterChange('Female')}
                  className={`cursor-pointer text-left w-full py-3.5 px-3 navigation-exclude ${genderFilter === 'Female' ? 'bg-neutral-05' : 'hover:bg-neutral-05'} text-base-black bg-white transition-colors text-body-md font-semibold rounded-[10px]`}
                >
                  Female
                </button>
              </Popover.Content>
            </Popover.Root>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className='flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer navigation-exclude text-red-600 hover:bg-red-50'
            >
              <Icons.close className='size-4' />
              <p className='text-body-md font-medium'>Clear filters</p>
            </button>
          )}
        </div>

        <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5 pb-10'>
          {filteredAndSortedAvatars.length === 0 ? (
            <p className='text-body-md text-neutral-01 text-center md:col-span-2 col-span-1'>
              {showMyAvatars ? 'No avatars found.' : 'No published avatars found.'}
            </p>
          ) : (
            filteredAndSortedAvatars.map((avatar) => (
              <div className='transition-all duration-500 ease-out' key={avatar.id}>
                <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                  <Link to={`/avatars/${avatar.id}`} className='block h-[200px] sm:h-[152px] md:h-[200px] rounded-xl bg-black relative'>
                    <img
                      src={getPicture(avatar, 'avatars', false)}
                      srcSet={getPicture(avatar, 'avatars', true)}
                      alt={`${avatar.name} picture`}
                      className='object-cover size-full'
                    />
                    {!showMyAvatars && me.id === avatar.userId && (
                      <div className='absolute top-2 left-2 z-10'>
                        <div className='flex items-center gap-1 bg-gradient-1 py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                          🌐
                          <span>By you</span>
                        </div>
                      </div>
                    )}
                    {avatar.gender === 'Female' ? (
                      <div className='absolute bottom-2 left-2 z-10'>
                        <div className='flex items-center gap-1 bg-[#FF85B7] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                          👩🏻
                          <span>Female</span>
                        </div>
                      </div>
                    ) : avatar.gender === 'Male' ? (
                      <div className='absolute bottom-2 left-2 z-10'>
                        <div className='flex items-center gap-1 bg-[#85D2FF] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                          🧔🏻‍♂️
                          <span>Male</span>
                        </div>
                      </div>
                    ) : null}
                  </Link>
                  <div className='py-[18px] px-5 flex lg:items-center gap-5 justify-between flex-1 lg:flex-row flex-col'>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <h4 className='text-heading-h4 text-base-black'>{avatar.name}</h4>
                        <RecommendedBadge recommended={avatar.recommended} tooltipText='Recommended' className='pt-1' />
                      </div>
                      <p className='text-body-md text-neutral-01 line-clamp-1'>{avatar.shortDesc}</p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <PlayerButton variant='secondary' audioSrc={PATHS.avatarAudio(avatar.id)} />

                      <AvatarScenarioModal avatar={avatar}>
                        <Button.Root size='sm' className='px-5'>
                          {(avatar.chats?.length || 0) > 0 ? 'Continue Chat' : 'Chat'}
                        </Button.Root>
                      </AvatarScenarioModal>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {infiniteScroll.error && (
          <div className='text-center text-red-500 py-4'>
            <p>Failed to load avatars: {infiniteScroll.error}</p>
          </div>
        )}

        {infiniteScroll.loading && (
          <div className='text-center py-4'>
            <div className='inline-flex items-center gap-2'>
              <Icons.loading className='size-4 animate-spin' />
              <span className='text-neutral-01'>Loading more avatars...</span>
            </div>
          </div>
        )}

        {infiniteScroll.hasMore && !infiniteScroll.loading && <div ref={infiniteScroll.triggerRef} className='h-4' />}

        <Outlet />
      </div>
    </div>
  );
}
