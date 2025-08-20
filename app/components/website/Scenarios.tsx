import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
import { Skull, DollarSign, Flame, User, Zap } from 'lucide-react';
// import apocalypticImage from '../assets/picture (7).webp';
// import cryptoImage from '../assets/picture (6).webp';
// import intimateImage from '../assets/picture (4).webp';
// import negotiationImage from '../assets/picture (7).webp';
// import mysteryImage from '../assets/picture (6).webp';

const Scenarios = () => {
  const [activeScenario, setActiveScenario] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const scenarios = [
    {
      id: 'apocalyptic',
      title: 'Apocalyptic Dilemma',
      icon: Skull,
      image: null,
      shortDesc: 'Survival in a post-apocalyptic world',
      situation: 'You arrive at the entrance of a ruined city\'s only safe shelter, which is locked and filled with a small group of survivors. The atmosphere is tense, and the uncertainty of the situation looms large.',
      relationship: 'You are accompanied by a character who has a complicated history with the leader of the survivor group inside the shelter, someone who has previously betrayed you.',
      objective: 'Your goal is to decide whether to enter the shelter despite the risks, navigate the ensuing conflict, and ultimately find a way to escape if the situation turns dangerous.'
    },
    {
      id: 'crypto',
      title: 'Crypto Trading Crisis',
      icon: DollarSign,
      image: null,
      shortDesc: 'High-stakes cryptocurrency trading',
      situation: 'Market volatility hits as you discover a potential game-changing investment opportunity. The digital landscape shifts rapidly around you, presenting both incredible risks and rewards.',
      relationship: 'You partner with a brilliant crypto trader who challenges your every decision, pushing you to think beyond conventional investment strategies.',
      objective: 'Navigate high-stakes trading decisions, manage portfolio risks, and build your digital empire while staying ahead of market manipulation.'
    },
    {
      id: 'intimate',
      title: 'Intimate Fantasies',
      icon: Flame,
      image: null,
      shortDesc: 'Explore passionate connections',
      situation: 'An intimate encounter unfolds in a luxurious setting where forbidden desires and passionate connections take center stage, creating an atmosphere of seduction and allure.',
      relationship: 'You are connected with a seductive character who commands attention and power, drawing you into their world of sophisticated pleasures and intimate secrets.',
      objective: 'Explore passionate scenarios while navigating complex emotional dynamics, surrendering to desire while maintaining your sense of self and boundaries.'
    },
    {
      id: 'negotiation',
      title: 'Corporate Negotiation',
      icon: User,
      image: null,
      shortDesc: 'High-pressure business dealings',
      situation: 'You enter a boardroom where a multi-million dollar deal hangs in the balance. The stakes are high, and every word could make or break your company\'s future.',
      relationship: 'You face off against a seasoned negotiator who has a reputation for ruthless tactics and always getting what they want.',
      objective: 'Secure the best possible terms for your company while maintaining professional relationships and avoiding potential legal pitfalls.'
    },
    {
      id: 'mystery',
      title: 'Mystery Investigation',
      icon: Zap,
      image: null,
      shortDesc: 'Solve complex mysteries',
      situation: 'A puzzling case lands on your desk involving missing persons, cryptic clues, and a web of secrets that runs deeper than anyone imagined.',
      relationship: 'You work alongside a brilliant but eccentric detective who sees patterns others miss but whose methods often clash with conventional approaches.',
      objective: 'Uncover the truth behind the mystery while navigating red herrings, protecting witnesses, and staying one step ahead of those who want the case buried.'
    }
  ];

  const currentScenario = scenarios[activeScenario];
  const IconComponent = currentScenario.icon;

  // Reset scroll position when scenario changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeScenario]);

  return (
    <section id="scenarios" className="py-20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200/50 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
            <span>Experiences</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-gray-900 leading-tight">
            Endless Possibilities
            <br />
            <span className="font-medium bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Diverse Conversation Scenarios</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore immersive conversation scenarios where each AI character adapts to complex situations. 
            Click on any scenario below to see detailed context, relationships, and objectives that shape your interactions.
          </p>
        </div>

        {/* Interactive Scenario Slider */}
        <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Scenario Buttons */}
            <div className="space-y-4">
              <h4 className="text-xl font-medium text-gray-900 mb-6">Choose Your Scenario</h4>
              <div className="space-y-3">
                {scenarios.map((scenario, index) => {
                  const ScenarioIcon = scenario.icon;
                  const isActive = activeScenario === index;
                  
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenario(index)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? 'bg-black text-white shadow-lg' 
                          : 'bg-white/60 hover:bg-white/80 text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={scenario.image} 
                            alt={scenario.title}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 flex items-center justify-center ${
                            isActive ? 'bg-black/40' : 'bg-black/20'
                          }`}>
                            <ScenarioIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/80'}`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className={`font-medium text-sm mb-1 ${
                            isActive ? 'text-white' : 'text-gray-900'
                          }`}>
                            {scenario.title}
                          </h5>
                          <p className={`text-xs leading-relaxed ${
                            isActive ? 'text-gray-200' : 'text-gray-600'
                          }`}>
                            {scenario.shortDesc}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Scenario Content */}
            <div ref={contentRef} className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-medium text-gray-900">{currentScenario.title}</h4>
                  <p className="text-gray-600">{currentScenario.shortDesc}</p>
                </div>
              </div>

              {/* Scenario Image */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-6">
                <img 
                  src={currentScenario.image} 
                  alt={currentScenario.title}
                  className="w-full h-full object-cover"
                  key={`scenario-image-${activeScenario}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="space-y-6 opacity-0 animate-fade-in" key={`scenario-${activeScenario}`}>
                {/* Situation */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h5 className="font-semibold text-gray-900">Situation</h5>
                  </div>
                  <p className="text-gray-600 leading-relaxed pl-4">
                    {currentScenario.situation}
                  </p>
                </div>

                {/* Relationship */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <h5 className="font-semibold text-gray-900">Your Relationship</h5>
                  </div>
                  <p className="text-gray-600 leading-relaxed pl-4">
                    {currentScenario.relationship}
                  </p>
                </div>

                {/* Objective */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h5 className="font-semibold text-gray-900">Your Task/Objective</h5>
                  </div>
                  <p className="text-gray-600 leading-relaxed pl-4">
                    {currentScenario.objective}
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