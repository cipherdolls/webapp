import { type ReactNode, useState } from 'react';
import { cn } from '~/utils/cn';

const AvatarCharacterPreview = ({ message }: { message: ReactNode }) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className='relative'>
      <div
        className={cn(
          'bg-gradient-1 select-none p-5 flex flex-col gap-5 flex-1 max-h-max text-body-md text-base-black min-h-[415px] h-[415px] rounded-xl overflow-hidden  backdrop-blur-48 cursor-pointer',
          showFull && 'h-auto'
        )}
        onClick={() => setShowFull((prev) => !prev)}
      >
        <div
          className={cn(
            'absolute inset-0 top-5 z-20 bg-linear-to-t from-[rgba(254,253,248,1)] to-[rgba(255,255,255,0)]',
            showFull && 'hidden'
          )}
        ></div>
        {/*<div className='flex items-center justify-between'>*/}
        {/*  <h3 className='text-heading-h4 sm:text-heading-h3 text-base-black'>Characteristic</h3>*/}
        {/*  <div className='flex items-center gap-2'>*/}
        {/*    {copied && <span className='text-body-sm font-semibold text-base-black'>Copied</span>}*/}
        {/*    <button onClick={handleCopyToClipboard} title='Copy to clipboard' className='hover:opacity-80 transition-opacity'>*/}
        {/*      {copied ? <Icons.copied /> : <Icons.copy />}*/}
        {/*    </button>*/}
        {/*  </div>*/}
        {/*</div>*/}

        {message}
      </div>
    </div>
  );
};

export default AvatarCharacterPreview;
