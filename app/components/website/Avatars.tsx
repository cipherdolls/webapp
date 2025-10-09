import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  ChevronLeft,
  ChevronRight,
  User,
  Heart,
  Zap,
  Flame,
  DollarSign,
  Skull,
  Pause,
  AudioLines,
  PlaySquare,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import { PATHS, PICTURE_SIZE, ROUTES } from '~/constants';
import AvatarPicture from '../AvatarPicture';
import { cn } from '~/utils/cn';
import type { Avatar, Scenario } from '~/types';
import Subtitle from './components/Subtitle';
import * as Button from '~/components/ui/button/button';
import { useAudioPlayer } from 'react-use-audio-player';
import { useWalletAuth } from '~/hooks/useWalletAuth';

const content = {
  title: 'Step Into Their World',
  subtitle: 'Meet Your Avatars',
  description:
    'Each AI avatar has been carefully crafted with deep, complex personalities that go far beyond simple chatbots. Our characters have unique psychological profiles, personal histories, and distinct communication styles.',

  mainContent: {
    title: (
      <>
        Rich <span className='font-medium'>Personalities</span>
      </>
    ),
    description: (
      <>
        <p>
          Each AI avatar has been carefully crafted with deep, complex personalities that go far beyond simple chatbots. Our characters have
          unique psychological profiles, personal histories, and distinct communication styles.
        </p>
        <p>
          From <strong className='text-gray-900'>MBTI personality types</strong> to individual quirks and preferences, every avatar responds
          authentically to different conversation scenarios. Whether you're exploring apocalyptic survival strategies, diving into
          cryptocurrency discussions, or engaging in intimate fantasies.
        </p>
        <p>
          <strong className='text-gray-900'>Voice & Character:</strong> Each avatar has their own speaking style, emotional responses, and
          behavioral patterns. They remember context, adapt to your preferences, and create genuinely engaging conversations that feel
          natural and immersive.
        </p>
      </>
    ),
    features: [
      {
        color: 'bg-purple-100 text-purple-600',
        icon: User,
        title: 'Unique voice patterns and speaking styles',
      },
      {
        color: 'bg-blue-100 text-blue-600',
        icon: Zap,
        title: 'MBTI-based psychological profiles',
      },
      {
        color: 'bg-green-100 text-green-600',
        icon: Heart,
        title: 'Diverse conversation scenarios and expertise',
      },
    ],
  },
};

// Deterministic color assignment for scenario chips based on scenario name
const scenarioChipColors: string[] = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
];

