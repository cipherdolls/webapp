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
import { apiUrl, ROUTES } from '~/constants';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';


const FREYA_AVATAR_ID = '5b0b2bc6-abb2-439c-a2a8-6b42ca10c7bb';




export async function clientLoader() {
  const avatarRes = await fetch(`${apiUrl}/avatars/${FREYA_AVATAR_ID}`, {
    method: 'GET',
  });
  const avatarsRes = await fetch(`${apiUrl}/avatars`, {
    method: 'GET',
  });

  const scenariosRes = await fetch(`${apiUrl}/scenarios`, {
    method: 'GET',
  });

  const avatar = await avatarRes.json();
  const avatars = await avatarsRes.json();
  const scenarios = await scenariosRes.json();  
  return {
    avatar,
    avatars,
    scenarios,
  };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { avatar, avatars, scenarios } = loaderData;

  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate();

  const referral = params.get('referral');

  useEffect(() => {
    if (referral) {
      navigate(`${ROUTES.signIn}?referral=${referral}`)
    }
  }, [])

  return (
    <>
      <Header />
      <div>
        <Hero avatar={avatar} />
        <CompanyLogos />
        <HowItWorks />
        <Steps />
        <Avatars avatars={avatars.data.slice(0, 4)} />
        <Scenarios scenarios={scenarios.data.slice(0, 5)} />
        <Features />
        <CTA />
      </div>
      <Footer />
    </>
  );
}
