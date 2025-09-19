import { setupServer } from 'msw/node';
import { authHandlers } from './handlers';

export const authServer = setupServer(...authHandlers);