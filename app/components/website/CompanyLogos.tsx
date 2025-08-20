import assemblyLogo from '~/assets/logos/assembly.png';
import elevenlabsLogo from '~/assets/logos/elevenlabs.png';
import groqLogo from '~/assets/logos/groq.png';
import mixedbreadLogo from '~/assets/logos/mixedbread.png';
import openrouterLogo from '~/assets/logos/openrouter.png';

const CompanyLogos = () => {
  const companies = [
    {
      name: 'Assembly',
      logo: assemblyLogo,
      className: 'h-6',
    },
    {
      name: 'ElevenLabs',
      logo: elevenlabsLogo,
      className: 'h-6',
    },
    {
      name: 'Groq',
      logo: groqLogo,
      className: 'h-6',
    },
    {
      name: 'Mixedbread',
      logo: mixedbreadLogo,
      className: 'h-6',
    },
    {
      name: 'OpenRouter',
      logo: openrouterLogo,
      className: 'h-6',
    },
  ];

  return (
    <section className='py-16 opacity-70'>
      <div className='container'>
        {/* Logos Grid */}
        <div className='flex justify-center items-center gap-20'>
          {companies.map((company, index) => (
            <div key={index} className='flex items-center justify-center'>
              <img src={company.logo} alt={company.name} className={company.className} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyLogos;
