import { useNavigate } from 'react-router';
import type { Route } from './+types/_main.chats.$chatId.messages.$messageId';
import * as Button from '~/components/ui/button/button';
import { Icons } from '~/components/ui/icons';
import ChatEmbeddingJobCard from '~/components/job-cards/ChatEmbeddingJobCard';
import ChatTTSJobCard from '~/components/job-cards/ChatTTSJobCard';
import ChatCompletionJobCard from '~/components/job-cards/ChatCompletionJobCard';
import ChatSTTJobCard from '~/components/job-cards/ChatSTTJobCard';
import ChatMessagePreview from '~/components/chat/ChatMessagePreview';
import { useConfirm } from '~/providers/AlertDialogProvider';
import { useDeleteMessage } from '~/hooks/queries/messageMutations';
import { useMessage } from '~/hooks/queries/messageQueries';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat Message' }];
}

export default function ChatMessage({ params }: Route.ComponentProps) {
  const { messageId, chatId } = params;
  const { data: message } = useMessage(messageId);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { mutate: deleteMessage } = useDeleteMessage(chatId);

  const handleMessageClose = () => {
    navigate(`/chats/${chatId}`);
  };

  const handleMessageDelete = async () => {
    const confirmResult = await confirm({
      icon: '🗑️',
      title: 'Delete the Message?',
      body: 'All followed messages will be deleted as well',
      actionButton: 'Yes, Delete',
    });

    if (confirmResult) {
      deleteMessage(messageId, {
        onSuccess: () => {
          navigate(`/chats/${chatId}`, { replace: true });
        },
      });
    }
  };

  return (
    <>
      <div className='pageModal'>
        <div className='pageModal-overlay' onClick={handleMessageClose}></div>
        <div className='pageModal-content'>
          {message ? (
            <>
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
            </>
          ) : (
            <p className='text-body-lg text-base-black'>Message not found</p>
          )}
        </div>
      </div>
    </>
  );
}
