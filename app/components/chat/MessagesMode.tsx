import type { AudioEvent, Avatar, Chat, Message } from '~/types';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { useChatEvents } from '~/hooks/useChatEvents';
import { apiUrl } from '~/constants';
import { useEffect } from 'react';
import type { ChatJobType } from '~/components/chat/types/chatState';
import { ChatJob, ChatState } from '~/components/chat/types/chatState';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { useUnmount } from 'usehooks-ts';

interface MessagesModeProps {
  chat: Chat;
  avatar: Avatar;
  messages: Message[];
}

const MessagesMode = ({ chat, avatar, messages }: MessagesModeProps) => {
  
  const { load, stop } = useAudioPlayerContext();

  const { silentMode, setCurrentJob, initChatStore, currentChatState, setCurrentChatState } = useChatStore(
    useShallow((state) => ({
      talkMode: state.talkMode,
      silentMode: state.silentMode,
      setCurrentJob: state.setCurrentJob,
      initChatStore: state.initChatStore,
      currentChatState: state.currentChatState,
      setCurrentChatState: state.setCurrentChatState,
    }))
  );

  useEffect(() => {
    initChatStore();
    stop();
  }, [chat.id]);

  useUnmount(() => {
    stop();
  });

  useChatEvents({
    chatId: chat.id,
    onProcessEvent: (event) => {
      // checking if a job exist in a chat jobs enum
      const isValidJob = (state: string): state is ChatJobType => state in ChatJob;
      if (isValidJob(event.resourceName)) {
        setCurrentJob(event.jobStatus === 'active' ? event.resourceName : null);
      }
    },
    onActionEvent: (event) => {
      if (event && event.type === 'audio' && event.action === 'play') handlePlayAudioMessage(event as AudioEvent);
    },
  });



  useEffect(() => {
    if (silentMode && currentChatState === ChatState.avatarSpeaking) {
      stop();
      setCurrentChatState(ChatState.Idle);
    }
  }, [silentMode]);

  const handlePlayAudioMessage = (event: AudioEvent) => {
    if (!silentMode && event.type === 'audio' && event.action === 'play') {
      setCurrentChatState(ChatState.avatarSpeaking);

      load(`${apiUrl}/messages/${event.messageId}/audio`, {
        format: 'mp3',
        html5: true,
        autoplay: true,
        onend: () => {
          setCurrentChatState(ChatState.Idle);
        },
      });
    }
  };

  return (
    <div className='fixed inset-0 lg:static bg-main-gradient lg:bg-transparent flex-1 flex flex-col shadow-top overflow-hidden md:rounded-xl'>
      {/* chat header */}
      <ChatTopBar chat={chat} avatar={avatar} />
      {/* chat messages scroll */}
      <ChatBody messages={messages} />
      {/* chat input field  */}
      <ChatBottomBar chat={chat} />
    </div>
  );
};

export default MessagesMode;
