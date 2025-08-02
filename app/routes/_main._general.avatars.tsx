import { Link, NavLink, Outlet, useRouteLoaderData, useSearchParams } from 'react-router';
import type { User } from '~/types';
import type { Route } from './+types/_main._general.avatars';
import SearchAvatars from '~/components/ui/search-avatars';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { getPicture } from '~/utils/getPicture';
import PlayerButton from '~/components/PlayerButton';
import { PATHS } from '~/constants';
import * as Popover from '~/components/ui/popover';
import AvatarScenarioModal from '~/components/AvatarScenarioModal';
import RecommendedBadge from '~/components/ui/RecommendedBadge';
import { useInfiniteAvatars } from '~/hooks/queries/avatarQueries';

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

export default function AvatarsShow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const me = useRouteLoaderData('routes/_main') as User;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const rawParams = Object.fromEntries(searchParams.entries());
  const defaultParams = Object.keys(rawParams).length > 0 ? rawParams : { published: 'true' }

  const {
    data: avatars,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAvatars(defaultParams);

  const filteredAndSortedAvatars = useMemo(() => {
    return avatars?.pages.flatMap((page) => page.data) || [];
  }, [avatars]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const showMyAvatars = searchParams.has('mine');
  const genderFilter = (searchParams.get('gender') as GenderFilter) || 'All';

  const hasActiveFilters = showMyAvatars || genderFilter !== 'All';

  const handleToggle = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('mine');
    newSearchParams.delete('published');

    if (showMyAvatars) {
      newSearchParams.set('published', 'true');
    } else {
      newSearchParams.set('mine', 'true');
    }

    setSearchParams(newSearchParams);
  };

  const handleFilterChange = (filter: GenderFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (filter === 'All') {
      newSearchParams.delete('gender');
    } else {
      newSearchParams.set('gender', filter);
    }

    setSearchParams(newSearchParams);
    setPopoverOpen(false);
  };

  const handleClearFilters = () => {
    setSearchParams({ published: 'true' });
  };

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

        {isLoading ? (
          <AvatarSkeleton />
        ) : (
          <>
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
                            <div className='flex items-center gap-1 bg-[#069cf3] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
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
                              Chat
                            </Button.Root>
                          </AvatarScenarioModal>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {isError && (
              <div className='text-center text-red-500 py-4'>
                <p>Failed to load avatars: {isError}</p>
              </div>
            )}

            {isFetchingNextPage && (
              <div className='text-center py-4'>
                <div className='inline-flex items-center gap-2'>
                  <Icons.loading className='size-4 animate-spin' />
                  <span className='text-neutral-01'>Loading more avatars...</span>
                </div>
              </div>
            )}

            {hasNextPage && !isFetchingNextPage && <div ref={triggerRef} className='h-4' />}
          </>
        )}

        <Outlet />
      </div>
    </div>
  );
}
