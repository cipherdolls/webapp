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
              <h4 className='text-xl font-medium text-gray-900 mb-6'>Choose Your Scenario</h4>
              <div className='space-y-3'>
                {scenarios.map((scenario, index) => {
                  // const ScenarioIcon = scenario.icon;
                  const isActive = activeScenario === index;

                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenario(index)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                        isActive ? 'bg-black text-white shadow-lg' : 'bg-white/60 hover:bg-white/80 text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0'>
                          <img src={getPicture(scenario, 'scenarios', false)} alt={scenario.name} className='w-full h-full object-cover' />
                          <div className={`absolute inset-0 flex items-center justify-center ${isActive ? 'bg-black/40' : 'bg-black/20'}`}>
                            {/* <ScenarioIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/80'}`} /> */}
                          </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h5 className={`font-medium text-md mb-1 ${isActive ? 'text-white' : 'text-gray-900'}`}>{scenario.name}</h5>
                          {/* <p className={`text-xs leading-relaxed ${isActive ? 'text-gray-200' : 'text-gray-600'}`}>
                            {scenario.introduction}
                          </p> */}
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
                <div className='w-12 h-12 bg-black rounded-xl flex items-center justify-center'>
                  {/* <IconComponent className="w-6 h-6 text-white" /> */}
                </div>
                <div>
                  <h4 className='text-2xl font-medium text-gray-900'>{currentScenario.name}</h4>
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
                  <p className='text-gray-600 leading-relaxed pl-4'>
                    <ReactMarkdown>{currentScenario.introduction}</ReactMarkdown>
                  </p>
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
