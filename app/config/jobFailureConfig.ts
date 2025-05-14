import { API_ENDPOINTS } from '~/constants';


export enum ResourceName {
  ChatCompletionJob = 'ChatCompletionJob',
  TtsJob = 'TtsJob',
  SttJob = 'SttJob',
  // PaymentJob = 'PaymentJob',
  EmbeddingJob = 'EmbeddingJob'
}


export const jobFailureConfig = {
  [ResourceName.ChatCompletionJob]: {
    icon: '🧩🚫',
    title: 'Chat Completion Job Error',
    getBody: (value?: string) => value ?? 'Something went wrong during ChatCompletionJob.',
    jobEndpoint: (id: string) => API_ENDPOINTS.chatCompletionJob(id),
  },
  [ResourceName.TtsJob]: {
    icon: '👄🚫',
    title: 'TTS Job Error',
    getBody: (value?: string) => value ?? 'Something went wrong during TtsJob.',
    jobEndpoint: (id: string) => API_ENDPOINTS.ttsJob(id),
  },
  [ResourceName.SttJob]: {
    icon: '👂🚫',
    title: 'STT Job Error',
    getBody: (value?: string) => value ?? 'Something went wrong during SttJob.',
    jobEndpoint: (id: string) => API_ENDPOINTS.sttJob(id),
  },
  [ResourceName.EmbeddingJob]: {
    icon: '🔢🚫',
    title: 'Embedding Job Error',
    getBody: (value?: string) => value ?? 'Something went wrong during EmbeddingJob.',
    jobEndpoint: (id: string) => API_ENDPOINTS.embeddingJob(id),
  },
  // [ResourceName.PaymentJob]: {
  //   icon: '💵🚫',
  //   title: 'Payment Job Error',
  //   getBody: (value?: string) => value ?? 'Something went wrong during PaymentJob.',
  //   jobEndpoint: (id: string) => API_ENDPOINTS.paymentJob(id),
  // },
} as const;