import { Link } from 'react-router';
import { PICTURE_SIZE } from '~/constants';
import type { Avatar } from '~/types';
import { getPicture } from '~/utils/getPicture';

export const AvatarCard = ({ avatar }: { avatar: Avatar }) => {
  const { name, shortDesc, id } = avatar;

  return (
    <Link to={`/avatars/${id}`} className='lg:p-4 sm:p-3.5 p-3 flex items-center justify-between gap-4 sm:gap-4.5 flex-wrap'>
      <div className='sm:gap-4.5 gap-4 flex items-center'>
        <div className='shrink-0'>
          <img
            src={getPicture(avatar, 'avatars', false, PICTURE_SIZE.avatar)}
            srcSet={getPicture(avatar, 'avatars', true, PICTURE_SIZE.avatar)}
            alt={name}
            className='lg:size-20 sm:size-16 size-14 rounded-full'
          />
        </div>
        <div className='flex flex-1 gap-0.5 flex-col'>
          <h4 className='text-base-black sm:text-heading-h4 text-body-lg font-semibold'>{name}</h4>
          <p className='sm:text-body-md text-body-sm text-neutral-01'>{shortDesc}</p>
        </div>
      </div>
      <button className='bg-base-black rounded-full py-3 sm:py-2.5 text-body-sm sm:text-body-md font-semibold text-base-white sm:px-6 px-5'>
        Chat
      </button>
    </Link>
  );
};
