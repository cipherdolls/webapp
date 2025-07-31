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

const MessagesMode = ({ chat, avatar }: MessagesModeProps) => {
  const { load, stop } = useAudioPlayerContext();
  const { silentMode, currentChatState, setCurrentChatState } = useChatStore(
    useShallow((state) => ({
      silentMode: state.silentMode,
      currentChatState: state.currentChatState,
      setCurrentChatState: state.setCurrentChatState,
    }))
  );

  const { messages, loadMessages, loadMoreMessages, newMessage, deleteMessage, updateMessage, isLoading, hasMore } = useChat(chat.id);

  useEffect(() => {
    stop();
    loadMessages();
  }, [chat.id]);

  useUnmount(() => {
    stop();
  });

  useChatEvents(chat.id, {
    onProcessEvent: (event) => {
      if (event.resourceName === 'Message') {
        switch (event.jobName) {
          case 'created':
            if (event.jobStatus === 'completed') newMessage(event.resourceId);
            break;
          case 'updated':
            const messageContent = event?.resourceAttributes?.content;
            if (!messageContent) return;
            updateMessage(event.resourceId, messageContent);
            break;
          case 'deleted':
            deleteMessage(event.resourceId);
            break;
          default:
        }
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
      <ChatTopBar chat={chat} />
      {/* chat messages scroll */}
      <ChatBody messages={messages} loadMoreMessages={loadMoreMessages} isLoading={isLoading} hasMore={hasMore} />
      {/* chat input field  */}
      <ChatBottomBar chat={chat} />
    </div>
  );
};

export default MessagesMode;
