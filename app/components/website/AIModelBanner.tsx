import type { AiProvider, TtsProvider, SttProvider } from '~/types';
import { getPicture } from '~/utils/getPicture';
import { PICTURE_SIZE } from '~/constants';

interface AIModelBannerProps {
  aiProviders: AiProvider[];
  ttsProviders: TtsProvider[];
  sttProviders: SttProvider[];
}

interface ProviderCardProps {
  name: string;
  picture?: string;
  id: string;
  models: string[];
  category: string;
  type: 'ai' | 'tts' | 'stt';
}

const getCategoryColor = (category: string) => {
  if (category.includes('Chat')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (category.includes('Reasoning')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (category.includes('Embedding')) return 'bg-green-50 text-green-700 border-green-200';
  if (category.includes('Text-to-Speech')) return 'bg-pink-50 text-pink-700 border-pink-200';
  if (category.includes('Speech-to-Text')) return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-neutral-05 text-neutral-01 border-neutral-04';
};

const ProviderCard = ({ name, picture, id, models, category, type }: ProviderCardProps) => {
  const typeMap = {
    ai: 'ai-providers',
    tts: 'tts-providers',
    stt: 'stt-providers',
  };

  const modelCount = models.length;
  const displayModels = models.slice(0, 2);

  return (
    <div className='flex-shrink-0 w-[320px] bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-bottom-level-1 border border-neutral-04 hover:shadow-bottom-level-2 transition-all duration-300 hover:scale-[1.02]'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-white shadow-regular border border-neutral-04 flex items-center justify-center'>
          <img
            src={getPicture({ id, picture: picture || '' }, typeMap[type], false, PICTURE_SIZE.small) as string}
            alt={name}
            className='w-full h-full object-contain p-1'
          />
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-lg text-base-black truncate'>{name}</h3>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}>
            {category}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-2 mb-3'>
        <div className='flex items-center gap-1.5 px-3 py-1.5 bg-neutral-05 rounded-lg'>
          <svg className='w-4 h-4 text-neutral-01' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
            />
          </svg>
          <span className='text-sm font-semibold text-base-black'>{modelCount} {modelCount === 1 ? 'Model' : 'Models'}</span>
        </div>
      </div>

      <div className='space-y-2'>
        {displayModels.map((model, idx) => (
          <div key={idx} className='flex items-start gap-2 text-sm'>
            <svg className='w-4 h-4 text-specials-success mt-0.5 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-neutral-01 line-clamp-1 flex-1'>{model}</span>
          </div>
        ))}
        {modelCount > 2 && (
          <div className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-neutral-05 to-transparent rounded-lg'>
            <svg className='w-4 h-4 text-neutral-02' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
            </svg>
            <span className='text-sm font-medium text-neutral-01'>+{modelCount - 2} more available</span>
          </div>
        )}
      </div>
    </div>
  );
};

const AIModelBanner = ({ aiProviders, ttsProviders, sttProviders }: AIModelBannerProps) => {
  const aiCards: ProviderCardProps[] = aiProviders.flatMap((provider) => {
    const cards: ProviderCardProps[] = [];

    if (provider.chatModels && provider.chatModels.length > 0) {
      cards.push({
        name: provider.name,
        picture: provider.picture,
        id: provider.id,
        models: provider.chatModels.map((m) => m.providerModelName),
        category: 'Chat Models',
        type: 'ai',
      });
    }

    if (provider.reasoningModels && provider.reasoningModels.length > 0) {
      cards.push({
        name: provider.name,
        picture: provider.picture,
        id: provider.id,
        models: provider.reasoningModels.map((m) => m.providerModelName),
        category: 'Reasoning Models',
        type: 'ai',
      });
    }

    if (provider.embeddingModels && provider.embeddingModels.length > 0) {
      cards.push({
        name: provider.name,
        picture: provider.picture,
        id: provider.id,
        models: provider.embeddingModels.map((m) => m.providerModelName),
        category: 'Embedding Models',
        type: 'ai',
      });
    }

    return cards;
  });

  const ttsCards: ProviderCardProps[] = ttsProviders
    .filter((provider) => provider.ttsVoices && provider.ttsVoices.length > 0)
    .map((provider) => ({
      name: provider.name,
      picture: provider.picture,
      id: provider.id,
      models: provider.ttsVoices.map((v) => v.name),
      category: 'Text-to-Speech',
      type: 'tts',
    }));

  const sttCards: ProviderCardProps[] = sttProviders.map((provider) => ({
    name: provider.name,
    picture: provider.picture,
    id: provider.id,
    models: ['Speech Recognition'],
    category: 'Speech-to-Text',
    type: 'stt',
  }));

  const allCards = [...aiCards, ...ttsCards, ...sttCards];
  const duplicatedCards = [...allCards, ...allCards];

  if (allCards.length === 0) {
    return null;
  }

  return (
    <section className='py-16 overflow-hidden bg-gradient-to-b from-transparent via-neutral-05/30 to-transparent'>
      <div className='container mb-10 text-center'>
        <div className='inline-block px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 mb-4'>
          <span className='text-sm font-semibold text-purple-700'>AI-Powered Platform</span>
        </div>
        <h2 className='text-heading-h2 font-bold text-base-black mb-3'>
          Powered by the Latest AI Models
        </h2>
        <p className='text-body-lg text-neutral-01 max-w-2xl mx-auto'>
          We support all modern AI providers so you always have access to the newest and best chat, reasoning, embedding, and voice models
        </p>
      </div>

      <div className='relative'>
        <div className='absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none' />
        <div className='absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none' />

        <div className='flex gap-5 animate-scroll-banner hover:[animation-play-state:paused] cursor-pointer'>
          {duplicatedCards.map((card, idx) => (
            <ProviderCard key={`${card.id}-${card.category}-${idx}`} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIModelBanner;
