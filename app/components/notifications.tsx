import React, { useState } from 'react';
import HappySmileIcon from '~/assets/smile/happy.png';
import EasierBetterIcon from '~/assets/smile/easier-better.png';
import MakeSenseIcon from '~/assets/smile/make-sense.png';
import CoolIcon from '~/assets/smile/cool.png';

interface IProps {
  className?: string;
}

const variant = [
  {
    id: 1,
    title: 'Nice to know you better',
    description: 'Your info was saved',
    Icon: HappySmileIcon,
  },
  {
    id: 2,
    title: 'The easier the better',
    description: 'User type was changed to consumer',
    Icon: EasierBetterIcon,
  },
  {
    id: 3,
    title: 'Makes sense',
    description: 'The changes was saved',
    Icon: MakeSenseIcon,
  },
  {
    id: 4,
    title: 'Show me what you can',
    description: 'User type was changed to producer',
    Icon: CoolIcon,
  },
];

export const Notifications: React.FC<IProps> = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {isOpen &&
        variant.map(({ title, description, Icon }) => (
          <div className='absolute flex items-center w-11/12 h-fit top-10 right-1/2 translate-x-1/2 px-4 py-3 justify-between md:h-16 backdrop-blur-lg bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] rounded-xl md:w-full md:translate-x-0 md:right-3 md:max-w-[368px] md:px-5 md:top-3'>
            <div className='flex items-center gap-5'>
              <img src={Icon} alt={'Happy Smile Icon'} className='w-10 h-10' />

              <p className='flex flex-col text-sm'>
                <span className='font-semibold'>{title}</span>
                {description}
              </p>
            </div>

            <span onClick={() => setIsOpen(false)} className='text-sm font-semibold cursor-pointer transition-opacity hover:opacity-70'>
              OK
            </span>
          </div>
        ))}
    </>
  );
};
