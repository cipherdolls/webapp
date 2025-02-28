import { Form, Link } from 'react-router';
import { getPicture } from '~/utils/getPicture';
import type { Avatar } from '~/types';
import PlayerButton from '~/components/PlayerButton';
import * as Button from '~/components/ui/button/button';

interface PublicAvatarCardProps {
  avatar: Avatar;
  // onPlayButtonClick: (audio: HTMLAudioElement) => void;
}

const PublicAvatarCard = ({ avatar }: PublicAvatarCardProps) => {
  return (
    <div className='bg-white rounded-xl overflow-hidden shadow-regular'>
      <Link to={`/avatars/${avatar.id}`} className='block h-[152px] sm:h-[200px] rounded-xl bg-black'>
        <img
          src={getPicture(avatar, 'avatars', false)}
          srcSet={getPicture(avatar, 'avatars', true)}
          alt={`${avatar.name} picture`}
          className='object-cover size-full'
        />
      </Link>
      <div className='px-3 py-4 flex justify-between items-center gap-2 sm:px-5 sm:flex-col sm:items-start sm:gap-5 lg:flex-row'>
        <div>
          <h4 className='text-body-lg sm:text-body-md font-semibold text-base-black mb-1'>{avatar.name}</h4>
          <p className='text-body-sm text-neutral-01'>{avatar.shortDesc}</p>
        </div>
        <div className='flex gap-2 ml-auto'>
          <PlayerButton
            audioSrc={`https://api.cipherdolls.com/tts-voices/${avatar.ttsVoiceId}/audio`}
            // onPay={onPlayButtonClick}
          />
          <Form method='post' action='/chats'>
            <input hidden name='avatarId' id='avatarId' value={avatar.id} readOnly />
            <Button.Root type='submit' size='sm' className='px-5'>
              Add Avatar
            </Button.Root>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default PublicAvatarCard;
