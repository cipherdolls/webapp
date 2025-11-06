import LoginButton from './LoginButton';

const content = {
  title: (
    <>
      Your Adventure Awaits
      <br />
      <span className='font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
        Ready to Start Chatting?
      </span>
    </>
  ),
  description: 'No email, no personal data, no subscriptions. Just private AI conversations.',
};

const CTA = () => {
  return (
    <section className='py-40'>
      <div className='container'>
        <div className='relative mx-auto max-w-5xl'>
          <div className='absolute -top-4 -left-4 w-8 h-8 bg-purple-400/30 rounded-full animate-pulse'></div>
          <div
            className='absolute -top-2 -right-6 w-6 h-6 bg-pink-400/30 rounded-full animate-pulse'
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className='absolute -bottom-4 left-1/4 w-4 h-4 bg-blue-400/30 rounded-full animate-pulse'
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className='absolute -bottom-2 right-1/3 w-5 h-5 bg-green-400/30 rounded-full animate-pulse'
            style={{ animationDelay: '0.5s' }}
          ></div>

          <div className='bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-12 shadow-sm'>
            <div className='relative'>
              <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>
                <div className='flex-1 text-left'>
                  <h2 className='text-3xl sm:text-4xl font-light text-gray-900 mb-4 leading-tight'>{content.title}</h2>
                  <p className='text-lg text-gray-600 leading-relaxed'>{content.description}</p>
                </div>

                <div className='flex-shrink-0'>
                  <LoginButton className='min-w-[160px] md:min-w-[200px]' aria-label='Log in to start chatting' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
