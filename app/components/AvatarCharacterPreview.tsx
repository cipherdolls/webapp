import { type ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '~/utils/cn';

const AvatarCharacterPreview = ({ message }: { message: ReactNode }) => {
  const [showFull, setShowFull] = useState(false);
  const [isContentTooSmall, setIsContentTooSmall] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const maxHeight = 415;
      setIsContentTooSmall(contentHeight <= maxHeight);
    }
  }, [message]);

  const handleClick = () => {
    if (!isContentTooSmall) {
      setShowFull((prev) => !prev);
    }
  };

  return (
    <div className='relative'>
      <div
        ref={contentRef}
        className={cn(
          'bg-gradient-1 select-none p-5 flex flex-col gap-5 flex-1 text-body-md text-base-black rounded-xl overflow-hidden backdrop-blur-48',
          showFull ? 'h-auto' : 'max-h-[415px]',
          !isContentTooSmall && 'cursor-pointer'
        )}
        onClick={handleClick}
      >
        <div
          className={cn(
            'absolute inset-0 top-5 z-20 bg-linear-to-t from-[rgba(254,253,248,0.9)] to-[rgba(255,255,255,0)]',
            (showFull || isContentTooSmall) && 'hidden'
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
