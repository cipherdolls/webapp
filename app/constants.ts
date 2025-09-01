export const apiUrl = import.meta.env.VITE_API_URL || 'https://api.cipherdolls.com';
export const wsURL = import.meta.env.VITE_WS_URL  || 'wss://mqtt.cipherdolls.com';


export const PICTURE_SIZE = {
  smallest: 'smallest',
  small: 'small',
  semiMedium: 'semiMedium',
  medium: 'medium',
  default: 'default',
  avatar: 'avatar',
};


export const API_ENDPOINTS = {

  // Jobs
  chatCompletionJob: (id: string) => `chat-completion-jobs/${id}`,
  sttJob: (id: string) => `stt-jobs/${id}`,
  embeddingJob: (id: string) => `embedding-jobs/${id}`,
  ttsJob: (id: string) => `tts-jobs/${id}`,
  // paymentJob: (id: string) => `paymentJobs/${id}`,
};


export const PATHS = {
  ttsVoice: (id: string) => `${apiUrl}/tts-voices/${id}/audio`,
  avatarAudio: (id: string) => `${apiUrl}/avatars/${id}/audio`,
};

export const ROUTES = {
  index: '/',
  signIn: '/signin',
  chats: '/chats',
  avatars: '/avatars',
  scenarios: '/scenarios',
  services: '/services',
  hardware: '/hardware',
  account: '/account',
} as const;


export const NETWORKS = {
  ETHEREUM_MAINNET: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  OPTIMISM: {
    chainId: '0xa',
    chainName: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
} as const;

export const REQUIRED_NETWORK_FOR_TOKEN_PERMITS = NETWORKS.OPTIMISM;

