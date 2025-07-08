export type CssVariable = `--${string}`;

export interface meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message: Array<string>;
  statusCode: number;
}

export interface User {
  id: string;
  name: string;
  weiBalance: string;
  freeWeiBalance: string;
  signerAddress: string;
  walletAddress: string;
  apikey: string;
  role: string;
  character: string;
}

export interface TokenPermitsPaginated {
  data: TokenPermit[];
  meta: meta;
}
export interface TokenPermit {
  id: string;
  owner: string;
  spender: string;
  value: string;
  nonce: string;
  deadline: number;
  v: number;
  r: string;
  s: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  txHash?: string;
}

export interface AiProvidersPaginated {
  data: AiProvider[];
  meta: meta;
}
export interface AiProvider {
  id: string;
  name: string;
  basePath: string;
  picture?: string;
  apiKey: string;
  chatModels: ChatModel[];
  embeddingModels: EmbeddingModel[];
  reasoningModels: ChatModel[];
}

export interface ChatModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  info?: string;
  dollarPerInputToken: number;
  dollarPerOutputToken: number;
  contextWindow: number;
  aiProviderId: string;
  providerModelName: string;
  recommended: boolean;
  censored: boolean;
  aiProvider?: AiProvider;
  aggregateChatCompletions: {
    avgTimeTakenMs: number;
    minTimeTakenMs: number;
    maxTimeTakenMs: number;
    avgUsdCost: number;
    minUsdCost: number;
    maxUsdCost: number;
  };
  error?: string;
}

export interface ChatModelsPaginated {
  data: ChatModel[];
  meta: meta;
}
export interface EmbeddingModel {
  id: string;
  providerModelName: string;
  dollarPerInputToken: number;
  dollarPerOutputToken: number;
  recommended: boolean;
  aiProvider: AiProvider;
  aiProviderId: string;
  createdAt: Date;
  updatedAt: Date;
  info?: string;
  error?: string;
}

export interface SttProvider {
  id: string;
  name: string;
  dollarPerSecond: number;
  recommended: boolean;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TtsProvider {
  id: string;
  name: string;
  dollarPerCharacter: number;
  picture?: string;
  ttsVoices: TtsVoice[];
  hostname?: string;
  apiKey: string;
}

export interface TtsVoice {
  id: string;
  name: string;
  recommended: boolean;
  providerVoiceId?: string;
  ttsProvider: TtsProvider;
  ttsProviderId: string;
  createdAt: Date;
  gender: Gender;
}

export interface ScenariosPaginated {
  data: Scenario[];
  meta: meta;
}

export interface Scenario {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  systemMessage: string;
  picture: string;
  name: string;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  chatModel: ChatModel;
  embeddingModel: EmbeddingModel;
  reasoningModel?: ChatModel;
  userId: string;
  chats: Chat[];
  recommended: boolean;
  introduction?: string;
  published?: boolean;
}

export interface Chat {
  id: string;
  userId: string;
  chatCompletionJobs: ChatCompletionJob[];
  updatedAt: Date;
  doll: Doll;
  _count: {
    messages: number;
    chatCompletionJobs: number;
  };
  sttProvider?: SttProvider;
  avatar: Avatar;
  scenario: Scenario;
}

export interface MessagesPaginated {
  data: Message[];
  meta: meta;
}
export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  mood: string;
  fileName: string;
  completed: boolean;
  userId: string;
  chatId: string;
  sttJob: SttJob;
  ttsJob: TtsJob;
  embeddingJob: EmbeddingJob;
  chatCompletionJob: ChatCompletionJob;
}

export interface Firmware {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  bin: string;
  checksum: string;
}

export interface DollBody {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  picture: string;
  avatar: Avatar;
}

export interface SttJob {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  usdCost: number;
  timeTakenMs: number;
  paymentJob: PaymentJob;
  sttProvider: SttProvider;
}

export interface TtsJob {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  usdCost: number;
  timeTakenMs: number;
  paymentJob: PaymentJob;
  message: Message;
  ttsVoice: TtsVoice;
}

export interface EmbeddingJob {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  usdCost: number;
  timeTakenMs: number;
  embeddingModel: EmbeddingModel;
}

export interface ChatCompletionJob {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  usdCost: number;
  timeTakenMs: number;
  paymentJob: PaymentJob;
  chatModel: ChatModel;
}

export interface Doll {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  rssi: number;
  deepSleepCountdown: number;
  macAddress: string;
  userId: string;
  picture: string;
  chatId: string;
  _count: DollCount;
}

export interface DollCount {
  chats: number;
}

export interface PaymentJob {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  txHash: string;
  weiCost: string;
  timeTakenMs: number;
}

type Gender = 'Female' | 'Male';
export interface AvatarsPaginated {
  data: Avatar[];
  meta: meta;
}
export interface Avatar {
  id: string;
  name: string;
  shortDesc: string;
  picture: string;
  character: string;
  ttsVoiceId: string;
  userId: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  editable: boolean;
  role: string;
  _count: AvatarCount;
  ttsVoice: TtsVoice;
  chats: Chat[];
  language: string;
  scenarios: Scenario[];
  gender: Gender;
}
export interface AvatarCount {
  chats: number;
}

export type AudioEvent = {
  type: 'audio';
  action: 'play' | 'stop' | 'replay' | 'record' | 'record_stop';
  messageId?: string;
};

export type SystemEvent = {
  type: 'system';
  action: 'reset' | 'restart' | 'deepsleep';
};

export type ActionEvent = AudioEvent | SystemEvent;

export interface ProcessEvent {
  resourceName: string;
  resourceId: string;
  jobName: string;
  jobId: number;
  jobStatus: 'active' | 'completed' | 'failed' | 'retrying';
}
