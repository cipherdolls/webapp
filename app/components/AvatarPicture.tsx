import { PICTURE_SIZE } from '~/constants';
import type { Avatar } from '~/types';
import { cn } from '~/utils/cn';
import { getPicture } from '~/utils/getPicture';

export interface AvatarPictureProps {
  avatar: Avatar;
  sizeType?: string;
  className?: string;
}

const AvatarPicture: React.FC<AvatarPictureProps> = ({ avatar, sizeType = PICTURE_SIZE.semiMedium, className }) => {
  return (
    <div className={cn('size-12 shrink-0', className)}>
      <img
        src={getPicture(avatar, 'avatars', false, sizeType)}
        srcSet={getPicture(avatar, 'avatars', true, sizeType)}
        alt={avatar.name}
        className='size-full object-cover rounded-full'
      />
    </div>
  );
};

export default AvatarPicture;
