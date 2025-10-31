import { Link, useRouteLoaderData } from 'react-router';
import { PICTURE_SIZE, ROUTES } from '~/constants';
import type { Chat, User } from '~/types';
import { Icons } from '../ui/icons';
import AvatarPicture from '../AvatarPicture';
import { useAvatar } from '~/hooks/queries/avatarQueries';
import { motion } from 'framer-motion';
import ChatEventsPanel from './ChatEventsPanel';
import SystemPromptModal from '../SystemPromptModal';
import { useState } from 'react';
import { Info } from 'lucide-react';
import { Tooltip } from '../ui/tooltip';
import { useChatSystemPrompt } from '~/hooks/queries/chatQueries';

interface ChatTopBarProps {
  chat: Chat;
}

const ChatTopBar: React.FC<ChatTopBarProps> = ({ chat }) => {
  const { data: avatarData } = useAvatar(chat.avatar.id);
  const user = useRouteLoaderData('routes/_main') as User;
  const [isSystemPromptModalOpen, setIsSystemPromptModalOpen] = useState(false);
  const { data: systemPromptData, refetch: refetchSystemPrompt } = useChatSystemPrompt(chat.id);

  const isAdmin = user?.role === 'ADMIN';

  const handleOpenSystemPrompt = () => {
    setIsSystemPromptModalOpen(true);
    refetchSystemPrompt();
  };

  return (
    <div className='flex items-center justify-between px-5 pt-3.5 lg:bg-white'>
      <div className='flex gap-3 items-center w-full sm:w-auto'>
        <Link to={ROUTES.chats} className='shrink-0 text-base-black lg:hidden'>
          <Icons.chevronLeft />
        </Link>
        <AvatarPicture avatar={chat.avatar} sizeType={PICTURE_SIZE.semiMedium} className='size-10 shrink-0' />
        <div className='flex-1 mr-auto sm:mr-0'>
          <h3 className='text-body-md sm:text-heading-h3 font-semibold leading-[1em] truncate'>
            {avatarData ? avatarData.name : chat.avatar.name}
          </h3>
          <p className='text-body-sm text-neutral-01'>{chat.scenario.name}</p>
        </div>
      </div>
      <div className='flex gap-3 items-center'>
        <ChatEventsPanel chatId={chat.id} />
        {isAdmin && (
          <Tooltip
            trigger={
              <button
                onClick={handleOpenSystemPrompt}
                className='text-base-black shrink-0 hover:opacity-60 transition-opacity flex items-center'
                aria-label='View System Prompt'
              >
                <Info size={20} />
              </button>
            }
            content='View System Prompt (Admin Only)'
            side='bottom'
          />
        )}
        <motion.div whileHover={{ transform: 'rotate(35deg)', opacity: 0.6 }} transition={{ duration: 0.25 }}>
          <Link to={`${ROUTES.chats}/${chat.id}/edit`} className=' text-base-black shrink-0'>
            <Icons.gear />
          </Link>
        </motion.div>
      </div>
      {isAdmin && systemPromptData && (
        <SystemPromptModal
          isOpen={isSystemPromptModalOpen}
          onClose={() => setIsSystemPromptModalOpen(false)}
          systemMessage={systemPromptData.systemPrompt}
          scenarioName={systemPromptData.scenarioName}
        />
      )}
    </div>
  );
};

export default ChatTopBar;
