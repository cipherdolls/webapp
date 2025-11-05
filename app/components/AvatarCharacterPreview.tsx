import { motion } from 'motion/react';
import React, { type ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '~/utils/cn';
import { ANIMATE_DURATION } from '~/constants';
import * as Button from '~/components/ui/button/button';

const AvatarCharacterPreview = ({ message }: { message: ReactNode }) => {
  const [showFull, setShowFull] = useState(false);
  const [isShouldShowButton, setIsShouldShowButton] = useState(false);
  const [isContentTooSmall, setIsContentTooSmall] = useState(true);
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
      <motion.div
        onHoverStart={!isContentTooSmall ? () => setIsShouldShowButton(true) : undefined}
        onHoverEnd={!isContentTooSmall ? () => setIsShouldShowButton(false) : undefined}
        initial={true}
        animate={!isContentTooSmall ? { height: contentRef.current && !showFull ? 415 : 'auto', minHeight: 415 } : { height: 'auto' }}
        transition={{ duration: showFull ? 0.5 : 0 }}
        ref={contentRef}
        onClick={handleClick}
        className={cn(
          'bg-gradient-1 group select-none p-5 flex flex-col gap-5 flex-1 text-body-md text-base-black rounded-xl overflow-hidden backdrop-blur-48',
          !isContentTooSmall && 'cursor-pointer'
        )}
      >
        <motion.div
          initial={false}
          animate={{ opacity: !showFull ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className='absolute inset-0 top-5 z-20 bg-linear-to-t from-[rgba(254,253,248,0.9)] to-[rgba(255,255,255,0)]'
        />
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

        <motion.div
          initial={false}
          animate={{ transform: !showFull && isShouldShowButton ? 'translateY(0%)' : 'translateY(120%)'}}
          transition={ANIMATE_DURATION}
          className={cn('absolute bottom-2 left-1/2 -translate-x-1/2 z-50 h-10')}
        >
          <Button.Root size={'sm'} className='w-[110px]'>
            Show full
          </Button.Root>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AvatarCharacterPreview;
