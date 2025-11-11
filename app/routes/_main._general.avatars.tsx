import { Link, NavLink, Outlet, useRouteLoaderData, useSearchParams } from 'react-router';
import type { User } from '~/types';
import type { Route } from './+types/_main._general.avatars';
import React, { useMemo, useState, useEffect } from 'react';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { getPicture } from '~/utils/getPicture';
import PlayerButton from '~/components/PlayerButton';
import { PATHS, ROUTES } from '~/constants';
import * as Popover from '~/components/ui/popover';
import * as RadioGroup from '~/components/ui/radio-group';
import AvatarScenarioModal from '~/components/AvatarScenarioModal';
import RecommendedBadge from '~/components/ui/RecommendedBadge';
import { useInfiniteAvatars } from '~/hooks/queries/avatarQueries';
import SearchInput from '~/components/ui/search-input';
import useInfiniteScroll from 'react-infinite-scroll-hook';

type GenderFilter = 'All' | 'Male' | 'Female';

function AvatarSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-5 pb-5 w-full'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='grid gap-3.5 grid-cols-1 sm:grid-cols-2  md:gap-5 '>
          <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[344px] sm:h-[296px] md:h-[344px] lg:h-[284px]' />
          <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[344px] sm:h-[296px] md:h-[344px] lg:h-[284px]' />
          <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[344px] sm:h-[296px] md:h-[344px] lg:h-[284px]' />
          <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[344px] sm:h-[296px] md:h-[344px] lg:h-[284px]' />
        </div>
      ))}
    </div>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Avatars - Unique Personalities & Voice Chat | CipherDolls' },
    {
      name: 'description',
      content:
        'Browse avatars with rich personalities and backstories. Unique voice patterns, emotional depth, and sophisticated conversation abilities. Create your own or choose from public avatars. No email required.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Avatars with Unique Personalities | CipherDolls' },
    {
      property: 'og:description',
      content:
        'Meticulously crafted avatars with unique personalities, voices, and conversation styles. Browse public avatars or create your own custom AI companions.',
    },
    { property: 'og:url', content: 'https://cipherdolls.com/avatars' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Avatars | CipherDolls' },
    {
      name: 'keywords',
      content: 'avatars, AI personalities, voice AI, custom AI characters, AI companions, roleplay AI, character AI',
    },
  ];
}

export default function AvatarsShow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const me = useRouteLoaderData('routes/_main') as User;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollContainerRef = React.useRef<HTMLElement | null>(null);

  const rawParams = Object.fromEntries(searchParams.entries());

  // Filter out undefined values from rawParams
  const cleanRawParams = Object.fromEntries(Object.entries(rawParams).filter(([_, value]) => value !== undefined && value !== null));

  const {
    data: avatars,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAvatars({
    ...cleanRawParams,
    ...(cleanRawParams.mine === 'true' ? {} : { published: 'true' }),
  });

  const filteredAndSortedAvatars = useMemo(() => {
    return avatars?.pages.flatMap((page) => page.data) || [];
  }, [avatars]);

  const [infiniteRef] = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasNextPage: hasNextPage,
    onLoadMore: fetchNextPage,
    disabled: !!isError,
  });

  const showMyAvatars = searchParams.has('mine');
  const genderFilter = (searchParams.get('gender') as GenderFilter) || 'All';
  const searchQuery = searchParams.get('name') || '';

  // Check if there are any active filters (excluding the default published=true and mine toggle)
  const hasActiveFilters = searchQuery.length > 0 || genderFilter !== 'All';

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

  useEffect(() => {
    // For cases when the user to redirect here from /account
    scrollToTop();

    const scrollContainer = document.querySelector('main.overflow-y-scroll') as HTMLElement;
    scrollContainerRef.current = scrollContainer;

    const handleScroll = () => {
      if (scrollContainer) {
        setShowBackToTop(scrollContainer.scrollTop > 300);
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between sm:mt-8 mb-4'>
        <h2 className='text-2xl font-semibold '>Avatars</h2>

        <NavLink to={`${ROUTES.avatars}/new`}>
          <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
            <Button.Icon as={Icons.add} />
            Add New Avatar
          </Button.Root>
        </NavLink>
      </div>

      <div className='flex flex-col gap-5'>
        <SearchInput key={hasActiveFilters ? 'with-filters' : 'no-filters'} searchParamName='name' placeholder='Search avatars by name' />
        <div className='flex flex-col gap-4 md:flex-row items-center justify-between'>
          <div className='flex flex-1 items-center gap-3'>
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
                  Filters
                  <Icons.chevronDown className='size-4' />
                </Button.Root>
              </Popover.Trigger>
              <Popover.Content className='w-64 p-0'>
                <div className='p-4 space-y-6'>
                  {/* Gender Filter */}
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium text-base-black'>Gender</h4>
                    <RadioGroup.Root value={genderFilter} onValueChange={handleFilterChange}>
                      {(['All', 'Male', 'Female'] as const).map((filter) => (
                        <div key={filter} className='flex items-center space-x-2'>
                          <RadioGroup.Item value={filter} id={`gender-${filter}`}>
                            <RadioGroup.Indicator />
                          </RadioGroup.Item>
                          <label htmlFor={`gender-${filter}`} className='-ml-2 pl-2 text-sm text-neutral-01 cursor-pointer'>
                            {filter === 'All' ? 'All genders' : filter}
                          </label>
                        </div>
                      ))}
                    </RadioGroup.Root>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
        </div>

        {isLoading ? (
          <AvatarSkeleton />
        ) : (
          <>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5 pb-10'>
              {filteredAndSortedAvatars.length === 0 && !isLoading ? (
                <p className='text-body-md text-neutral-01 text-center md:col-span-2 col-span-1'>
                  {showMyAvatars ? 'No avatars found.' : 'No published avatars found.'}
                </p>
              ) : (
                filteredAndSortedAvatars.map((avatar) => (
                  <div className='transition-all duration-500 ease-out' key={avatar.id}>
                    <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                      <Link
                        to={`${ROUTES.avatars}/${avatar.id}`}
                        className='block h-[200px] sm:h-[152px] md:h-[200px] rounded-xl bg-black relative'
                      >
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
                        <div className='flex flex-col gap-1 flex-1 min-w-0 overflow-hidden'>
                          <div className='flex items-center gap-2'>
                            <h4 className='truncate text-heading-h4 text-base-black'>{avatar.name}</h4>
                            <RecommendedBadge recommended={avatar.recommended} tooltipText='Recommended' className='pt-1' />
                          </div>
                          <p className='text-body-md text-neutral-01 truncate'>{avatar.shortDesc}</p>
                        </div>
                        <div className='flex items-center gap-3'>
                          {avatar.introductionAudio && <PlayerButton variant='secondary' audioSrc={PATHS.avatarAudio(avatar.id)} />}

                          <AvatarScenarioModal avatar={avatar}>
                            <Button.Root size='sm' className='px-5' disabled={!me.tokenSpendable || me.tokenSpendable === 0}>
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
              <div className='text-center -mt-5 pb-5'>
                <div className='inline-flex items-center gap-2'>
                  <Icons.loading className='size-4 animate-spin' />
                  <span className='text-neutral-01'>Loading more avatars...</span>
                </div>
              </div>
            )}

            {hasNextPage && !isFetchingNextPage && <div ref={infiniteRef} className='h-4' />}
          </>
        )}

        <Outlet />
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 p-3 bg-gradient-1 text-base-black rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label='Back to top'
      >
        <Icons.chevronDown className='size-6 rotate-180' />
      </button>
    </div>
  );
}
