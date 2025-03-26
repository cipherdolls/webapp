//  CHAT STATE TYPES
export enum ChatState {
  input = 'input',
  recording = 'recording',
  avatarSpeaking = 'avatarSpeaking',
  notification = 'notification',
}

export type ChatStateType = keyof typeof ChatState;