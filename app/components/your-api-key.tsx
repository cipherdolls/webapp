import { useState } from 'react';
import { useApiKeys } from '~/hooks/queries/apiKeyQueries';
import { useCreateApiKey, useDeleteApiKey } from '~/hooks/queries/apiKeyMutations';
import { Eye, EyeOff, Copy, Plus, Trash2 } from 'lucide-react';
import { InformationBadge } from '~/components/ui/InformationBadge';

export const YourApiKey = () => {
  const { data: apiKeys, isLoading } = useApiKeys();
  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey();
  const { mutate: deleteApiKey } = useDeleteApiKey();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className='flex flex-col gap-5'>
        <div className='rounded-[10px] h-6 bg-neutral-04 w-36 animate-pulse'></div>
        <div className='bg-neutral-04 rounded-xl p-3 h-[60px] animate-pulse'></div>
      </div>
    );
  }

  const toggleVisible = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-heading-h3 text-base-black'>API Keys</h3>
        <InformationBadge className='size-6' side='top' tooltipText='Use these keys to connect and authenticate your doll body device' popoverClassName='ml-auto' />
      </div>

      <div className='flex flex-col gap-3'>
        {apiKeys?.map((apiKey) => (
          <div key={apiKey.id} className='bg-gradient-1 p-2 rounded-xl'>
            <div className='bg-base-white rounded-xl p-3 flex items-center gap-3 shadow-md'>
              <div className='flex-1 min-w-0'>
                {apiKey.name && <span className='text-body-xs text-neutral-02 block'>{apiKey.name}</span>}
                <code className='text-body-sm text-base-black truncate select-all block'>
                  {visibleKeys.has(apiKey.id) ? apiKey.key : '\u2022'.repeat(32)}
                </code>
              </div>
              <div className='flex items-center gap-1.5 shrink-0'>
                <button
                  onClick={() => toggleVisible(apiKey.id)}
                  className='p-1.5 rounded-lg hover:bg-neutral-05 transition-colors text-neutral-01 hover:text-base-black'
                  aria-label={visibleKeys.has(apiKey.id) ? 'Hide API key' : 'Show API key'}
                >
                  {visibleKeys.has(apiKey.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => handleCopy(apiKey.key)}
                  className='p-1.5 rounded-lg hover:bg-neutral-05 transition-colors text-neutral-01 hover:text-base-black'
                  aria-label='Copy API key'
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => deleteApiKey(apiKey.id)}
                  className='p-1.5 rounded-lg hover:bg-neutral-05 transition-colors text-neutral-01 hover:text-red-500'
                  aria-label='Delete API key'
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!apiKeys || apiKeys.length === 0) && (
          <p className='text-body-sm text-neutral-02'>No API keys yet.</p>
        )}
      </div>

      <button
        onClick={() => createApiKey('')}
        disabled={isCreating}
        className='flex items-center gap-2 text-body-sm text-neutral-01 hover:text-base-black transition-colors disabled:opacity-50'
      >
        <Plus size={16} />
        {isCreating ? 'Creating...' : 'Create new API key'}
      </button>
    </div>
  );
};
