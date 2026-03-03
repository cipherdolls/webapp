import React from 'react';
import { Shield, Coins, Zap } from 'lucide-react';
import Subtitle from './components/Subtitle';

const content = {
  title: (
    <>
      Built for Your Peace of Mind
      <br />
      <span className='font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
        Why People Love Cipherdolls
      </span>
    </>
  ),
  subtitle: 'Why Us',
  description: 'Private conversations with amazing AI characters — on your terms, at your pace.',
  cards: [
    {
      icon: Shield,
      title: 'Your Privacy Comes First',
      description:
        "No email, no phone number, no credit card. We don't collect personal data — period. Your conversations stay between you and your character.",
      color: 'green',
      gradient: 'from-green-50/50 to-emerald-50/30',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      icon: Coins,
      title: 'Simple & Secure Payments',
      description:
        'Pay with tokens that keep your identity private. No bank details, no recurring charges, no surprises on your statement.',
      color: 'purple',
      gradient: 'from-purple-50/50 to-violet-50/30',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    {
      icon: Zap,
      title: 'No Subscriptions, Ever',
      description:
        "You only pay when you chat. Don't use it for a month? That's fine — it costs you nothing. Plus, you set your own spending limits so you're always in control.",
      color: 'blue',
      gradient: 'from-blue-50/50 to-cyan-50/30',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
  ],
};

const Features = () => {
  return (
    <section id='features' className='py-20'>
      <div className='container'>
        {/* Section Header */}
        <div className='text-center space-y-4 mb-16'>
          <Subtitle pulseClassName='from-green-500 to-emerald-500'>{content.subtitle}</Subtitle>
          <h2 className='text-3xl sm:text-4xl font-light text-gray-900 leading-tight'>{content.title}</h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>{content.description}</p>
        </div>

        {/* Cards Grid */}
        <div className='grid lg:grid-cols-3 gap-8'>
          {content.cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`relative bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
              >
                {/* Subtle Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-3xl opacity-60`}></div>

                {/* Content */}
                <div className='relative space-y-6'>
                  <div
                    className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>
                  <div className='space-y-4'>
                    <h3 className='text-xl font-semibold text-gray-900 group-hover:text-gray-800 transition-colors leading-tight'>
                      {card.title}
                    </h3>
                    <p className='text-gray-700 leading-relaxed'>{card.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
