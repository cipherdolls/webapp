import React, { useState, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, User, Heart, Zap, Flame, DollarSign, Skull } from 'lucide-react';
// import { Link } from 'react-router';
// import freyaImage from '../assets/picture.webp';
// import marcusImage from '../assets/picture (1).webp';
// import lunaImage from '../assets/picture (2).webp';
// import danteImage from '../assets/picture (3).webp';

const Avatars = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  const avatars = [
    {
      id: 1,
      name: 'Freya',
      image: null,
      archetype: 'The Seductress',
      description: 'Intelligent, fiery, and mysterious. Commands attention with rebellious spirit and sophisticated allure.',
      scenarios: ['Sexual Fantasies', 'Luxury Lifestyle', 'Power Dynamics'],
    },
    {
      id: 2,
      name: 'Marcus',
      image: null,
      archetype: 'The Survivor',
      description: 'Battle-hardened strategist with unshakeable resolve. Thrives in chaos and high-stakes situations.',
      scenarios: ['Apocalyptic Dilemma', 'Survival Stories', 'Military Tactics'],
    },
    {
      id: 3,
      name: 'Luna',
      image: null,
      archetype: 'The Crypto Queen',
      description: 'Brilliant crypto trader with razor-sharp wit. Lives for market volatility and digital innovation.',
      scenarios: ['Crypto Talk', 'Tech Innovation', 'Financial Strategy'],
    },
    {
      id: 4,
      name: 'Dante',
      image: null,
      archetype: 'The Dark Romantic',
      description: 'Enigmatic artist with a dark edge. Explores the depths of human desire and forbidden fantasies.',
      scenarios: ['Sexual Fantasies', 'Dark Romance', 'Artistic Expression'],
    },
  ];


  const scenarioIcons = {
    'Sexual Fantasies': Flame,
    'Crypto Talk': DollarSign,
    'Apocalyptic Dilemma': Skull,
    'Luxury Lifestyle': Heart,
    'Power Dynamics': Zap,
    'Survival Stories': User,
    'Military Tactics': User,
    'Tech Innovation': Zap,
    'Financial Strategy': DollarSign,
    'Dark Romance': Heart,
    'Artistic Expression': Heart,
  };

  const getScenarioColor = (scenario: string) => {
    const colors = {
      'Sexual Fantasies': 'bg-red-100 text-red-600',
      'Crypto Talk': 'bg-green-100 text-green-600',
      'Apocalyptic Dilemma': 'bg-gray-100 text-gray-600',
      'Luxury Lifestyle': 'bg-purple-100 text-purple-600',
      'Power Dynamics': 'bg-orange-100 text-orange-600',
      'Survival Stories': 'bg-blue-100 text-blue-600',
      'Military Tactics': 'bg-indigo-100 text-indigo-600',
      'Tech Innovation': 'bg-cyan-100 text-cyan-600',
      'Financial Strategy': 'bg-emerald-100 text-emerald-600',
      'Dark Romance': 'bg-pink-100 text-pink-600',
      'Artistic Expression': 'bg-violet-100 text-violet-600',
    };
    return colors[scenario as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  // Auto-advance slider
  useEffect(() => {
    if (!autoplayEnabled) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % avatars.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [avatars.length, autoplayEnabled]);

  const nextSlide = () => {
    console.log('nextSlide');
    setCurrentSlide((prev) => (prev + 1) % avatars.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + avatars.length) % avatars.length);
  };

  const currentAvatar = avatars[currentSlide];

  const handlePlayVoice = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setAutoplayEnabled(false); // Disable autoplay when voice starts
      setTimeout(() => setIsPlaying(false), 3000);
      setTimeout(() => setAutoplayEnabled(true), 3000); // Re-enable autoplay after voice ends
    } else {
      setIsPlaying(false);
      setAutoplayEnabled(true); // Re-enable autoplay if stopped manually
    }
  };

  return (
    <section id='avatars' className='py-20'>
      <div className='container'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16'>
          <div className='inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200/50 mb-4'>
            <div className='w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse'></div>
            <span>Characters</span>
          </div>
          <h2 className='text-4xl sm:text-5xl font-light text-gray-900 leading-tight'>
            Step Into Their World
            <br />
            <span className='font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
              Meet Your Avatars
            </span>
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className='grid lg:grid-cols-2 gap-16 items-center mb-20'>
          {/* Left Column - Rich Personalities Text */}
          <div className='space-y-8'>
            <div className='space-y-6'>
              <h3 className='text-2xl font-light text-gray-900'>
                Rich <span className='font-medium'>Personalities</span>
              </h3>
              <div className='space-y-4 text-gray-600 leading-relaxed'>
                <p>
                  Each AI avatar has been carefully crafted with deep, complex personalities that go far beyond simple chatbots. Our
                  characters have unique psychological profiles, personal histories, and distinct communication styles.
                </p>
                <p>
                  From <strong className='text-gray-900'>MBTI personality types</strong> to individual quirks and preferences, every avatar
                  responds authentically to different conversation scenarios. Whether you're exploring apocalyptic survival strategies,
                  diving into cryptocurrency discussions, or engaging in intimate fantasies.
                </p>
                <p>
                  <strong className='text-gray-900'>Voice & Character:</strong> Each avatar has their own speaking style, emotional
                  responses, and behavioral patterns. They remember context, adapt to your preferences, and create genuinely engaging
                  conversations that feel natural and immersive.
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center'>
                  <User className='w-4 h-4' />
                </div>
                <span className='text-gray-700 font-medium'>Unique voice patterns and speaking styles</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center'>
                  <Zap className='w-4 h-4' />
                </div>
                <span className='text-gray-700 font-medium'>MBTI-based psychological profiles</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center'>
                  <Heart className='w-4 h-4' />
                </div>
                <span className='text-gray-700 font-medium'>Diverse conversation scenarios and expertise</span>
              </div>
            </div>
          </div>

          {/* Right Column - Animated Avatar Slider */}
          <div className='relative'>
            {/* Playing Cards Stack Container */}
            <div className='relative h-[600px] w-full max-w-md mx-auto'>
              {/* Background Cards Stack */}
              {avatars.map((avatar, index) => {
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

                return (
                  <div
                    key={avatar.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out transform ${cardStyle} ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ zIndex }}
                  >
                    <div className='bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-xl h-full'>
                      {/* Card Content - Only show for active card */}
                      {isActive && (
                        <>
                          {/* Avatar Display */}
                          <div className='text-center space-y-6'>
                            {/* Avatar Image */}
                            <div className='relative'>
                              <div
                                className={`w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-white/50 transition-transform duration-300 ${isPlaying ? 'animate-custom-pulse' : ''}`}
                              >
                                <img
                                  src={avatar.image}
                                  alt={avatar.name}
                                  className='w-full h-full object-cover'
                                  key={`avatar-${avatar.id}`}
                                />
                              </div>
                            </div>

                            {/* Avatar Info */}
                            <div className='space-y-4'>
                              <div>
                                <h4 className='text-2xl font-bold text-gray-900'>{avatar.name}</h4>
                                <p className='text-gray-600 font-medium'>{avatar.archetype}</p>
                              </div>

                              {/* Description */}
                              <p className='text-gray-600 leading-relaxed'>{avatar.description}</p>

                              {/* Scenarios */}
                              <div className='space-y-3'>
                                <div className='text-sm text-gray-500 font-medium'>Specializes In</div>
                                <div className='flex flex-wrap gap-2 justify-center'>
                                  {avatar.scenarios.map((scenario, scenarioIndex) => {
                                    const IconComponent = scenarioIcons[scenario as keyof typeof scenarioIcons];
                                    return (
                                      <div
                                        key={scenarioIndex}
                                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getScenarioColor(scenario)}`}
                                      >
                                        {IconComponent && <IconComponent className='w-3 h-3' />}
                                        <span>{scenario}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Enhanced Voice Player */}
                              <div className='bg-white/40 rounded-xl p-2'>
                                <div className='space-y-3'>
                                  <div className='text-center'>
                                    <div className='text-gray-900 font-medium'>Listen to {avatar.name}</div>
                                  </div>
                                  <div className='flex items-center justify-center space-x-4'>
                                    <button
                                      onClick={handlePlayVoice}
                                      className='relative w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-300 group'
                                    >
                                      <Play
                                        className={`w-5 h-5 ml-1 transition-all duration-300 ${isPlaying ? 'scale-75 opacity-50' : ''}`}
                                      />
                                      {isPlaying && (
                                        <div className='absolute inset-0 rounded-full border-2 border-black animate-ping'></div>
                                      )}
                                    </button>

                                    {/* Audio Wave Progress */}
                                    <div className='flex items-center space-x-1'>
                                      {[...Array(12)].map((_, i) => (
                                        <div
                                          key={i}
                                          className={`w-1 bg-gray-300 rounded-full transition-all duration-300 ${
                                            isPlaying ? `h-${Math.floor(Math.random() * 6) + 2} bg-black animate-pulse` : 'h-2'
                                          }`}
                                          style={{
                                            animationDelay: `${i * 100}ms`,
                                            height: isPlaying ? `${Math.floor(Math.random() * 20) + 8}px` : '8px',
                                          }}
                                        ></div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {/* Start Chat Button */}
                                <div className='pt-3'>
                                  <button className='w-full gradient-move text-white px-6 py-3 rounded-full transition-all duration-300 ease-in-out font-medium hover:shadow-lg hover:scale-105'>
                                    Start Chat for Free
                                  </button>
                                </div>
                              </div>
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
                className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg z-50'
              >
                <ChevronLeft className='w-5 h-5 text-gray-600' />
              </button>
              <button
                onClick={nextSlide}
                className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg z-50'
              >
                <ChevronRight className='w-5 h-5 text-gray-600' />
              </button>

              {/* Slide Indicators */}
              <div className='absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2 z-40'>
                {avatars.map((_, index) => (
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
