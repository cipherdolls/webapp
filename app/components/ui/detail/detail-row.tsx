import React from 'react';

const DetailRow = ({ title, value }: { title: string; value: string | number }) => {
  return (
    <div className='flex items-center justify-between gap-4'>
      <span className='text-body-sm text-neutral-01'>{title}</span>
      <span className='text-body-sm font-semibold text-base-black text-right'>{value}</span>
    </div>
  );
};

export default DetailRow;
