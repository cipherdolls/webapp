import React from 'react';
import { Play } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section id='how-it-works' className='py-20'>
      <div className='container'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16'>
          <div className='inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200/50 mb-4'>
            <div className='w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse'></div>
            <span>Our Craft</span>
          </div>
          <h2 className='text-4xl sm:text-5xl font-light text-gray-900 leading-tight'>
            Crafted with Care
            <br />
            <span className='font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent'>
              Every Avatar Tells a Story
            </span>
          </h2>
          <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
            Our avatars are meticulously crafted with rich personalities, unique backstories, and sophisticated conversation abilities. Each
            avatar brings their own expertise, emotional depth, and authentic responses that create truly engaging and memorable
            interactions.
          </p>
        </div>

        {/* Video Section */}
        <div className='mb-20'>
          <div className='relative max-w-4xl mx-auto'>
            <div className='relative bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl overflow-hidden shadow-sm'>
              {/* Video Placeholder */}
              <div className='aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
                <div className='text-center space-y-4'>
                  <div className='w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto group cursor-pointer hover:bg-gray-800 transition-all duration-300'>
                    <Play className='w-6 h-6 text-white ml-1' />
                  </div>
                  <div className='space-y-2'>
                    <h3 className='text-xl font-medium text-gray-900'>See Cipherdolls in Action</h3>
                    <p className='text-gray-600'>Learn how to chat anonymously with avatars</p>
                  </div>
                </div>
              </div>

              {/* YouTube Video Embed */}
              <div className='absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300'>
                <iframe
                  className='w-full h-full'
                  src='https://www.youtube.com/embed/cb8CiwBFe30?start=113&controls=1&modestbranding=1&rel=0'
                  title='Cipherdolls Tutorial'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
