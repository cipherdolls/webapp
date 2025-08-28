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
import React from 'react';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chat Message' }];
}

function ChatMessageSkeleton() {
  return (
    <div className='flex flex-col justify-between h-full pb-5 pt-[26px] animate-pulse'>
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-6'>
          <div className='w-36 h-6 bg-neutral-04 rounded-[10px]' />
          <div className='shrink-0 bg-neutral-04  px-10 py-6 min-h-[140px] h-[140px] rounded-xl overflow-hidden' />
        </div>

        <div className='flex flex-col gap-6'>
          <div className='w-48 h-6 bg-neutral-04 rounded-[10px]' />
          <div className='shrink-0 bg-neutral-04  px-10 py-6 min-h-[278px] h-[278px] rounded-xl overflow-hidden' />
        </div>

        <div className='flex flex-col gap-6'>
          <div className='w-40 h-6 bg-neutral-04 rounded-[10px]' />
          <div className='shrink-0 bg-neutral-04  px-10 py-6 min-h-[278px] h-[278px] rounded-xl overflow-hidden' />
        </div>
      </div>

      <div className='rounded-full h-12 w-full bg-neutral-04' />
    </div>
  );
}

export default function ChatMessage({ params }: Route.ComponentProps) {
  const { messageId, chatId } = params;
  const { data: message, isLoading: isMessageLoading } = useMessage(messageId);
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
          <Button.Root
            size='icon'
            variant='white'
            className='pageModal-button-close transition-colors hover:bg-white/80'
            onClick={handleMessageClose}
          >
            <Button.Icon as={Icons.close} />
          </Button.Root>

          {message && !isMessageLoading ? (
            <>
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
            <ChatMessageSkeleton />
          )}

          {!isMessageLoading && !message && (
            <>
              <div className='flex flex-col h-full items-center justify-center gap-6'>
                <h1 className='text-heading-h1'>🤷‍♀️</h1>
                <div className='flex items-center flex-col gap-2'>
                  <h4 className='text-heading-h4 text-base-black text-center'>Message Not Found</h4>

                  <p className='justify-center max-w-72 text-body-md text-neutral-01 text-center'>
                    We were unable to load this message, it may have been deleted
                  </p>
                </div>
                <Button.Root onClick={handleMessageClose} variant='primary' className='w-fit px-10 sm:hidden'>
                  Go Back
                </Button.Root>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
