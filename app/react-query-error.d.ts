import '@tanstack/react-query';
import type { HttpError } from './types';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: HttpError;
  }
}