import { Link, NavLink, Outlet, useRouteLoaderData, useSearchParams } from 'react-router';
import type { GenderFilter, User } from '~/types';
import type { Route } from './+types/_main._general.scenarios';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { getPicture } from '~/utils/getPicture';
import * as Popover from '~/components/ui/popover';
import * as Switch from '~/components/ui/switch';
import * as RadioGroup from '~/components/ui/radio-group';
import RecommendedBadge from '~/components/ui/RecommendedBadge';
import Tooltip from '~/components/ui/tooltip';
import ScenarioAvatarModal from '~/components/ScenarioAvatarModal';
import { useInfiniteScenarios } from '~/hooks/queries/scenarioQueries';
import SearchInput from '~/components/ui/search-input';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ROUTES } from '~/constants';
import { cn } from '~/utils/cn';

function ScenarioSkeleton({ count = 2 }: { count?: number }) {
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
    { title: 'Scenarios - Custom Roleplay & Conversation Settings | CipherDolls' },
    {
      name: 'description',
      content:
        'Create custom AI conversation scenarios and roleplay contexts. Choose from public scenarios or build your own unique interaction settings. Configure AI models, voice settings, and personality parameters for each scenario.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Scenarios - Custom Roleplay Settings | CipherDolls' },
    {
      property: 'og:description',
      content:
        'Explore and create custom AI scenarios with unique conversation contexts, roleplay settings, and AI model configurations. Anonymous and private.',
    },
    { property: 'og:url', content: 'https://cipherdolls.com/scenarios' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Scenarios | CipherDolls' },
    {
      name: 'keywords',
      content: 'AI scenarios, AI roleplay, custom AI contexts, AI conversation settings, AI story scenarios, character AI scenarios',
    },
  ];
}

