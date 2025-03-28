//  CHAT STATE TYPES
export enum ChatState {
  input = 'input',
  avatarSpeaking = 'avatarSpeaking',
  userSpeaking = 'userSpeaking',
  error = 'error',
  // job/process states
  TtsJob = 'TtsJob',
  SttProcess = 'SttProcess',
  ChatCompletionJob = 'ChatCompletionJob',
}

export type ChatStateType = keyof typeof ChatState;