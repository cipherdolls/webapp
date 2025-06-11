// Dev logging utilities
export const devLog = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(message, ...args);
  }
};

export const devWarn = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.warn(message, ...args);
  }
};

export const devError = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.error(message, ...args);
  }
}; 