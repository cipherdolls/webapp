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
    },
    {
      name: 'ElevenLabs',
      logo: elevenlabsLogo,
    },
    {
      name: 'Groq',
      logo: groqLogo,
    },
    {
      name: 'Mixedbread',
      logo: mixedbreadLogo,
    },
    {
      name: 'OpenRouter',
      logo: openrouterLogo,
    },
  ];

  return (
    <section className='py-16 '>
      <div className='container'>
        {/* Logos Grid */}
        <div className='flex flex-wrap justify-center items-center gap-20 opacity-60'>
          {companies.map((company, index) => (
            <div key={index} className='flex items-center justify-center'>
              <img src={company.logo} alt={company.name}  className={'h-6'} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyLogos;
