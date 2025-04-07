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

export const PATHS = {
  ttsVoice: (id: string) => `${apiUrl}/tts-voices/${id}/audio`,
};



// local storage keys
export const LOCAL_STORAGE_KEYS = {
  silentMode: 'silent-mode',
};
