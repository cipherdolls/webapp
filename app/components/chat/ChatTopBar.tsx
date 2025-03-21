import { Link } from 'react-router';
import { PATHS, PICTURE_SIZE } from '~/constants';
import type { Chat } from '~/types';
import PlayerButton from '../PlayerButton';
import { Icons } from '../ui/icons';
import AvatarPicture from '../AvatarPicture';
import { Modal } from '~/components/ui/Modal';
import ScenarioToggle from '../ScenarioToggle';

interface ChatTopBarProps {
  chat: Chat;
}

const ChatTopBar: React.FC<ChatTopBarProps> = ({ chat }) => {

  return (
    <div className='flex items-center justify-between px-5 py-3.5 lg:border-b lg:border-neutral-04 lg:bg-white'>
      <div className='flex gap-3 items-center w-full sm:w-auto'>
        <Link to={`/chats/`} className='shrink-0 text-base-black lg:hidden'>
          <Icons.chevronLeft />
        </Link>
        <Link to={`/chats/${chat.id}/edit`} className='inline-flex items-center gap-4'>
          <AvatarPicture avatar={chat.avatar} sizeType={PICTURE_SIZE.semiMedium} className='size-10 shrink-0' />
        </Link>
        <div className='flex-1 mr-auto sm:mr-0'>
          <h3 className='text-body-md sm:text-heading-h3 font-semibold leading-[1.2em] truncate'>{chat.avatar.name}</h3>
          <div className='sm:hidden'>
            <Modal.Root>
              <Modal.Trigger className='flex whitespace-nowrap'>
                {chat.scenario.name} <Icons.chevronDown />
              </Modal.Trigger>
              <Modal.Content title='Avatars'>
                <ScenarioToggle chat={chat} />
              </Modal.Content>
            </Modal.Root>
          </div>
        </div>

        <PlayerButton audioSrc={PATHS.ttsVoice(chat.avatar.ttsVoiceId)} variant='ghost' />
        <button className='md:hidden'>
          <Icons.info className='size-6 text-base-black' />
        </button>
      </div>
      {/* <ChatDestroy /> */}
      <ScenarioToggle  chat={chat} className='max-sm:hidden w-[368px]' />
    </div>
  );
};

export default ChatTopBar;
