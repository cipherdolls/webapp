import { useState } from 'react';
import { useUser } from '~/hooks/queries/userQueries';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { InformationBadge } from '~/components/ui/InformationBadge';

export const YourApiKey = () => {
  const { data: user, isLoading } = useUser();
  const [visible, setVisible] = useState(false);

  if (isLoading || !user) {
    return (
      <div className='flex flex-col gap-5'>
        <div className='rounded-[10px] h-6 bg-neutral-04 w-36 animate-pulse'></div>
        <div className='bg-neutral-04 rounded-xl p-3 h-[60px] animate-pulse'></div>
      </div>
    );
  }

  const apiKey = user.apikey;

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
  };

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-heading-h3 text-base-black'>API Key</h3>
        <InformationBadge className='size-6' side='top' tooltipText='Use this key to connect and authenticate your doll body device' popoverClassName='ml-auto' />
      </div>

      <div className='bg-gradient-1 p-2 rounded-xl'>
        <div className='bg-base-white rounded-xl p-3 flex items-center gap-3 shadow-md'>
          <code className='flex-1 text-body-sm text-base-black truncate select-all'>
            {apiKey ? (visible ? apiKey : '•'.repeat(32)) : 'No API key'}
          </code>
          {apiKey && (
            <div className='flex items-center gap-1.5 shrink-0'>
              <button
                onClick={() => setVisible(!visible)}
                className='p-1.5 rounded-lg hover:bg-neutral-05 transition-colors text-neutral-01 hover:text-base-black'
                aria-label={visible ? 'Hide API key' : 'Show API key'}
              >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={handleCopy}
                className='p-1.5 rounded-lg hover:bg-neutral-05 transition-colors text-neutral-01 hover:text-base-black'
                aria-label='Copy API key'
              >
                <Copy size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
