//  CHAT STATE TYPES
export enum ChatState {
  input = 'input',
  avatarSpeaking = 'avatarSpeaking',
  recording = 'recording',
  notification = 'notification',
}

export type ChatStateType = keyof typeof ChatState;