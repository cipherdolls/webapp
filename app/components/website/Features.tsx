import React from 'react';
import { Shield, Coins, Zap } from 'lucide-react';

const Features = () => {
  const cards = [
    {
      icon: Shield,
      title: 'Complete Privacy & Anonymity',
      description: 'You don\'t need to provide an email address or credit card information to use our services. We operate completely anonymously to protect your privacy.',
      color: 'green',
      gradient: 'from-green-50/50 to-emerald-50/30',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      icon: Coins,
      title: 'Secure LOV Token Payments',
      description: 'This is why we use LOV tokens to pay for messages, ensuring that all transactions are secure and private. There are no monthly subscriptions or hidden fees.',
      color: 'purple',
      gradient: 'from-purple-50/50 to-violet-50/30',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      icon: Zap,
      title: 'Pay Only What You Use',
      description: 'You only pay for the messages you send and receive, so if you don\'t use Cipherdolls, you don\'t need to pay a thing. You can also set spending limits to control exactly how much LOV you want to use.',
      color: 'blue',
      gradient: 'from-blue-50/50 to-cyan-50/30',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200/50 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
            <span>Why Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-gray-900 leading-tight">
            Built for Your Peace of Mind
            <br />
            <span className="font-medium bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Why Choose Cipherdolls</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience AI chat with complete privacy and security. No compromises on your personal data.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`relative bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
              >
                {/* Subtle Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-3xl opacity-60`}></div>
                
                {/* Content */}
                <div className="relative space-y-6">
                  <div className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${card.iconColor}`} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-800 transition-colors leading-tight">{card.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{card.description}</p>
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