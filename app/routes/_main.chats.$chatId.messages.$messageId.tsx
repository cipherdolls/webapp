import { useNavigate } from 'react-router';
import type { Message } from '~/types';
import type { Route } from './+types/_main.chats.$chatId.messages.$messageId';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import { ChatBubble } from '~/components/chat/ui/ChatBubble';
import ChatEmbeddingJobCard from '~/components/job-cards/ChatEmbeddingJobCard';
import ChatTTSJobCard from '~/components/job-cards/ChatTTSJobCard';
import ChatCompletionJobCard from '~/components/job-cards/ChatCompletionJobCard';
import ChatSTTJobCard from '~/components/job-cards/ChatSTTJobCard';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat Message' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { messageId } = params;
  const res = await fetchWithAuth(`messages/${messageId}`);
  return await res.json();
}

export default function ChatMessage({ loaderData }: Route.ComponentProps) {
  const message: Message = loaderData;
  const navigate = useNavigate();

  const handleMessageClose = () => {
    navigate(`/chats/${message.chat.id}`);
  };

  return (
    <>
      <div className='pageModal'>
        <div className='pageModal-overlay' onClick={handleMessageClose}></div>
        <div className='pageModal-content'>
          <Button.Root size='icon' variant='white' className='pageModal-button-close' onClick={handleMessageClose}>
            <Button.Icon as={Icons.close} />
          </Button.Root>
          {/* page modal header */}
          <div className='pageModal-header'>
            <button onClick={handleMessageClose} className='md:hidden'>
              <Icons.chevronLeft />
            </button>
            <h3 className='text-heading-h3 text-base-black'>
              {message.role === 'SYSTEM' ? 'System' : message.role === 'USER' ? 'Your' : 'Avatar’s'} Message
            </h3>
            <Button.Root size='icon' variant='ghost' className='ml-auto hover:bg-transparent'>
              <Button.Icon as={Icons.more} />
            </Button.Root>
          </div>
          {/* page modal body */}
          <div className='-mx-3 px-3 flex-1 flex flex-col gap-8 overflow-auto scrollbar-medium pb-5'>
            {/* chat bubble */}

            <div className='shrink-0 px-10 pt-6 h-[140px] rounded-xl relative overflow-hidden bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56)_100%)] backdrop-blur-48'>
              <ChatBubble.Root>
                <ChatBubble.Message className='!max-w-full w-full'>
                  <ChatBubble.Text>{message.content}</ChatBubble.Text>
                  {message.role !== 'SYSTEM' && <ChatBubble.Timestamp time={message.createdAt} />}
                </ChatBubble.Message>
              </ChatBubble.Root>
              {/* // sound button */}
              <Button.Root size='icon' variant='white' className='absolute left-1/2 bottom-4 -translate-x-1/2'>
                <Button.Icon as={Icons.sound} />
              </Button.Root>
            </div>

            {/* TTS Job */}
            {message.ttsJob && <ChatTTSJobCard message={message} />}
            {/* embedding job */}
            {message.embeddingJob && <ChatEmbeddingJobCard message={message} />}
            {/* stt job */}
            {message.sttJob && <ChatSTTJobCard message={message} />}
            {/* chat completion job */}
            {message.chatCompletionJob && <ChatCompletionJobCard message={message} />}
          </div>
        </div>
      </div>
    </>
  );
}
