export const backendUrl = 'https://api.cipherdolls.com';

export const PICTURE_SIZE = {
  smallest: 'smallest',
  small: 'small',
  semiMedium: 'semiMedium',
  medium: 'medium',
  default: 'default',
  avatar: 'avatar',
};

export const PATHS = {
  ttsVoice: (id: string) => `${backendUrl}/tts-voices/${id}/audio`,
};



// local storage keys
export const LOCAL_STORAGE_KEYS = {
  silentMode: 'silent-mode',
};
