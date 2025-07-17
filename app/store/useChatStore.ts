import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware'; // Add persist middleware
import type { ChatJobType, ChatStateType } from '~/components/chat/types/chatState';
import { ChatState } from '~/components/chat/types/chatState';
import type { Chat, Message } from '~/types';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

interface ChatStore {
  silentMode: boolean;
  hasMicAccess: boolean;
  currentChatState: ChatStateType;
  currentJob: ChatJobType | null;

  talkMode: boolean;

  setCurrentChatState: (state: ChatStateType) => void;
  setCurrentJob: (job: ChatJobType | null) => void;
  toggleSilentMode: () => void;
  requestMicAccess: () => Promise<void>;
  setMicAccess: (hasAccess: boolean) => void;
  setTalkMode: (talkMode: boolean) => void;

  initChatStore: () => void;
  resetChatStore: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    immer((set, get) => ({
      silentMode: false,
      hasMicAccess: false,
      talkMode: false,
      currentChatState: ChatState.Idle,
      currentJob: null,

      setCurrentChatState: (state) => set({ currentChatState: state }),
      setCurrentJob: (job) => set({ currentJob: job }),
      toggleSilentMode: () =>
        set((state) => {
          state.silentMode = !state.silentMode;
        }),

      setTalkMode: (talkMode) => set({ talkMode }),

      requestMicAccess: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          set({ hasMicAccess: true });
          // Cleanup stream if needed later
          stream.getTracks().forEach((track) => track.stop());
        } catch (error) {
          set({ hasMicAccess: false });
          console.error('Microphone access denied', error);
        }
      },
      setMicAccess: (hasAccess) => set({ hasMicAccess: hasAccess }),

      initChatStore: () =>
        set({
          currentChatState: ChatState.Idle,
          currentJob: null,
          talkMode: false,
        }),

      resetChatStore: () =>
        set({
          currentChatState: ChatState.Idle,
          currentJob: null,
          talkMode: false,
        }),
    })),
    {
      name: 'chat-storage',
      partialize: (state) => ({ silentMode: state.silentMode }),
    }
  )
);
