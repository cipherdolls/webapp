import React from 'react';
import { formatDayMonth } from '~/utils/date.utils';

const ChatDateDivider = ({ date }: { date: Date }) => {
  return (
    <div className='relative my-6 flex justify-center text-heading-h1 before:content-[""] before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2 before:bg-neutral-04 before:h-[1px]'>
      <div className='relative z-10 text-xs leading-none font-semibold text-neutral-01 border border-neutral-04 px-3 py-2 rounded-full bg-white'>
        {formatDayMonth(date)}
      </div>
    </div>
  );
};

export default ChatDateDivider;
