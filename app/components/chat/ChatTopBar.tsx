import { Link } from 'react-router';
import { PICTURE_SIZE, ROUTES } from '~/constants';
import type { Chat } from '~/types';
import { Icons } from '../ui/icons';
import AvatarPicture from '../AvatarPicture';
import { useAvatar } from '~/hooks/queries/avatarQueries';
import { AnimatePresence, motion } from 'framer-motion';
import ChatEventsPanel from './ChatEventsPanel';
import SystemPromptModal from '../SystemPromptModal';
import { useState } from 'react';
import { Info, Volume2, VolumeOff } from 'lucide-react';
import { useUpdateChat } from '~/hooks/queries/chatMutations';
import { Tooltip } from '../ui/tooltip';
import { useChatSystemPrompt } from '~/hooks/queries/chatQueries';
import { getPicture } from '~/utils/getPicture';

interface ChatTopBarProps {
  chat: Chat;
}

const ChatTopBar: React.FC<ChatTopBarProps> = ({ chat }) => {
  const { data: avatarData } = useAvatar(chat.avatar.id);

  const [isSystemPromptModalOpen, setIsSystemPromptModalOpen] = useState(false);
  const { data: systemPromptData, isLoading: isLoadingSystemPrompt } = useChatSystemPrompt(chat.id);

  const { mutate: updateChat } = useUpdateChat();


  const systemPrompt = systemPromptData?.systemPrompt ?? '';
  const scenarioName = systemPromptData?.scenarioName ?? chat.scenario.name;
  const isSystemPromptAvailable = !!systemPromptData;

  const handleOpenSystemPrompt = () => {
    setIsSystemPromptModalOpen(true);
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
      <div className='overflow-hidden'>
        <AnimatePresence>
          {chat.action && chat.action !== 'Nothing' && (
            <motion.span
              key={chat.action}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='block text-xs text-neutral-01 font-medium bg-neutral-05 rounded-full px-3 py-1'
            >
              {{ Init: 'Initialising', RefreshSystemPrompt: 'Refreshing Prompt', Summarize: 'Summarising' }[chat.action] ?? chat.action}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {chat.doll && (
        <div className='flex items-center gap-2'>
          {chat.doll.picture ? (
            <img
              src={getPicture(chat.doll, 'dolls', false, PICTURE_SIZE.smallest)}
              srcSet={getPicture(chat.doll, 'dolls', true, PICTURE_SIZE.smallest)}
              alt={chat.doll.name || 'Doll'}
              className='size-8 rounded-full object-cover shrink-0'
            />
          ) : chat.doll.dollBody?.picture ? (
            <img
              src={getPicture(chat.doll.dollBody, 'doll-bodies', false, PICTURE_SIZE.smallest)}
              srcSet={getPicture(chat.doll.dollBody, 'doll-bodies', true, PICTURE_SIZE.smallest)}
              alt={chat.doll.dollBody.name || 'Doll Body'}
              className='size-8 rounded-full object-cover shrink-0'
            />
          ) : (
            <div className='size-8 rounded-full bg-neutral-04 flex items-center justify-center shrink-0'>
              <Icons.fileUploadIcon className='size-4' />
            </div>
          )}
          <div className='hidden sm:flex items-center gap-1.5'>
            <span className={`size-2 rounded-full shrink-0 ${chat.doll.online ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className='text-body-sm text-neutral-01 truncate max-w-[100px]'>{chat.doll.name || chat.doll.dollBody?.name || chat.doll.macAddress}</span>
          </div>
        </div>
      )}
      <div className='flex gap-3 items-center'>
        <Tooltip
          trigger={
            <button
              onClick={handleOpenSystemPrompt}
              className='text-base-black shrink-0 hover:opacity-60 transition-opacity flex items-center'
              aria-label='View System Prompt'
            >
              <Info size={23} />
            </button>
          }
          content='View System Prompt'
          side='left'
        />
        <Tooltip
          trigger={
            <button
              onClick={() => updateChat({ chatId: chat.id, data: { tts: !chat.tts, avatarId: chat.avatar.id, scenarioId: chat.scenario.id } })}
              className='text-base-black shrink-0 hover:opacity-60 transition-opacity flex items-center'
              aria-label={chat.tts ? 'Disable TTS' : 'Enable TTS'}
            >
              {chat.tts ? <Volume2 size={23} /> : <VolumeOff size={23} />}
            </button>
          }
          content={chat.tts ? 'Disable TTS' : 'Enable TTS'}
          side='left'
        />
        <motion.div whileHover={{ transform: 'rotate(35deg)', opacity: 0.6 }} transition={{ duration: 0.25 }}>
          <Link to={`${ROUTES.chats}/${chat.id}/edit`} className=' text-base-black shrink-0'>
            <Icons.gear />
          </Link>
        </motion.div>
      </div>
      <SystemPromptModal
        isOpen={isSystemPromptModalOpen}
        onClose={() => setIsSystemPromptModalOpen(false)}
        systemMessage={systemPrompt}
        scenarioName={scenarioName}
        isLoadingSystemPrompt={isLoadingSystemPrompt}
        isSystemPromptAvailable={isSystemPromptAvailable}
        onRefresh={() => updateChat({ chatId: chat.id, data: { action: 'RefreshSystemPrompt', avatarId: chat.avatar.id, scenarioId: chat.scenario.id } })}
      />
    </div>
  );
};

export default ChatTopBar;
