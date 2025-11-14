import { Link, NavLink, Outlet, useRouteLoaderData, useSearchParams } from 'react-router';
import type { User } from '~/types';
import type { Route } from './+types/_main._general.avatars';
import React, { useMemo, useState, useEffect } from 'react';
import { Icons } from '~/components/ui/icons';
import * as Button from '~/components/ui/button/button';
import { ROUTES } from '~/constants';
import * as Popover from '~/components/ui/popover';
import * as RadioGroup from '~/components/ui/radio-group';
import { useInfiniteAvatars } from '~/hooks/queries/avatarQueries';
import SearchInput from '~/components/ui/search-input';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import AvatarListCard, { AvatarListCardSkeleton } from '~/components/AvatarListCard';
import { useUser } from '~/hooks/queries/userQueries';

type GenderFilter = 'All' | 'Male' | 'Female';

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
  const { data: me } = useUser()
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollContainerRef = React.useRef<HTMLElement | null>(null);

  const rawParams = Object.fromEntries(searchParams.entries());

  // Filter out undefined values from rawParams
  const cleanRawParams = Object.fromEntries(Object.entries(rawParams).filter(([_, value]) => value !== undefined && value !== null));

  const mineSetToTrue = cleanRawParams.mine === 'true';

  const {
    data: avatars,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAvatars({
    ...cleanRawParams,
    ...(mineSetToTrue
      ? { mine: 'true' } // explicitly set mine param if it's true to fetch user's avatars
      : { published: 'true' }),
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
        <SearchInput searchParamName='name' placeholder='Search avatars by name' />
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
          <AvatarListCardSkeleton />
        ) : (
          <>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5 pb-10'>
              {filteredAndSortedAvatars.length === 0 && !isLoading ? (
                <p className='text-body-md text-neutral-01 text-center md:col-span-2 col-span-1'>
                  {showMyAvatars ? 'No avatars found.' : 'No published avatars found.'}
                </p>
              ) : (
                filteredAndSortedAvatars.map((avatar) => {
                  const isUsersAvatar = me?.id === avatar.userId ? true : false;
                  return (
                    <AvatarListCard
                      key={avatar.id}
                      avatar={avatar}
                      isUsersAvatar={isUsersAvatar}
                    />
                  );
                })
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
