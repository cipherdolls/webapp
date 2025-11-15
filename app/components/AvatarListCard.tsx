import { getPicture } from '~/utils/getPicture';
import { Link } from 'react-router';
import { ROUTES } from '~/constants';
import type { Avatar } from '~/types';
import RecommendedBadge from '~/components/ui/RecommendedBadge';
import PlayerButton from '~/components/PlayerButton';
import * as Button from '~/components/ui/button/button';
import ChatSelectionWizard from './ChatSelectionWizard';
import { PATHS } from '~/constants';


export const AvatarListCardSkeleton = ({ count = 2 }: { count?: number }) => {
  return (
    <div className='flex flex-col gap-5 pb-5 w-full'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='grid gap-3.5 grid-cols-1 sm:grid-cols-2  md:gap-5 '>
          <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[344px] sm:h-[296px] md:h-[344px] lg:h-[284px]' />
          <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[344px] sm:h-[296px] md:h-[344px] lg:h-[284px]' />
          <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[344px] sm:h-[296px] md:h-[344px] lg:h-[284px]' />
          <div className='rounded-xl bg-neutral-04 w-full animate-pulse h-[344px] sm:h-[296px] md:h-[344px] lg:h-[284px]' />
        </div>
      ))}
    </div>
  );
}

interface AvatarListCardProps {
  avatar: Avatar;
  isUsersAvatar: boolean;
}

const AvatarListCard = ({ avatar, isUsersAvatar }: AvatarListCardProps) => {
  return (
    <div className='transition-all duration-500 ease-out' key={avatar.id}>
      <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
        <Link to={`${ROUTES.avatars}/${avatar.id}`} className='block h-[200px] sm:h-[152px] md:h-[200px] rounded-xl bg-black relative'>
          <img
            src={getPicture(avatar, 'avatars', false)}
            srcSet={getPicture(avatar, 'avatars', true)}
            alt={`${avatar.name} picture`}
            className='object-cover size-full'
          />
          {isUsersAvatar && (
            <div className='absolute top-2 left-2 z-10'>
              <div className='flex items-center gap-1 bg-gradient-1 py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                🌐
                <span>By you</span>
              </div>
            </div>
          )}
          {avatar.gender === 'Female' ? (
            <div className='absolute bottom-2 left-2 z-10'>
              <div className='flex items-center gap-1 bg-[#FF85B7] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                👩🏻
                <span>Female</span>
              </div>
            </div>
          ) : avatar.gender === 'Male' ? (
            <div className='absolute bottom-2 left-2 z-10'>
              <div className='flex items-center gap-1 bg-[#069cf3] py-1 pl-1 pr-1.5 rounded-full text-label text-base-black font-semibold'>
                🧔🏻‍♂️
                <span>Male</span>
              </div>
            </div>
          ) : null}
        </Link>
        <div className='py-[18px] px-5 flex lg:items-center gap-5 justify-between flex-1 lg:flex-row flex-col'>
          <div className='flex flex-col gap-1 flex-1 min-w-0 overflow-hidden'>
            <div className='flex items-center gap-2'>
              <h4 className='truncate text-heading-h4 text-base-black'>{avatar.name}</h4>
              <RecommendedBadge recommended={avatar.recommended} tooltipText='Recommended' className='pt-1' />
            </div>
            <p className='text-body-md text-neutral-01 truncate'>{avatar.shortDesc}</p>
          </div>
          <div className='flex items-center gap-3'>
            {avatar.introductionAudio && <PlayerButton variant='secondary' audioSrc={PATHS.avatarAudio(avatar.id)} />}

            <ChatSelectionWizard mode='avatar-to-scenario' avatar={avatar}>
              <Button.Root size='sm' className='px-5'>
                Chat
              </Button.Root>
            </ChatSelectionWizard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarListCard;
