const isServer = typeof document === 'undefined';
export const apiUrl = isServer
  ? (process.env.SERVER_API_URL || import.meta.env.VITE_API_URL || 'https://api.cipherdolls.com')
  : (import.meta.env.VITE_API_URL || 'https://api.cipherdolls.com');
export const wsURL = import.meta.env.VITE_WS_URL || 'wss://mqtt.cipherdolls.com';
export const streamRecorderUrl = import.meta.env.VITE_STREAM_RECORDER_URL || 'wss://stream-recorder.cipherdolls.com';
export const streamPlayerUrl = import.meta.env.VITE_STREAM_PLAYER_URL || 'wss://stream-player.cipherdolls.com';

export const USDC_TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const USDC_TOKEN_NAME = 'USD Coin';
export const USDC_TOKEN_VERSION = '2';
export const SPENDER_ADDRESS = import.meta.env.VITE_SPENDER_ADDRESS || '0x2A0a2744d4d96b43C2C273f1906AD89dFe2AD607';

export const uniswapUrl =
  `https://app.uniswap.org/explore/tokens/base/${USDC_TOKEN_ADDRESS}` as const;

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
  fillerWordAudio: (id: string) => `${apiUrl}/filler-words/${id}/audio`,
};

export const ROUTES = {
  index: '/',
  chats: '/chats',
  avatars: '/avatars',
  scenarios: '/scenarios',
  ai: '/services/ai',
  services: '/services',
  dolls: '/dolls',
  dollBodies: '/doll-bodies',
  dollBodiesNew: '/doll-bodies/new',
  account: '/account',
  accountAvatarsNew: '/account/avatars/new',
  accountScenariosNew: '/account/scenarios/new',
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
  BASE: {
    chainId: '0x2105',
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  },
} as const;

export const REQUIRED_NETWORK_FOR_TOKEN_PERMITS = NETWORKS.BASE;

export const TOKEN_BALANCE = {
  DECIMAL_PLACES: 2,
  RATE_LIMIT_MS: 2000,
  FEEDBACK_TIMEOUT_MS: 3000,
  MINIMUM_SPENDABLE: import.meta.env.DEV ? 0 : 0.1,
};

export const GUEST_MODE_WELCOME_CHATS = [
  {
    avatarName: 'Beatrice',
    scenarioName: '20 Questions Game',
    avatarId: 'ba57fd47-d922-4e9b-a5fd-0d70d447b92e',
    scenarioId: '29baa4d2-2a2d-4688-a418-328042d80a90',
  },
  {
    avatarName: 'Gael',
    scenarioName: 'CipherDolls',
    avatarId: 'b9ac088b-c366-40c4-899b-2e20dab040df',
    scenarioId: '80ae78e7-71b9-44ed-97d5-861daa53677e',
  },
  {
    avatarName: 'Hazel',
    scenarioName: 'Crypto Talk',
    avatarId: '65d5dbf2-072c-4bbb-8d23-11a57d6bf1ce',
    scenarioId: '3182013b-a6cf-454e-974b-51e13e031d2a',
  },
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  // { code: 'nl', name: 'Dutch' },
  // { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  // { code: 'uk', name: 'Ukrainian' },
  // { code: 'cz', name: 'Czech' },
  // { code: 'sk', name: 'Slovak' },
  // { code: 'bg', name: 'Bulgarian' },
  // { code: 'ro', name: 'Romanian' },
  // { code: 'el', name: 'Greek' },

  // { code: 'tr', name: 'Turkish' },
  // { code: 'ar', name: 'Arabic' },
  // { code: 'he', name: 'Hebrew' },
  // { code: 'fa', name: 'Persian (Farsi)' },
  // { code: 'ur', name: 'Urdu' },

  // { code: 'hi', name: 'Hindi' },
  // { code: 'bn', name: 'Bengali' },
  // { code: 'ta', name: 'Tamil' },
  // { code: 'te', name: 'Telugu' },
  // { code: 'ml', name: 'Malayalam' },
  // { code: 'mr', name: 'Marathi' },
  // { code: 'gu', name: 'Gujarati' },

  { code: 'zh', name: 'Chinese (Mandarin)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  // { code: 'vi', name: 'Vietnamese' },
  // { code: 'th', name: 'Thai' },
  // { code: 'id', name: 'Indonesian' },
  // { code: 'ms', name: 'Malay' },
  // { code: 'fil', name: 'Filipino / Tagalog' },

  // { code: 'sw', name: 'Swahili' },
  // { code: 'af', name: 'Afrikaans' },
  // { code: 'am', name: 'Amharic' },
  // { code: 'zu', name: 'Zulu' },
  // { code: 'yo', name: 'Yoruba' },
] as const;

/*             Animations              */

export const ANIMATE_DURATION = { duration: 0.25 };

export const ANIMATE_OVERLAY = {
  initial: { opacity: 0.3 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: ANIMATE_DURATION,
};

export const ANIMATE_MODAL_SHOW_CENTER = {
  initial: { scale: 1.2 },
  animate: { scale: 1 },
  transition: { duration: 0.2 },
};

export const ANIMATE_MODAL_SHOW_RIGHT = {
  initial: { opacity: 0.5, transform: 'translateX(25%)' },
  animate: { opacity: 1, transform: 'translateX(0%)' },
  transition: { duration: 0.2 },
};

export const ANIMATE_CHAT_ITEMS = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: ANIMATE_DURATION,
};

export const ANIMATE_POPOVER_CENTER = {
  initial: { opacity: 0, scale: 0.9, y: '-10%' },
  animate: { opacity: 1, scale: 1, y: '0%' },
  exit: { opacity: 0, scale: 0.9, y: '-10' },
};

export const ANIMATE_POPOVER_RIGHT = {
  initial: { opacity: 0, scale: 0.9, x: '28%' },
  animate: { opacity: 1, scale: 1, x: '0%' },
  exit: { opacity: 0, scale: 0, x: '28%' },
};

export const ANIMATE_POPOVER_LEFT = {
  initial: { opacity: 0, scale: 0.9, x: '28%' },
  animate: { opacity: 1, scale: 1, x: '0%' },
  exit: { opacity: 0, scale: 0, x: '28%' },
};

export const ANIMATE_TOOLTIP_CENTER = {
  initial: { opacity: 0, scale: 0.9, y: '10%' },
  animate: { opacity: 1, scale: 1, y: '0%' },
  exit: { opacity: 0, scale: 0.9, y: '10' },
};

export const ANIMATE_TOOLTIP_RIGHT = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0 },
};

export const ANIMATE_TOOLTIP_LEFT = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0 },
};
