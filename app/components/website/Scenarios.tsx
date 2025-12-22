import { useEffect, useRef, useState } from 'react';
import type { Scenario } from '~/types';
import { getPicture } from '~/utils/getPicture';
import ReactMarkdown from 'react-markdown';
import Subtitle from './components/Subtitle';

const content = {
  title: (
    <>
      Endless Possibilities
      <br />
      <span className='font-medium bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
        Diverse Conversation Scenarios
      </span>
    </>
  ),
  description:
    'Explore immersive conversation scenarios where each AI character adapts to complex situations. Click on any scenario below to see detailed context, relationships, and objectives that shape your interactions.',
};

// Custom gradients for each scenario
const scenarioGradients = [
  'from-orange-600/70 to-red-600/70',
  'from-blue-600/70 to-purple-600/70',
  'from-green-600/70 to-teal-600/70',
  'from-pink-600/70 to-rose-600/70',
  'from-indigo-600/70 to-blue-600/70',
  'from-emerald-600/70 to-green-600/70',
  'from-violet-600/70 to-purple-600/70',
  'from-cyan-600/70 to-blue-600/70',
  'from-amber-600/70 to-orange-600/70',
  'from-lime-600/70 to-green-600/70',
];

const Scenarios = ({ scenarios }: { scenarios: Scenario[] }) => {
  const [activeScenario, setActiveScenario] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentScenario = scenarios[activeScenario];
  // Reset scroll position when scenario changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeScenario]);

  return (
    <section id='scenarios' className='py-20'>
      <div className='container'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16'>
          <Subtitle pulseClassName='from-orange-500 to-red-500'>Scenarios</Subtitle>
          <h2 className='text-3xl sm:text-4xl font-light text-gray-900 leading-tight'>{content.title}</h2>
          <p className='text-lg text-gray-600 max-w-3xl mx-auto'>{content.description}</p>
        </div>

        {/* Interactive Scenario Slider */}
        <div className='bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8'>
          <div className='grid lg:grid-cols-2 gap-12'>
            {/* Left Side - Scenario Buttons */}
            <div className='space-y-4'>
              <div className='flex items-center justify-center lg:justify-between gap-3 mb-6'>
                <h4 className='text-xl font-medium text-gray-900'>Choose Your Scenario</h4>
                <span className='px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-full'>
                  50+ Scenarios
                </span>
              </div>
              <div className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 lg:grid-cols-1 lg:gap-3 lg:max-h-[540px] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
                {scenarios.map((scenario, index) => {
                  const isActive = activeScenario === index;
                  const gradientIndex = index % scenarioGradients.length;
                  const gradient = scenarioGradients[gradientIndex];

                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenario(index)}
                      className={`text-left p-1.5 sm:p-2 rounded-xl transition-all duration-300 group lg:w-full lg:p-4 ${
                        isActive
                          ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                          : 'bg-white/60 hover:bg-white/80 text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <div className='flex items-center gap-4'>
                        <div className='relative w-full aspect-square lg:w-16 lg:h-16 rounded-lg overflow-hidden flex-shrink-0'>
                          <img src={getPicture(scenario, 'scenarios', false)} alt={scenario.name} className='w-full h-full object-cover' />
                        </div>
                        <div className='flex-1 min-w-0 hidden lg:block'>
                          <h5 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-gray-900'}`}>{scenario.name}</h5>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Scenario Content */}
            <div ref={contentRef} className='space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide'>
              <div className='flex items-center space-x-3 mb-6'>
                {/* <div className='w-12 h-12 bg-black rounded-xl flex items-center justify-center'>
                  <IconComponent className="w-6 h-6 text-white" />
                </div> */}
                <div>
                  <h4
                    className={`text-3xl font-bold bg-gradient-to-r ${scenarioGradients[activeScenario % scenarioGradients.length]} bg-clip-text text-transparent`}
                  >
                    {currentScenario.name}
                  </h4>
                  {/* <p className='text-gray-600'>{currentScenario.introduction}</p> */}
                </div>
              </div>

              {/* Scenario Image */}
              <div className='relative w-full h-64 rounded-2xl overflow-hidden mb-6'>
                <img
                  src={getPicture(currentScenario, 'scenarios', false)}
                  srcSet={getPicture(currentScenario, 'scenarios', true)}
                  alt={`${currentScenario.name} picture`}
                  className='object-cover size-full'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
              </div>
              <div className='space-y-6 opacity-0 animate-fade-in' key={`scenario-${activeScenario}`}>
                {/* Situation */}
                <div className='space-y-3'>
                  {/* <div className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <h5 className='font-semibold text-gray-900'>Situation</h5>
                  </div> */}
                  <div className='text-gray-600 leading-relaxed pl-4'>
                    <ReactMarkdown>{currentScenario.introduction}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Scenarios;
