import Subtitle from './components/Subtitle';

const content = {
  title: (
    <>
      Crafted with Care
      <br />
      <span className='font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent'>
        Every Avatar Tells a Story
      </span>
    </>
  ),
  subtitle: 'Our Craft',
  description:
    'Our avatars are meticulously crafted with rich personalities, unique backstories, and sophisticated conversation abilities. Each avatar brings their own expertise, emotional depth, and authentic responses that create truly engaging and memorable interactions.',
};

const HowItWorks = () => {
  return (
    <section id='sectionHowItWorks' className='py-20'>
      <div className='container'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16'>
          <Subtitle pulseClassName='from-blue-500 to-cyan-500'>{content.subtitle}</Subtitle>
          <h2 className='text-4xl sm:text-5xl font-light text-gray-900 leading-tight'>{content.title}</h2>
          <p className='text-lg text-gray-600 max-w-3xl mx-auto'>{content.description}</p>
        </div>

        {/* Video Section */}
        <div className='mb-20'>
          <div className='relative max-w-4xl mx-auto'>
            <div className='relative bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl overflow-hidden shadow-sm aspect-video'>
              <iframe
                className='w-full h-full'
                src='https://www.youtube.com/embed/cb8CiwBFe30?start=113&controls=1&modestbranding=1&rel=0'
                title='Cipherdolls Tutorial'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