export default function ScenariosIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const me = useRouteLoaderData('routes/_main') as User;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollContainerRef = React.useRef<HTMLElement | null>(null);

  const rawParams = Object.fromEntries(searchParams.entries());

  const showMyScenarios = searchParams.has('mine');
  const searchQuery = searchParams.get('name') || '';
  const userGenderFilter = (searchParams.get('userGender') as GenderFilter) || 'All';
  const avatarGenderFilter = (searchParams.get('avatarGender') as GenderFilter) || 'All';
  const showNsfw = searchParams.has('nsfw');

  const {
    data: scenarios,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteScenarios({
    ...rawParams,
    ...(rawParams.mine === 'true' ? {} : { published: 'true' }),
    nsfw: showNsfw ? 'true' : 'false',
  });

  const filteredAndSortedScenarios = useMemo(() => {
    return scenarios?.pages.flatMap((page) => page.data) || [];
  }, [scenarios]);

  const [infiniteRef] = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasNextPage: hasNextPage,
    onLoadMore: fetchNextPage,
    disabled: !!isError,
  });

  // Check if there are any active filters (excluding the default published=true and mine toggle)
  const hasActiveFilters = searchQuery.length > 0 || userGenderFilter !== 'All' || avatarGenderFilter !== 'All' || showNsfw;

  const handleToggle = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('mine');
    newSearchParams.delete('published');

    if (showMyScenarios) {
      newSearchParams.set('published', 'true');
    } else {
      newSearchParams.set('mine', 'true');
    }

    setSearchParams(newSearchParams);
  };

  const handleClearFilters = () => {
    setSearchParams({ published: 'true' });
  };

  const handleUserGenderFilterChange = (filter: GenderFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (filter === 'All') {
      newSearchParams.delete('userGender');
    } else {
      newSearchParams.set('userGender', filter);
    }
    setSearchParams(newSearchParams);
    setPopoverOpen(false);
  };

  const handleAvatarGenderFilterChange = (filter: GenderFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (filter === 'All') {
      newSearchParams.delete('avatarGender');
    } else {
      newSearchParams.set('avatarGender', filter);
    }
    setSearchParams(newSearchParams);
    setPopoverOpen(false);
  };

  const handleNsfwToggle = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (showNsfw) {
      newSearchParams.delete('nsfw');
    } else {
      newSearchParams.set('nsfw', 'true');
    }
    setSearchParams(newSearchParams);
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
        <h2 className='text-2xl font-semibold '>Scenarios</h2>

        <NavLink to={`${ROUTES.scenarios}/new`}>
          <Button.Root className='px-3.5 sm:px-5 sm:h-12 h-10'>
            <Button.Icon as={Icons.add} />
            Add New Scenario
          </Button.Root>
        </NavLink>
      </div>

      <div className='flex flex-col gap-5'>
        <SearchInput key={hasActiveFilters ? 'with-filters' : 'no-filters'} searchParamName='name' placeholder='Search scenarios by name' />
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

            <div className='flex items-center gap-2 px-3 py-2 bg-neutral-06 rounded-lg select-none'>
              <Switch.Root checked={showNsfw} onCheckedChange={() => handleNsfwToggle()}>
                <Switch.Thumb />
              </Switch.Root>
              <label className='text-sm text-neutral-01 cursor-pointer' onClick={handleNsfwToggle}>
                Show NSFW
              </label>
            </div>

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
                  {/* User Gender Filter */}
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium text-base-black'>User Gender</h4>
                    <RadioGroup.Root value={userGenderFilter} onValueChange={handleUserGenderFilterChange}>
                      {(['All', 'Male', 'Female', 'Diverse'] as const).map((filter) => (
                        <div key={filter} className='flex items-center space-x-2'>
                          <RadioGroup.Item value={filter} id={`user-${filter}`}>
                            <RadioGroup.Indicator />
                          </RadioGroup.Item>
                          <label htmlFor={`user-${filter}`} className='-ml-2 pl-2 text-sm text-neutral-01 cursor-pointer transition-colors duration-200 ease-out hover:text-base-black'>
                            {filter}
                          </label>
                        </div>
                      ))}
                    </RadioGroup.Root>
                  </div>

                  {/* Avatar Gender Filter */}
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium text-base-black'>Avatar Gender</h4>
                    <RadioGroup.Root value={avatarGenderFilter} onValueChange={handleAvatarGenderFilterChange}>
                      {(['All', 'Male', 'Female', 'Diverse'] as const).map((filter) => (
                        <div key={filter} className='flex items-center space-x-2'>
                          <RadioGroup.Item value={filter} id={`avatar-${filter}`}>
                            <RadioGroup.Indicator />
                          </RadioGroup.Item>
                          <label htmlFor={`avatar-${filter}`} className='-ml-2 pl-2 text-sm text-neutral-01 cursor-pointer transition-colors duration-200 ease-in hover:text-base-black'>
                            {filter}
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
          <ScenarioSkeleton />
        ) : (
          <>
            <div className='grid sm:grid-cols-2 grid-cols-1 gap-3.5 md:gap-5 pb-10'>
              {filteredAndSortedScenarios.length === 0 ? (
                <p className='text-body-md text-neutral-01 text-center md:col-span-2 col-span-1'>
                  {showMyScenarios ? 'No scenarios found.' : 'No published scenarios found.'}
                </p>
              ) : (
                filteredAndSortedScenarios.map((scenario) => (
                  <div className='transition-all duration-500 ease-out' key={scenario.id}>
                    <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
                      <Link
                        to={`${ROUTES.scenarios}/${scenario.id}`}
                        className='block h-[200px] sm:h-[152px] md:h-[200px] rounded-xl bg-black relative'
                      >
                        <img
                          src={getPicture(scenario, 'scenarios', false)}
                          srcSet={getPicture(scenario, 'scenarios', true)}
                          alt={`${scenario.name} picture`}
                          className='object-cover size-full'
                        />
                        <div className='absolute top-2 left-2 z-10'>
                          <div className='flex items-center gap-2'>
                            {!showMyScenarios && me.id === scenario.userId && (
                              <div className='flex items-center gap-1 bg-gradient-1 py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                                🌐
                                <span>By you</span>
                              </div>
                            )}
                            {scenario.sponsorships && scenario.sponsorships.length > 0 && (
                              <Tooltip
                                side='top'
                                variant='light'
                                trigger={
                                  <div className='flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 py-1 pl-1 pr-1.5 rounded-full text-label text-white font-semibold shadow-lg cursor-help'>
                                    🎁
                                    <span>Free to use</span>
                                  </div>
                                }
                                content={`This scenario has ${scenario.sponsorships.length} ${scenario.sponsorships.length === 1 ? 'sponsor' : 'sponsors'}. You can use it without spending your own tokens!`}
                                className='max-w-[350px]'
                                popoverClassName='max-w-[320px]'
                              />
                            )}
                          </div>
                        </div>
                        {(scenario.userGender || scenario.avatarGender) && (
                          <div className='absolute bottom-2 left-2 z-10'>
                            <div className='flex items-center gap-1'>
                              <div className={cn('flex rounded-full overflow-hidden text-label text-base-black font-semibold', scenario.userGender === scenario.avatarGender && 'gap-px')}>
                                <Tooltip
                                  side='top'
                                  variant='light'
                                  trigger={
                                    <div className={cn('flex py-1 px-2 gap-0.5',
                                      scenario.userGender === 'Male' && 'bg-[#069cf3]' ,
                                      scenario.userGender === 'Female' && 'bg-[#FF85B7]',
                                      scenario.userGender === 'Diverse' && 'bg-gradient-1'
                                    )}
                                    >
                                      { scenario.userGender === 'Male' && '🧔🏻‍♂️' ||
                                        scenario.userGender === 'Female' && '👩🏻' ||
                                        scenario.userGender === 'Diverse' && '👤'
                                      }
                                    </div>
                                  }
                                  content='User gender for this scenario'
                                  className='max-w-[350px]'
                                  popoverClassName='max-w-[320px]'
                                />

                                <Tooltip
                                  side='top'
                                  variant='light'
                                  trigger={
                                    <div className={cn('flex py-1 px-2 gap-0.5',
                                      scenario.avatarGender === 'Male' && 'bg-[#069cf3]',
                                      scenario.avatarGender === 'Female' && 'bg-[#FF85B7]',
                                      scenario.avatarGender === 'Diverse' && 'bg-gradient-1'
                                    )}
                                    >
                                      { scenario.avatarGender === 'Male' && '🧔🏻‍♂️' ||
                                        scenario.avatarGender === 'Female' && '👩🏻' ||
                                        scenario.avatarGender === 'Diverse' && '🤖'
                                      }
                                    </div>
                                  }
                                  content='Avatar gender for this scenario'
                                  className='max-w-[350px]'
                                  popoverClassName='max-w-[320px]'
                                />
                              </div>
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
                                side='top'
                                variant='error'
                                trigger={<Icons.warning className='size-4 text-specials-danger' />}
                                content={scenario.chatModel.error}
                                className='max-w-[350px]'
                                popoverClassName='max-w-[320px]'
                              />
                            )}

                            {scenario.embeddingModel.error && (
                              <Tooltip
                                side='top'
                                variant='error'
                                trigger={<Icons.warning className='size-4 text-specials-danger' />}
                                content={scenario.embeddingModel.error}
                                className='max-w-[350px]'
                                popoverClassName='max-w-[320px]'
                              />
                            )}

                            {scenario.reasoningModel?.error && (
                              <Tooltip
                                side='top'
                                variant='error'
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
                            <Button.Root
                              size='sm'
                              className='px-5'
                              disabled={
                                (!me.tokenSpendable || me.tokenSpendable === 0) &&
                                (!scenario.sponsorships || scenario.sponsorships.length === 0)
                              }
                            >
                              Chat
                            </Button.Root>
                          </ScenarioAvatarModal>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {isError && (
              <div className='text-center text-red-500 py-4'>
                <p>Failed to load scenarios: {isError}</p>
              </div>
            )}

            {isFetchingNextPage && (
              <div className='text-center py-4'>
                <div className='inline-flex items-center gap-2'>
                  <Icons.loading className='size-4 animate-spin' />
                  <span className='text-neutral-01'>Loading more scenarios...</span>
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
