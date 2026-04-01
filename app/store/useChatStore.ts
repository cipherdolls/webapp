import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware'; // Add persist middleware
import type { ChatJobType, ChatStateType } from '~/components/chat/types/chatState';
import { ChatState } from '~/components/chat/types/chatState';

interface ChatStore {
  silentMode: boolean;
  hasMicAccess: boolean;
  currentChatState: ChatStateType;
  currentJob: ChatJobType | null;
  processingMessageId: string | null;
  showTypingIndicator: boolean;

  talkMode: boolean;

  setCurrentChatState: (state: ChatStateType) => void;
  setCurrentJob: (job: ChatJobType | null) => void;
  setProcessingMessageId: (id: string | null) => void;
  setShowTypingIndicator: (show: boolean) => void;
  toggleSilentMode: () => void;
  requestMicAccess: () => Promise<void>;
  setMicAccess: (hasAccess: boolean) => void;
  setTalkMode: (talkMode: boolean) => void;

  stopTts: () => void;
  setStopTts: (fn: () => void) => void;

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
      processingMessageId: null,
      showTypingIndicator: false,

      setCurrentChatState: (state) => set({ currentChatState: state }),
      setCurrentJob: (job) => set({ currentJob: job }),
      setProcessingMessageId: (id) => set({ processingMessageId: id }),
      setShowTypingIndicator: (show) => set({ showTypingIndicator: show }),
      toggleSilentMode: () =>
        set((state) => {
          state.silentMode = !state.silentMode;
        }),

      setTalkMode: (talkMode) => set({ talkMode }),

      stopTts: () => {},
      setStopTts: (fn) => set({ stopTts: fn }),

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
          processingMessageId: null,
          showTypingIndicator: false,
          talkMode: false,
        }),

      resetChatStore: () =>
        set({
          currentChatState: ChatState.Idle,
          currentJob: null,
          processingMessageId: null,
          showTypingIndicator: false,
          talkMode: false,
        }),
    })),
    {
      name: 'chat-storage',
      partialize: (state) => ({ silentMode: state.silentMode }),
    }
  )
);
