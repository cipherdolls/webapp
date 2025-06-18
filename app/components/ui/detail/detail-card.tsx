import React, { type ReactNode } from 'react';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { cn } from '~/utils/cn';
import { Icons } from '../icons';

const DetailCard = ({
  children,
  className,
  title,
  withPrice,
  copy,
  copyText = '',
  isScenario,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  withPrice?: boolean;
  copy?: boolean;
  copyText?: string;
  isScenario?: boolean;
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard();

  if (isScenario) {
    return (
      <div className={cn('bg-gradient-1 shadow-regular rounded-xl px-5 py-[18px] max-h-max relative', className)}>
        {title && (
          <div className='flex items-center justify-between mb-4'>
            {title && <h2 className='text-body-md font-semibold text-gray-800'>{title}</h2>}
            {copy && (
              <button
                onClick={() => copyToClipboard(copyText)}
                className='bg-transparent hover:bg-neutral-05 rounded-full transition-colors'
              >
                {copied ? <Icons.copied /> : <Icons.copy />}
              </button>
            )}
          </div>
        )}
        {children}
        {withPrice && (
          <span className='text-xs text-neutral-01 font-semibold flex items-center justify-end mt-3'>Prices are per million token</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-white shadow-regular rounded-xl px-5 py-[18px] max-h-max relative', className)}>
      <div className='flex items-center justify-between mb-4'>
        {title && <h2 className='text-body-md font-semibold text-gray-800'>{title}</h2>}
        {copy && (
          <button onClick={() => copyToClipboard(copyText)} className='bg-transparent hover:bg-neutral-05 rounded-full transition-colors'>
            {copied ? <Icons.copied /> : <Icons.copy />}
          </button>
        )}
      </div>
      {children}
      {withPrice && (
        <span className='text-xs text-neutral-01 font-semibold flex items-center justify-end mt-3'>Prices are per million token</span>
      )}
    </div>
  );
};

export default DetailCard;
