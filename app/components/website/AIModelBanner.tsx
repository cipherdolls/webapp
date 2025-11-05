import type { AiProvider, TtsProvider, SttProvider } from '~/types';
import { getPicture } from '~/utils/getPicture';
import { PICTURE_SIZE } from '~/constants';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback } from 'react';
import { ChevronLeft, ChevronRight, EllipsisVertical, ShieldCheck } from 'lucide-react';

interface AIModelBannerProps {
  aiProviders: AiProvider[];
  ttsProviders: TtsProvider[];
  sttProviders: SttProvider[];
}

interface ProviderCardProps {
  name: string;
  picture?: string;
  id: string;
  models: { category: string; models: string[] }[];
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

const ProviderCard = ({ name, picture, id, models, type }: ProviderCardProps) => {
  const typeMap = {
    ai: 'ai-providers',
    tts: 'tts-providers',
    stt: 'stt-providers',
  };

  const totalModels = models.reduce((acc, group) => acc + group.models.length, 0);
  const allModels = models.flatMap((group) => group.models);
  const displayModels = allModels.slice(0, 3);

  return (
    <div className='flex-shrink-0 w-full h-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-neutral-04 transition-all duration-300 hover:scale-[1.02] flex flex-col overflow-hidden'>
      <div className='flex flex-col gap-3 mb-3'>
        <div className='flex items-center gap-3'>
          <div className='flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-white shadow-regular border border-neutral-04 flex items-center justify-center'>
            <img
              src={getPicture({ id, picture: picture || '' }, typeMap[type], false, PICTURE_SIZE.small) as string}
              alt={name}
              className='w-10 h-10 object-contain rounded-lg'
            />
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-lg text-base-black truncate'>{name}</h3>
          </div>
          <div className='flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 bg-neutral-05 rounded-lg flex-shrink-0'>
            <ShieldCheck size={14} className='text-neutral-01 md:w-4 md:h-4' />
            <span className='text-xs md:text-sm font-semibold text-base-black whitespace-nowrap'>
              {totalModels} <span className='hidden md:inline 2xl:inline '>{totalModels === 1 ? 'Model' : 'Models'}</span>
            </span>
          </div>
        </div>

        <div className='flex flex-wrap gap-1'>
          {models.map((group, idx) => (
            <span
              key={idx}
              className={`inline-block px-2 py-0.5 whitespace-nowrap rounded-full text-xs font-medium border ${getCategoryColor(group.category)}`}
            >
              {group.category}
            </span>
          ))}
        </div>
      </div>

      <div className='space-y-2 flex-1'>
        {displayModels.map((model, idx) => (
          <div key={idx} className='flex items-center gap-2 text-sm'>
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
        {totalModels > 3 && (
          <div className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-neutral-05 to-transparent rounded-lg'>
            <EllipsisVertical size={16} className='text-neutral-02' />
            <span className='text-sm font-medium text-neutral-01'>+{totalModels - 3} more available</span>
          </div>
        )}
      </div>
    </div>
  );
};

const AIModelBanner = ({ aiProviders, ttsProviders, sttProviders }: AIModelBannerProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const aiCards: ProviderCardProps[] = aiProviders
    .map((provider) => {
      const modelGroups: { category: string; models: string[] }[] = [];

      if (provider.chatModels && provider.chatModels.length > 0) {
        modelGroups.push({
          category: 'Chat',
          models: provider.chatModels.map((m) => m.providerModelName),
        });
      }

      if (provider.reasoningModels && provider.reasoningModels.length > 0) {
        modelGroups.push({
          category: 'Reasoning',
          models: provider.reasoningModels.map((m) => m.providerModelName),
        });
      }

      if (provider.embeddingModels && provider.embeddingModels.length > 0) {
        modelGroups.push({
          category: 'Embedding',
          models: provider.embeddingModels.map((m) => m.providerModelName),
        });
      }

      return {
        name: provider.name,
        picture: provider.picture,
        id: provider.id,
        models: modelGroups,
        type: 'ai' as const,
      };
    })
    .filter((card) => card.models.length > 0);

  const ttsCards: ProviderCardProps[] = ttsProviders
    .filter((provider) => provider.ttsVoices && provider.ttsVoices.length > 0)
    .map((provider) => ({
      name: provider.name,
      picture: provider.picture,
      id: provider.id,
      models: [
        {
          category: 'Text-to-Speech',
          models: provider.ttsVoices.map((v) => v.name),
        },
      ],
      type: 'tts' as const,
    }));

  const sttCards: ProviderCardProps[] = sttProviders.map((provider) => ({
    name: provider.name,
    picture: provider.picture,
    id: provider.id,
    models: [
      {
        category: 'Speech-to-Text',
        models: ['Speech Recognition'],
      },
    ],
    type: 'stt' as const,
  }));

  const allCards = [...aiCards, ...ttsCards, ...sttCards];

  if (allCards.length === 0) {
    return null;
  }

  return (
    <section className='py-16 overflow-hidden'>
      <div className='container mb-10 text-center'>
        <div className='inline-block px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 mb-4'>
          <span className='text-sm font-semibold text-purple-700'>AI-Powered Platform</span>
        </div>
        <h2 className='text-heading-h2 font-bold text-base-black mb-3'>Powered by the Latest AI Models</h2>
        <p className='text-body-lg text-neutral-01 max-w-2xl mx-auto'>
          We support all modern AI providers so you always have access to the newest and best chat, reasoning, embedding, and voice models
        </p>
      </div>

      <div className='relative px-16'>
        <button
          onClick={scrollPrev}
          className='absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-bottom-level-1 border border-neutral-04 hover:bg-white hover:shadow-bottom-level-2 transition-all duration-300 flex items-center justify-center group'
          aria-label='Previous slide'
        >
          <ChevronLeft size={24} className='text-base-black group-hover:scale-110 transition-transform' />
        </button>

        <button
          onClick={scrollNext}
          className='absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-bottom-level-1 border border-neutral-04 hover:bg-white hover:shadow-bottom-level-2 transition-all duration-300 flex items-center justify-center group'
          aria-label='Next slide'
        >
          <ChevronRight size={24} className='text-base-black group-hover:scale-110 transition-transform' />
        </button>

        <div className='overflow-hidden' ref={emblaRef}>
          <div className='flex min-h-[240px] -ml-3'>
            {allCards.map((card, idx) => (
              <div
                key={`${card.id}-${idx}`}
                className='flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] 2xl:flex-[0_0_20%] min-w-0 pl-3'
              >
                <ProviderCard {...card} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIModelBanner;
