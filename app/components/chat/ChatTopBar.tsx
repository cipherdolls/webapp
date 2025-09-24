import { Link } from 'react-router';
import { PICTURE_SIZE, ROUTES } from '~/constants';
import type { Chat } from '~/types';
import { Icons } from '../ui/icons';
import AvatarPicture from '../AvatarPicture';
import { useAvatar } from '~/hooks/queries/avatarQueries';
import { motion } from 'framer-motion';

interface ChatTopBarProps {
  chat: Chat;
}

const ChatTopBar: React.FC<ChatTopBarProps> = ({ chat }) => {
  const { data: avatarData } = useAvatar(chat.avatar.id);

  return (
    <div className='flex items-center justify-between px-5 py-3.5 lg:border-b lg:border-neutral-04 lg:bg-white'>
      <div className='flex gap-3 items-center w-full sm:w-auto'>
        <Link to={ROUTES.chats} className='shrink-0 text-base-black lg:hidden'>
          <Icons.chevronLeft />
        </Link>
        <AvatarPicture avatar={chat.avatar} sizeType={PICTURE_SIZE.semiMedium} className='size-10 shrink-0' />
        <div className='flex-1 mr-auto sm:mr-0'>
          <h3 className='text-body-md sm:text-heading-h3 font-semibold leading-[1em] truncate'>{avatarData ? avatarData.name : chat.avatar.name}</h3>
          <p className='text-body-sm text-neutral-01'>{chat.scenario.name}</p>
        </div>
      </div>
      {/* <ChatDestroy /> */}
      <motion.div
        className='flex gap-3 items-center'
        whileHover={{ transform: 'rotate(35deg)', opacity: 0.6 }}
        transition={{ duration: 0.25 }}
      >
        <Link to={`${ROUTES.chats}/${chat.id}/edit`} className=' text-base-black shrink-0'>
          <Icons.gear />
        </Link>
      </motion.div>
    </div>
  );
};

export default ChatTopBar;
