import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware'; // Add persist middleware
import type { ChatJobType, ChatStateType } from '~/components/chat/types/chatState';
import { ChatState } from '~/components/chat/types/chatState';

interface ChatStore {
  silentMode: boolean;
  hasMicAccess: boolean;

  chatId: string | null;
  currentChatState: ChatStateType;
  currentJob: ChatJobType | null;
  

  setChatId: (id: string) => void;
  setCurrentChatState: (state: ChatStateType) => void;
  setCurrentJob: (job: ChatJobType | null) => void;
  toggleSilentMode: () => void;
  requestMicAccess: () => Promise<void>; 
  setMicAccess: (hasAccess: boolean) => void;


  initChatStore: (chatId: string) => void;
  resetChatStore: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    immer((set) => ({
      silentMode: false,
      hasMicAccess: false,
      
      chatId: null,
      currentChatState: ChatState.Idle,
      currentJob: null,
      

      setChatId: (id) => set({ chatId: id }),
      setCurrentChatState: (state) => set({ currentChatState: state }),
      setCurrentJob: (job) => set({ currentJob: job }),
      toggleSilentMode: () =>
        set((state) => {
          state.silentMode = !state.silentMode;
        }),

      requestMicAccess: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          set({ hasMicAccess: true });
          // Cleanup stream if needed later
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          set({ hasMicAccess: false });
          console.error('Microphone access denied', error);
        }
      },
      setMicAccess: (hasAccess) => set({ hasMicAccess: hasAccess }),

      initChatStore: (chatId: string) =>
        set({ chatId, currentChatState: ChatState.Idle, currentJob: null }),

      resetChatStore: () =>
        set({
          chatId: null,
          currentChatState: ChatState.Idle,
          currentJob: null,
        }),
    })),
    {
      name: 'chat-storage', 
      partialize: (state) => ({ silentMode: state.silentMode }), 
    }
  )
);
