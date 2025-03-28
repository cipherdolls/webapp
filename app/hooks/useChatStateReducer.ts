// chatStateReducer.ts
import { ChatState, type ChatStateType } from '~/components/chat/types/chatState'; 

type ChatStateAction =
  | { type: 'SET_USER_SPEAKING' }
  | { type: 'CLEAR_USER_SPEAKING' }
  | { type: 'SET_STATE'; payload: ChatStateType };

export function chatStateReducer(state: ChatStateType, action: ChatStateAction): ChatStateType {
  switch (action.type) {
    case 'SET_USER_SPEAKING':
      return ChatState.userSpeaking;

    case 'CLEAR_USER_SPEAKING':
      return ChatState.input;

    case 'SET_STATE':
      if (state === ChatState.userSpeaking && action.payload !== ChatState.input) {
        return state;
      }
      return action.payload;

    default:
      return state;
  }
}