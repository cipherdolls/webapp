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

export default function Index() {
  return (
    <>
      <Header />
      <div>
        <Hero />
        <CompanyLogos />
        <HowItWorks />
        <Steps />
        <Avatars />
        <Scenarios />
        <Features />
        <CTA />
      </div>
      <Footer />
    </>
  );
}
