//  CHAT STATE TYPES
export enum ChatState {
  Idle = 'Idle',
  avatarSpeaking = 'avatarSpeaking',
  userSpeaking = 'userSpeaking',
  error = 'error',
}

export enum ChatJob {
  TtsJob = 'TtsJob',
  SttJob = 'SttJob',
  ChatCompletionJob = 'ChatCompletionJob',
  EmbeddingJob = 'EmbeddingJob',
  PaymentJob = 'PaymentJob',
}

export type ChatStateType = keyof typeof ChatState;
export type ChatJobType = keyof typeof ChatJob;