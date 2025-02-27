import { Form, Link } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import type { Avatar } from '~/types';
import PlayerButton from '~/components/PlayerButton';
import * as Button from '~/components/ui/button/button';

interface PublicAvatarCardProps {
  avatar: Avatar;
  isPlaying: boolean;
  onPlayButtonClick: () => void;
}

const PublicAvatarCard = ({ avatar, isPlaying, onPlayButtonClick }: PublicAvatarCardProps) => {
  return (
    <div key={avatar.id} className='bg-white rounded-xl overflow-hidden shadow-regular'>
      <Link to={`/avatars/${avatar.id}`} className='block h-[152px] sm:h-[200px] rounded-xl bg-black'>
        <img src={getPicture(avatar, 'avatars', false)} alt={`${avatar.name} picture`} className='object-cover  w-full h-full' />
      </Link>
      <div className='px-3 py-4 flex justify-between items-center gap-2 sm:px-5 md:flex-col md:items-start md:gap-5 lg:flex-row'>
        <div>
          <h4 className='text-body-lg sm:text-body-md font-semibold text-base-black mb-1'>{avatar.name}</h4>
          <p className='text-body-sm text-neutral-01'>{avatar.shortDesc}</p>
        </div>
        <div className='flex gap-2 ml-auto'>
          <PlayerButton isPlaying={isPlaying} progress={50} isLoading={false} onClick={onPlayButtonClick} />
          <Form method='post' action='/chats'>
            <input hidden name='avatarId' id='avatarId' value={avatar.id} readOnly />
            <Button.Root type='submit' size='sm' className='px-5'>Add Avatar</Button.Root>
          </Form>
          {/* TODO: Add remove avatar action*/}
          {/* <Button type='submit' variant='primary'>
            Remove
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default PublicAvatarCard;
