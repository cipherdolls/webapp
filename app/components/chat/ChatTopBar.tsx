import { Link } from 'react-router';
import { PICTURE_SIZE } from '~/constants';
import type { Avatar, Chat } from '~/types';
import { Icons } from '../ui/icons';
import AvatarPicture from '../AvatarPicture';
import { Modal } from '~/components/ui/Modal';
import ScenarioToggle from '../ScenarioToggle';

interface ChatTopBarProps {
  chat: Chat;
  avatar: Avatar;
}

const ChatTopBar: React.FC<ChatTopBarProps> = ({ chat, avatar }) => {
  return (
    <div className='flex items-center justify-between px-5 py-3.5 lg:border-b lg:border-neutral-04 lg:bg-white'>
      <div className='flex gap-3 items-center w-full sm:w-auto'>
        <Link to={`/chats/`} className='shrink-0 text-base-black lg:hidden'>
          <Icons.chevronLeft />
        </Link>
        <AvatarPicture avatar={chat.avatar} sizeType={PICTURE_SIZE.semiMedium} className='size-10 shrink-0' />
        <div className='flex-1 mr-auto sm:mr-0'>
          <h3 className='text-body-md sm:text-heading-h3 font-semibold leading-[1em] truncate'>{chat.avatar.name}</h3>
          <div className='sm:hidden'>
            <Modal.Root>
              <Modal.Trigger className='flex whitespace-nowrap'>
                {chat.scenario.name} <Icons.chevronDown />
              </Modal.Trigger>
              <Modal.Content title='Avatars'>
                <ScenarioToggle chat={chat} avatar={avatar} />
              </Modal.Content>
            </Modal.Root>
          </div>
        </div>
      </div>
      {/* <ChatDestroy /> */}
      <div className='flex gap-3 items-center'>
        <ScenarioToggle chat={chat} avatar={avatar} className='max-md:hidden' wideVariant={true} />
        <Link to={`/chats/${chat.id}/edit`} className=' text-base-black shrink-0'>
          <Icons.gear />
        </Link>
      </div>
    </div>
  );
};

export default ChatTopBar;
