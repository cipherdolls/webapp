import { useNavigate, useSearchParams } from 'react-router';
import { cn } from '~/utils/cn';

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type AiServicesTabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  filterComponent?: React.ReactNode;
};

export function AiServicesTabs({ tabs, defaultTab, filterComponent }: AiServicesTabsProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Read active tab from URL instead of local state
  const activeTab = searchParams.get('tab') || defaultTab || tabs[0]?.id;

  const handleTabClick = (tabId: string) => {
    // Update URL with new tab while preserving other search params
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tabId);
    navigate(`/services/ai?${newSearchParams.toString()}`, { replace: true });
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className='w-full'>
      {/* Tab Navigation */}
      <div className='border-b border-neutral-04 mb-6'>
        <div className='flex justify-between items-center'>
          <div className='flex space-x-8'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'py-3 px-1 text-sm font-medium border-b-2 transition-colors relative',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-01 hover:text-base-black hover:border-neutral-03'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Filter Component on the right */}
          {filterComponent && (
            <div className='flex items-center'>
              {filterComponent}
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className='w-full'>
        {activeTabContent}
      </div>
    </div>
  );
}