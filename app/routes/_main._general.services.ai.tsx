import { Outlet, useNavigate, useSearchParams } from 'react-router';
import type { Route } from './+types/_main._general.services.ai';
import AiModelsTabs from '~/components/ai-services/AiModelsTabs';
import AiProvidersTab from '~/components/ai-services/AiProvidersTab';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'AI Services' }];
}

export default function AiServicesIndex({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get view mode from URL - 'providers' (default) or 'models'
  const viewMode = searchParams.get('view') || 'providers';
  const activeTab = searchParams.get('tab') || 'chat-models';

  const handleViewModeChange = (mode: 'providers' | 'models') => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', mode);
    if (mode === 'models' && !newSearchParams.has('tab')) {
      newSearchParams.set('tab', 'chat-models');
    }
    navigate(`/services/ai?${newSearchParams.toString()}`, { replace: true });
  };

  return (
    <>
      <div className='w-full'>
        <div className='flex items-center justify-between sm:mt-8 mb-6'>
          <h2 className='text-2xl font-semibold'>AI Services</h2>

          {/* View Mode Toggle */}
          <div className='flex items-center gap-2 bg-neutral-05 rounded-xl p-1'>
            <button
              onClick={() => handleViewModeChange('providers')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'providers' ? 'bg-white text-base-black shadow-sm' : 'text-neutral-01 hover:text-base-black'
              }`}
            >
              By Providers
            </button>
            <button
              onClick={() => handleViewModeChange('models')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'models' ? 'bg-white text-base-black shadow-sm' : 'text-neutral-01 hover:text-base-black'
              }`}
            >
              By Models
            </button>
          </div>
        </div>

        {/* Secondary Navigation - Tabs for Models or Search for Providers */}
        <div className='mb-6'>
          {viewMode === 'models' && <AiModelsTabs />}
          {viewMode === 'providers' && <AiProvidersTab />}
        </div>
      </div>
      <Outlet />
    </>
  );
}
