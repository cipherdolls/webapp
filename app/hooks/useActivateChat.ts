import { useEffect, useRef } from 'react';
import { useUpdateChat } from '~/hooks/queries/chatMutations';
import type { Chat } from '~/types';

/**
 * Activate a deactivated chat once the audio stream connection is up.
 * Activation triggers the scenario greeting (message + TTS) server-side,
 * so the greeting audio only streams when the client can actually hear it.
 */
export function useActivateChat(chat: Chat, isConnected: boolean) {
  const { mutate: updateChat } = useUpdateChat();
  const activatedRef = useRef(false);

  useEffect(() => {
    if (!isConnected || chat.active || activatedRef.current) return;
    activatedRef.current = true;
    updateChat({ chatId: chat.id, data: { active: true } });
  }, [isConnected, chat.active, chat.id, updateChat]);
}
