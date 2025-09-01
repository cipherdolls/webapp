import { useNavigate, useSearchParams } from 'react-router';
import { cn } from '~/utils/cn';
import { UniversalModelTab } from './UniversalModelTab';
import { useEmbeddingModels, useInfiniteChatModels, useReasoningModels } from '~/hooks/queries/aiProviderQueries';
import { ROUTES } from '~/constants';

type Tab = {
  id: 'chat-models' | 'embedding-models' | 'reasoning-models';
  label: string;
};

const tabs: Tab[] = [
  {
    id: 'chat-models',
    label: 'Chat Models',
  },
  {
    id: 'embedding-models',
    label: 'Embedding Models',
  },
  {
    id: 'reasoning-models',
    label: 'Reasoning Models',
  },
];

export default function AiModelsTabs() {
  const [searchParams] = useSearchParams();
  const searchProviderModelName = searchParams.get('providerModelName') || '';

  const chatModelsQuery = useInfiniteChatModels({ providerModelName: searchProviderModelName });
  const embeddingModelsQuery = useEmbeddingModels();
  const reasoningModelsQuery = useReasoningModels();

  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || tabs[0]?.id;

  const handleTabClick = (tabId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tabId);
    navigate(`${ROUTES.services}/ai?${newSearchParams.toString()}`, { replace: true });
  };

  // Just handle each tab explicitly:
  return (
    <div className='w-full'>
      <div className='border-b border-neutral-04 mb-6'>
        <div className='flex space-x-8'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'py-3 px-1 text-sm font-medium border-b-2 transition duration-400 relative',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-01 hover:text-base-black hover:border-neutral-03'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className='w-full'>
        {tabs.map((tab) => {
          let data: any[] = [];
          let queryProps: any = {};

          if (tab.id === 'chat-models') {
            const { data: paginated, ...rest } = chatModelsQuery;
            data = paginated?.pages?.flatMap((page: any) => (Array.isArray(page.data) ? page.data : [])) ?? [];
            queryProps = rest;
          } else if (tab.id === 'embedding-models') {
            const { data: result, ...rest } = embeddingModelsQuery;
            data = Array.isArray(result) ? result : [];
            queryProps = rest;
          } else if (tab.id === 'reasoning-models') {
            const { data: result, ...rest } = reasoningModelsQuery;
            data = Array.isArray(result) ? result : [];
            queryProps = rest;
          }

          return (
            <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
              <UniversalModelTab tabType={tab.id} data={data} {...queryProps} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