function hashStringToNumber(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Get color class ensuring no repetition within a single group render
function getScenarioColorClassUnique(name: string, usedIndexes: Set<number>): string {
  let index = hashStringToNumber(name) % scenarioChipColors.length;
  let attempts = 0;
  while (usedIndexes.has(index) && attempts < scenarioChipColors.length) {
    index = (index + 1) % scenarioChipColors.length;
    attempts++;
  }
  usedIndexes.add(index);
  return scenarioChipColors[index];
}

const Avatars = ({ avatars }: { avatars: any }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { signIn, isLoading: isAuthLoading, hasEthereum } = useWalletAuth();

  const { isPlaying, load, stop, getPosition, duration } = useAudioPlayer();
  const progressDivRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    handleStopVoice();
    setCurrentSlide((prev) => (prev + 1) % avatars.length);
  };

  const prevSlide = () => {
    handleStopVoice();
    setCurrentSlide((prev) => (prev - 1 + avatars.length) % avatars.length);
  };

  const handlePlayVoice = async (avatar: Avatar) => {
    load(PATHS.avatarAudio(avatar.id), {
      autoplay: true,
      initialVolume: 1,
      format: 'mp3',
      onend: () => {
        setActiveId(null);
      },
      onstop: () => {
        setActiveId(null);
      },
    });
    setActiveId(avatar.id);
  };

  const handleStopVoice = () => {
    stop();
  };

  useEffect(() => {
    const tick = () => {
      if (duration && progressDivRef.current) {
        const pos = getPosition(); // seconds
        const pct = Math.max(0, Math.min(100, (pos / duration) * 100));
        const right = 100 - pct; // clip right side
        const clip = `inset(0 ${right}% 0 0)`;
        const el = progressDivRef.current;
        el.style.clipPath = clip;
        // Safari (optional)
        // @ts-expect-error webkit prefix
        el.style.webkitClipPath = clip;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      frameRef.current = requestAnimationFrame(tick);
    } else {
      // reset when paused/stopped (e.g., 0%)
      if (progressDivRef.current) {
        const clip = 'inset(0 100% 0 0)';
        progressDivRef.current.style.clipPath = clip;
        // @ts-expect-error
        progressDivRef.current.style.webkitClipPath = clip;
      }
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, getPosition, duration]);

  return (
    <section id='avatars' className='py-20 overflow-hidden'>
      <div className='container'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16'>
          <Subtitle pulseClassName='from-indigo-500 to-purple-500'>Avatars</Subtitle>
          <h2 className='text-4xl sm:text-5xl font-light text-gray-900 leading-tight'>
            {content.title}
            <br />
            <span className='font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
              {content.subtitle}
            </span>
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className='grid lg:grid-cols-2 gap-16 items-center mb-20'>
          {/* Left Column - Rich Personalities Text */}
          <div className='space-y-8'>
            <div className='space-y-6'>
              <h3 className='text-2xl font-light text-gray-900'>{content.mainContent.title}</h3>
              <div className='space-y-4 text-gray-600 leading-relaxed'>{content.mainContent.description}</div>
            </div>

            {/* Features List */}
            <div className='space-y-4'>
              {content.mainContent.features.map((feature, index) => (
                <div className='flex items-center space-x-3' key={index}>
                  <div className={cn(feature.color, 'w-8 h-8 rounded-lg flex items-center justify-center')}>
                    <feature.icon className='w-4 h-4' />
                  </div>
                  <span className='text-gray-700 font-medium'>{feature.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Animated Avatar Slider */}
          <div className='relative'>
            {/* Playing Cards Stack Container */}
            <div className='relative h-[600px] w-full max-w-md mx-auto'>
              {/* Background Cards Stack */}
              {avatars.slice(0, 4).map((avatar: any, index: number) => {
                const isActive = index === currentSlide;
                const isPrevious = index === (currentSlide - 1 + avatars.length) % avatars.length;
                const isNext = index === (currentSlide + 1) % avatars.length;
                const isVisible = isActive || isPrevious || isNext;

                let cardStyle = '';
                let zIndex = 0;

                if (isActive) {
                  cardStyle = 'translate-x-0 translate-y-0 rotate-0 scale-100';
                  zIndex = 30;
                } else if (isPrevious) {
                  cardStyle = '-translate-x-8 translate-y-4 -rotate-12 scale-95';
                  zIndex = 20;
                } else if (isNext) {
                  cardStyle = 'translate-x-8 translate-y-4 rotate-12 scale-95';
                  zIndex = 20;
                } else {
                  cardStyle = 'translate-x-0 translate-y-8 rotate-0 scale-90';
                  zIndex = 10;
                }

                const scenarios = Array.isArray(avatar.scenarios) ? avatar.scenarios : [];
                const maxVisibleScenarioChips = 5;
                const visibleScenarios = scenarios.slice(0, maxVisibleScenarioChips);
                const remainingScenarioCount = Math.max(scenarios.length - maxVisibleScenarioChips, 0);
                const usedScenarioColorIndexes = new Set<number>();

                return (
                  <div
                    key={avatar.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out transform ${cardStyle} ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ zIndex }}
                  >
                    <div className='bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-xl h-full text-center flex flex-col'>
                      {/* Card Content - Only show for active card */}
                      {isActive && (
                        <>
                          {/* Avatar Image */}
                          <div className={`relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-white/50`}>
                            <div
                              className={cn(
                                'absolute inset-0 flex transition-opacity duration-300',
                                isPlaying && activeId === avatar.id ? 'opacity-100' : 'opacity-0'
                              )}
                            >
                              <div
                                className={cn(
                                  'flex-1 flex items-center justify-center bg-gradient-to-r from-indigo-600/50 to-purple-600/50 animate-pulse'
                                )}
                              >
                                <AudioLines className={cn('size-12 text-white')} />
                              </div>
                            </div>
                            <AvatarPicture avatar={avatar} className='size-full object-cover' sizeType={PICTURE_SIZE.avatar} />
                          </div>

                          {/* Avatar Info */}
                          <div className='flex flex-col gap-4 flex-1'>
                            <div className='space-y-3'>
                              <h4 className='text-2xl font-bold text-gray-900'>{avatar.name}</h4>
                              <p className='text-gray-600 font-medium'>{avatar.archetype}</p>
                            </div>

                            {/* Description */}
                            <p className='text-gray-600 leading-relaxed'>{avatar.shortDesc}</p>

                            {/* Scenarios */}
                            <div className='space-y-3'>
                              <div className='text-sm text-gray-500 font-medium'>Specializes In</div>
                              <div className='flex flex-wrap gap-2 justify-center'>
                                {visibleScenarios.map((scenario: Scenario, scenarioIndex: number) => {
                                  return (
                                    <div
                                      key={scenarioIndex}
                                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getScenarioColorClassUnique(
                                        scenario.name,
                                        usedScenarioColorIndexes
                                      )}`}
                                    >
                                      <span>{scenario.name}</span>
                                    </div>
                                  );
                                })}
                                {remainingScenarioCount > 0 && (
                                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium `}>
                                    <p className='text-underline'>
                                      and <span className='font-bold'>{remainingScenarioCount}</span> more..
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Enhanced Voice Player */}

                            <div className='pt-3 mt-auto flex flex-col gap-2'>
                              <Button.Root
                                onClick={() => (activeId === avatar.id ? handleStopVoice() : handlePlayVoice(avatar))}
                                className='relative overflow-hidden px-4 w-full gap-2'
                                variant={activeId === avatar.id ? 'secondary' : 'ghost'}
                              >
                                {/* Base (black) content – centered across full width */}
                                <div className='relative z-10 flex items-center justify-center gap-3 text-black whitespace-nowrap'>
                                  Listen to {avatar.name}
                                  <Button.Icon as={activeId === avatar.id ? PauseCircle : PlayCircle} className='size-6' />
                                </div>

                                {/* White overlay copy – same centering, but clipped to left half */}
                                <div
                                  ref={progressDivRef}
                                  aria-hidden='true'
                                  className='pointer-events-none absolute inset-0 w-full z-20 flex items-center justify-center gap-2 text-white bg-gradient-to-r from-cyan-500/60 via-indigo-600/60 to-purple-600/60'
                                  style={{ clipPath: 'inset(0 50% 0 0)' }} // show only left 50%
                                >
                                  <div className='flex items-center justify-center gap-3 text-white whitespace-nowrap'>
                                    Listen to {avatar.name}
                                    <Button.Icon as={activeId === avatar.id ? PauseCircle : PlayCircle} className='size-6' />
                                  </div>
                                </div>
                              </Button.Root>
                              <Button.Root
                                className='px-10 gradient-move font-medium w-full'
                                variant='secondary'
                                size='md'
                                onClick={signIn}
                                disabled={isAuthLoading}
                              >
                                {isAuthLoading ? 'Connecting...' : 'Start Chat for Free'}
                              </Button.Root>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Navigation Arrows - Outside the cards */}
              <button
                onClick={prevSlide}
                className='absolute left-0 top-1/2 -translate-y-1/2 md:-translate-x-16 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg z-50'
              >
                <ChevronLeft className='w-5 h-5 text-gray-600' />
              </button>
              <button
                onClick={nextSlide}
                className='absolute right-0 top-1/2 -translate-y-1/2 md:translate-x-16 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg z-50'
              >
                <ChevronRight className='w-5 h-5 text-gray-600' />
              </button>

              {/* Slide Indicators */}
              <div className='absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2 z-40'>
                {avatars.map((_avatar: unknown, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                      index === currentSlide ? 'bg-black w-8' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Avatars;
