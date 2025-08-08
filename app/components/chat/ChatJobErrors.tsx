import React, { useRef } from 'react';
import { ChatJob } from '~/components/chat/types/chatState';
import type { Chat, ProcessEvent } from '~/types';
import { API_ENDPOINTS } from '~/constants';
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import { useAlert } from '~/providers/AlertDialogProvider';
import { useNavigate } from 'react-router';
import { useChatEvents } from '~/hooks/useChatEvents';

const ChatJobErrors = ({ chat }: { chat: Chat }) => {
  const alert = useAlert();
  const navigate = useNavigate();

  const countsRef = useRef(new Map<string, number>());

  const shouldAlert = (e: ProcessEvent) => {
    const key = `${e.resourceName}:${e.resourceId}`;
    const n = (countsRef.current.get(key) ?? 0) + 1;
    countsRef.current.set(key, n);
    if (n < 3) return false; // only alert on 3rd failure
    countsRef.current.delete(key); // reset after alert (optional)
    return true;
  };

  useChatEvents(chat.id || '', {
    onProcessEvent: async (event) => {
      
      if (event.jobStatus === 'failed') {
        console.log('event', event);
        if (shouldAlert(event)) {
          console.log('shouldAlert', event);
          void handleJobError(event);
        }
      }
    },
    enabled: !!chat.id,
  });

  const handleJobError = async (event: ProcessEvent) => {
    const cfg: {
      icon: string;
      title: string;
      body: string | React.ReactNode;
      endpoint: string | null;
      actionButton?: { label: string; action: () => void };
    } = {
      icon: '❗️',
      title: 'Unknown job error',
      body: 'Something went wrong…',
      endpoint: null,
    };

    switch (event.resourceName) {
      case ChatJob.ChatCompletionJob:
        Object.assign(cfg, {
          icon: '🧩🚫',
          title: 'Chat Completion Job Error',
          body: 'Something went wrong during ChatCompletionJob.',
          endpoint: API_ENDPOINTS.chatCompletionJob(event.resourceId),
        });
        break;

      case ChatJob.TtsJob:
        Object.assign(cfg, {
          icon: '👄🚫',
          title: 'TTS Job Error',
          body: 'Text-to-speech task aborted. Please try again later.',
          endpoint: API_ENDPOINTS.ttsJob(event.resourceId),
        });
        break;

      case ChatJob.SttJob:
        Object.assign(cfg, {
          icon: '👂🚫',
          title: 'STT Job Error',
          body: 'Speech-to-text task aborted. Try changing the provider.',
          endpoint: API_ENDPOINTS.sttJob(event.resourceId),
          actionButton: {
            label: 'Change provider',
            action: () => navigate(`/chats/${chat.id}/edit`),
          },
        });
        break;

      case ChatJob.EmbeddingJob:
        Object.assign(cfg, {
          icon: '🔢🚫',
          title: 'Embedding Job Error',
          body: <p className='bg-neutral-05 rounded-xl p-4'>Something went wrong during Embedding Job.</p>,
          endpoint: API_ENDPOINTS.embeddingJob(event.resourceId),
        });
        break;

      case ChatJob.PaymentJob:
        Object.assign(cfg, {
          icon: '💵🚫',
          title: 'Payment Job Error',
          body: 'Failed to process the transaction, please check your balance.',
          // endpoint: API_ENDPOINTS.paymentJob(event.resourceId),
        });
        break;

      default:
        console.warn('handleJobError: unhandled resourceName:', event.resourceName);
        return;
    }

    // getting job error details
    if (cfg.endpoint) {
      try {
        const res = await fetchWithAuth(cfg.endpoint);
        if (res.ok) {
          const job = await res.json();
          cfg.body = job.error || cfg.body;
        }
      } catch (e) {
        console.error('Failed to fetch job details', e);
      }
    }

    alert({
      icon: cfg.icon,
      title: cfg.title,
      body: cfg.body,
      cancelButton: 'Close',
      actionButton: cfg.actionButton,
    });
  };

  return null;
};

export default ChatJobErrors;
