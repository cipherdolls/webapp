//  CHAT STATE TYPES
export enum ChatState {
  Idle = 'Idle',
  avatarSpeaking = 'avatarSpeaking',
  userSpeaking = 'userSpeaking',
  error = 'error',
  // job/process states
  TtsJob = 'TtsJob',
  SttJob = 'SttJob',
  ChatCompletionJob = 'ChatCompletionJob',
}

export type ChatStateType = keyof typeof ChatState;