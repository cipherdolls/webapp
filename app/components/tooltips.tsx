import React, { useEffect, useState } from 'react';
import HappySmileIcon from '~/assets/smile/happy.png';
import EasierBetterIcon from '~/assets/smile/easier-better.png';
import MakeSenseIcon from '~/assets/smile/make-sense.png';
import CoolIcon from '~/assets/smile/cool.png';
import { clsx } from 'clsx';

type IVariant = {
  variant: string;
  title: string;
  description: string;
  Icon: string;
};

interface IProps {
  variant: 'YourInfoSaved' | 'ChangeSaved' | 'ToConsumer' | 'ToProducer' | '';
  className?: string;
}

const variantMap: Record<string, IVariant> = {
  YourInfoSaved: {
    variant: 'YourInfoSaved',
    title: 'Nice to know you better',
    description: 'Your info was saved',
    Icon: HappySmileIcon,
  },
  ToConsumer: {
    variant: 'ToConsumer',
    title: 'The easier the better',
    description: 'User type was changed to consumer',
    Icon: EasierBetterIcon,
  },
  ChangeSaved: {
    variant: 'ChangeSaved',
    title: 'Makes sense',
    description: 'The changes were saved',
    Icon: MakeSenseIcon,
  },
  ToProducer: {
    variant: 'ToProducer',
    title: 'Show me what you can',
    description: 'User type was changed to producer',
    Icon: CoolIcon,
  },
};

export const Tooltips: React.FC<IProps> = ({ variant, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [manualClose, setManualClose] = useState(false);

  const currentVariant = variantMap[variant];

  if (!currentVariant) return null;

  const handleClose = () => {
    setIsOpen(false);
    setManualClose(true);
  };

  useEffect(() => {
    if (!variant || manualClose) return;

    setIsOpen(true);

    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [variant]);

  return (
    <>
      {isOpen && variant !== '' && (
        <div
          className={clsx(
            'absolute flex items-center w-11/12 h-fit top-10 right-1/2 translate-x-1/2 px-4 py-3 justify-between md:h-16 backdrop-blur-lg bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-xl md:w-full md:translate-x-0 md:right-3 md:max-w-[368px] md:px-5 md:top-3',
            className
          )}
        >
          <div className='flex items-center gap-5'>
            <img src={currentVariant.Icon} alt={currentVariant.title} className='w-10 h-10' />

            <p className='flex flex-col text-sm'>
              <span className='font-semibold'>{currentVariant.title}</span>
              {currentVariant.description}
            </p>
          </div>

          <button onClick={handleClose} className='text-sm font-semibold cursor-pointer transition-opacity hover:opacity-70'>
            OK
          </button>
        </div>
      )}
    </>
  );
};
