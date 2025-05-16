import React, { type ReactNode } from 'react';
import { cn } from '~/utils/cn';

const DetailCard = ({
  children,
  className,
  title,
  withPrice,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  withPrice?: boolean;
}) => {
  return (
    <div className={cn('bg-white shadow-regular rounded-xl px-5 py-[18px] max-h-max relative', className)}>
      {title && <h2 className='text-body-md font-semibold mb-4 text-gray-800'>{title}</h2>}
      {children}
      {withPrice && (
        <span className='text-xs text-neutral-01 font-semibold flex items-center justify-end mt-3'>Prices are per million token</span>
      )}
    </div>
  );
};

export default DetailCard;
