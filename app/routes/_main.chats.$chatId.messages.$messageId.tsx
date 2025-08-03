import { useNavigate } from 'react-router';
import type { Message } from '~/types';
import type { Route } from './+types/_main.chats.$chatId.messages.$messageId';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import ChatEmbeddingJobCard from '~/components/job-cards/ChatEmbeddingJobCard';
import ChatTTSJobCard from '~/components/job-cards/ChatTTSJobCard';
import ChatCompletionJobCard from '~/components/job-cards/ChatCompletionJobCard';
import ChatSTTJobCard from '~/components/job-cards/ChatSTTJobCard';
import ChatMessagePreview from '~/components/chat/ChatMessagePreview';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useDeleteMessage } from '~/hooks/queries/messageMutations';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat Message' }];
}

export async function clientLoader({ params }: Route.LoaderArgs) {
  const { messageId } = params;
  const res = await fetchWithAuth(`messages/${messageId}`);
  return await res.json();
}

export default function ChatMessage({ loaderData , params}: Route.ComponentProps) {
  const message: Message = loaderData;
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { mutate: deleteMessage } = useDeleteMessage(message.chatId);

  const handleMessageClose = () => {
    navigate(`/chats/${message.chatId}`);
  };

  const handleMessageDelete = async () => {
    const confirmResult = await confirm({
      icon: '🗑️',
      title: 'Delete the Message?',
      body: 'All followed messages will be deleted as well',
      actionButton: 'Yes, Delete',
    });

    if (confirmResult) {
      deleteMessage(message.id, {
        onSuccess: () => {
          navigate(`/chats/${message.chatId}`, { replace: true });
        },
      });
    }
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
          </div>
          {/* page modal body */}
          <div className='-mx-3 px-3 pb-5 flex-1 flex flex-col gap-8 overflow-auto scrollbar-medium '>
            {/* chat bubble */}
            <ChatMessagePreview message={message} />
            {/* TTS Job */}
            {message.ttsJob && <ChatTTSJobCard message={message} />}
            {/* embedding job */}
            {message.embeddingJob && <ChatEmbeddingJobCard message={message} />}
            {/* stt job */}
            {message.sttJob && <ChatSTTJobCard message={message} />}
            {/* chat completion job */}
            {message.chatCompletionJob && <ChatCompletionJobCard message={message} />}

            <div className='mt-auto pt-10'>
              <Button.Root type='button' variant='danger' className='w-full px-10' onClick={handleMessageDelete}>
                Delete Message
              </Button.Root>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
