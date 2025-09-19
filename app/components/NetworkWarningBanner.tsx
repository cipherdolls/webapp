import type { FC } from 'react';
import { useState } from 'react';
import { switchToOptimismNetwork } from '~/utils/networkUtils';
import { toast } from 'sonner';

export const NetworkWarningBanner: FC = () => {
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true);
    try {
      const result = await switchToOptimismNetwork();
      if (!result.success) {
        toast.error(result.error || 'Failed to switch network');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while switching networks');
    } finally {
      setIsSwitchingNetwork(false);
    }
  };
  return (
    <div className='bg-base-white border border-neutral-04 rounded-xl p-4 mb-4'>
      <div className='flex items-start gap-3'>
        <div className='text-3xl leading-none'>⚠️</div>
        <div className='flex-1'>
          <h4 className='text-heading-h4 font-semibold text-orange-800 mb-2'>Wrong Network Detected</h4>
          <p className='text-sm text-orange-700 mb-3'>
            You need to be on the Optimism network to create token permits. Please switch your network to continue.
          </p>
          <button
            onClick={handleSwitchNetwork}
            disabled={isSwitchingNetwork}
            className='inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium'
          >
            {isSwitchingNetwork ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Switching...
              </>
            ) : (
              'Switch to Optimism'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkWarningBanner;
