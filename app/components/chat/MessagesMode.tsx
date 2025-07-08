import type { AudioEvent, Avatar, Chat } from '~/types';
import ChatTopBar from '~/components/chat/ChatTopBar';
import ChatBottomBar from '~/components/chat/ChatBottomBar';
import ChatBody from '~/components/chat/ChatBody';
import { useChatEvents } from '~/hooks/useChatEvents';
import { apiUrl } from '~/constants';
import { useEffect } from 'react';
import { ChatState } from '~/components/chat/types/chatState';
import { useChatStore } from '~/store/useChatStore';
import { useShallow } from 'zustand/react/shallow';
import { useAudioPlayerContext } from 'react-use-audio-player';
import { useUnmount } from 'usehooks-ts';
import useChat from '~/hooks/useChat';

interface MessagesModeProps {
  chat: Chat;
  avatar: Avatar;
}

const MESSAGES_LIMIT = 50;

const MessagesMode = ({ chat, avatar }: MessagesModeProps) => {
  const { load, stop } = useAudioPlayerContext();
  const { silentMode, currentChatState, setCurrentChatState } = useChatStore(
    useShallow((state) => ({
      silentMode: state.silentMode,
      currentChatState: state.currentChatState,
      setCurrentChatState: state.setCurrentChatState,
    }))
  );

  const { messages, loadMessages, loadMoreMessages, isLoading, hasMore } = useChat(chat.id, { limit: MESSAGES_LIMIT });

  useEffect(() => {
    stop();
    setCurrentChatState(ChatState.Idle);
    loadMessages();
  }, [chat.id, chat._count.messages]);

  useUnmount(() => {
    stop();
  });

  useChatEvents(chat.id, {
    onProcessEvent: (event) => {
      if (event.resourceName === 'Message' && event.jobStatus === 'completed') loadMessages();
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
      <ChatBody
        messages={messages}
        loadMoreMessages={loadMoreMessages}
        isLoading={isLoading}
        hasMore={hasMore}
        messagesLimit={MESSAGES_LIMIT}
      />
      {/* chat input field  */}
      <ChatBottomBar chat={chat} />
    </div>
  );
};

export default MessagesMode;
