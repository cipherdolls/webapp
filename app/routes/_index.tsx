import type { Route } from './+types/_index';
import CompanyLogos from '~/components/website/CompanyLogos';
import Avatars from '~/components/website/Avatars';
import HowItWorks from '~/components/website/HowItWorks';
import Hero from '~/components/website/Hero';
import Steps from '~/components/website/Steps';
import Scenarios from '~/components/website/Scenarios';
import Features from '~/components/website/Features';
import CTA from '~/components/website/CTA';
import Footer from '~/components/website/Footer';
import Header from '~/components/website/Header';
import AIModelBanner from '~/components/website/AIModelBanner';
import { apiUrl } from '~/constants';
import type { Scenario } from '~/types';
import GuestMode from '~/components/website/GuestMode';
import { useEffect, useState } from 'react';
import { useAuthStore } from '~/store/useAuthStore';
const FREYA_AVATAR_ID = '5b0b2bc6-abb2-439c-a2a8-6b42ca10c7bb';

export function meta() {
  return [
    { title: 'CipherDolls - Where Privacy Meets Anonymous AI Chat' },
    {
      name: 'description',
      content: 'Chat with AI avatars without compromising your privacy. Completely anonymous, no personal data collected, no subscriptions. Pay only for what you use with LOV tokens. Unique AI personalities and custom scenarios.',
    },
    {
      name: 'keywords',
      content: 'privacy AI chat, anonymous AI chat, private AI conversations, LOV tokens, pay per message AI, Web3 AI chat, MetaMask AI chat, crypto AI chat, secure AI chat, confidential AI chat, avatar chat, AI roleplay, private chatbot',
    },
    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'CipherDolls - Where Privacy Meets Anonymous AI Chat' },
    {
      property: 'og:description',
      content: 'Chat with avatars without compromising your privacy. Completely anonymous AI chat with unique personalities. Pay per message with LOV tokens. No personal data, no subscriptions.',
    },
    { property: 'og:image', content: 'https://cipherdolls.com/logo.svg' },
    { property: 'og:url', content: 'https://cipherdolls.com' },
    { property: 'og:site_name', content: 'CipherDolls' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'CipherDolls - Privacy-First Anonymous AI Chat' },
    {
      name: 'twitter:description',
      content: 'Chat with AI avatars without compromising your privacy. Completely anonymous, pay only for what you use with LOV tokens. No personal data collected.',
    },
    { name: 'twitter:image', content: 'https://cipherdolls.com/logo.svg' },
    // Canonical
    { tagName: 'link', rel: 'canonical', href: 'https://cipherdolls.com' },
    // Structured Data
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CipherDolls',
        description: 'Where Privacy Meets Anonymous AI Chat',
        url: 'https://cipherdolls.com',
        applicationCategory: 'CommunicationApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Start chatting for free',
        },
        featureList: [
          'Completely anonymous AI chat',
          'No personal data collected',
          'Pay only for what you use with LOV tokens',
          'No subscriptions',
          'MetaMask wallet integration',
          'Custom AI avatars with unique personalities',
          'Voice chat support',
          'Custom conversation scenarios',
          'Spending limit controls',
          'Complete privacy guarantee',
        ],
      },
    },
  ];
}

export async function loader() {
  const [avatarRes, avatarsRes, scenariosRes, aiProvidersRes, ttsProvidersRes, sttProvidersRes] = await Promise.all([
    fetch(`${apiUrl}/avatars/${FREYA_AVATAR_ID}`, { method: 'GET' }),
    fetch(`${apiUrl}/avatars`, { method: 'GET' }),
    fetch(`${apiUrl}/scenarios`, { method: 'GET' }),
    fetch(`${apiUrl}/ai-providers`, { method: 'GET' }),
    fetch(`${apiUrl}/tts-providers`, { method: 'GET' }),
    fetch(`${apiUrl}/stt-providers`, { method: 'GET' }),
  ]);

  const [avatar, avatars, scenarios, aiProvidersData, ttsProviders, sttProviders] = await Promise.all([
    avatarRes.json(),
    avatarsRes.json(),
    scenariosRes.json(),
    aiProvidersRes.json(),
    ttsProvidersRes.json(),
    sttProvidersRes.json(),
  ]);

  // Filter out scenarios with errors in their models. TODO: Change this logic on the backend
  const scenariosWithoutErrors = {
    ...scenarios,
    data: scenarios.data.filter(
      (scenario: Scenario) => !scenario.chatModel?.error && !scenario.embeddingModel?.error && !scenario.reasoningModel?.error
    ),
  };

  return {
    avatar,
    avatars,
    scenarios: scenariosWithoutErrors,
    aiProviders: aiProvidersData.data || [],
    ttsProviders: ttsProviders || [],
    sttProviders: sttProviders || [],
  };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { avatar, avatars, scenarios, aiProviders, ttsProviders, sttProviders } = loaderData;
  const { verifyToken } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      await verifyToken();
      setIsVerifying(false);
    };
    verify();
  }, [verifyToken]);

  return (
    <>
      <Header isVerifying={isVerifying} />
      <div>
        <Hero avatar={avatar} />
        <AIModelBanner aiProviders={aiProviders} ttsProviders={ttsProviders} sttProviders={sttProviders} />
        <CompanyLogos />
        <HowItWorks />
        <Steps />
        <Avatars avatars={avatars.data.slice(0, 4)} />
        <Scenarios scenarios={scenarios.data.slice(0, 5)} />
        <GuestMode />
        <Features />
        <CTA />
      </div>
      <Footer />
    </>
  );
}
