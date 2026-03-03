import { Wallet, User, Zap, MessageSquare, Link } from 'lucide-react';

const content = {
  title: 'Get Started in',
  subtitle: 'Under a Minute',
  description: 'It only takes a few simple steps to start chatting with your favourite AI companions',
};

const steps = [
  {
    icon: Link,
    title: 'Sign In',
    description: 'Connect with your wallet — no email, no passwords, no personal info required.',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-gradient-to-br from-indigo-50/80 to-blue-50/60',
    iconBg: 'bg-gradient-to-br from-indigo-100 to-blue-100',
  },
  {
    icon: Wallet,
    title: 'Grab Free Credits',
    description: 'Get free tokens to try everything out. No credit card, no commitment.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50/80 to-cyan-50/60',
    iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
  },
  {
    icon: User,
    title: 'Pick a Character',
    description: 'Browse unique AI personalities and choose who you want to talk to.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-50/80 to-pink-50/60',
    iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100',
  },
  {
    icon: Zap,
    title: 'Only Pay for What You Use',
    description: 'No monthly fees. You only spend when you chat, and you set your own limits.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50/80 to-emerald-50/60',
    iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100',
  },
  {
    icon: MessageSquare,
    title: 'Start Chatting',
    description: 'Dive into private, immersive conversations that feel real.',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-50/80 to-red-50/60',
    iconBg: 'bg-gradient-to-br from-orange-100 to-red-100',
  },
];

const Steps = () => {
  return (
    <section id='steps' className='py-24 relative overflow-hidden'>
      {/* Background Elements */}
      <div className='absolute inset-0 opacity-20'>
        <div className='absolute top-32 left-20 w-40 h-40 bg-gradient-to-br from-blue-300/40 to-purple-300/40 rounded-full blur-3xl animate-pulse'></div>
        <div
          className='absolute bottom-32 right-20 w-48 h-48 bg-gradient-to-br from-pink-300/40 to-orange-300/40 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-green-300/30 to-blue-300/30 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      <div className='container relative'>
        {/* Section Header */}
        <div className='text-center space-y-6 mb-20'>
          <div className='inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200/50 mb-4'>
            <div className='w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse'></div>
            <span>Simple Process</span>
          </div>
          <h2 className='text-4xl sm:text-5xl font-light text-gray-900 leading-tight'>
            {content.title}
            <br />
            <span className='font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              {' '}
              {content.subtitle}
            </span>
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>{content.description}</p>
        </div>

        {/* Horizontal Timeline */}
        <div className='relative'>
          {/* Timeline Container */}
          <div className='flex flex-col items-center space-y-12'>
            {/* Top Timeline with Icons */}
            <div className='relative w-full px-[calc(10%-40px)]'>
              <div className='relative w-full'>
                {/* Horizontal Timeline Line */}
                <div className='absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-orange-500 transform -translate-y-1/2'></div>

                {/* Timeline Nodes */}
                <div className='flex justify-between items-center relative'>
                  {steps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <div key={index} className='relative'>
                        {/* Timeline Node */}
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:scale-110 hover:shadow-xl transition-all duration-500 relative backdrop-blur-md`}
                        >
                          <Icon className='w-7 h-7 text-white' />
                          <div className='absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent'></div>
                        </div>

                        {/* Connecting Line to Card */}
                        <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-gray-300 to-transparent'></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full'>
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={index} className='relative'>
                    <div
                      className={`${step.bgColor} border border-white/80 rounded-3xl p-4 shadow-lg backdrop-blur-md relative group hover:shadow-xl hover:scale-105 transition-all duration-500 h-full`}
                    >
                      {/* Content */}
                      <div className='space-y-4 text-center'>
                        <div className={`w-10 h-10 ${step.iconBg} rounded-xl flex items-center justify-center mx-auto shadow-sm`}>
                          <Icon className='w-5 h-5 text-gray-700' />
                        </div>
                        <div className='space-y-2'>
                          <h3 className='text-base font-semibold text-gray-900 group-hover:text-gray-800 transition-colors'>
                            {step.title}
                          </h3>
                          <p className='text-sm text-gray-700 leading-relaxed'>{step.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Text */}
        <div className='text-center mt-16'>
          <div className='inline-flex items-center space-x-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-full px-8 py-4 shadow-lg'>
            <div className='w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse'></div>
            <p className='text-xl font-light text-gray-900'>That's it — you're ready to go!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Steps;
