import { IDatabaseAdapter } from './types';

// Este archivo sirve como fallback de tipos para TypeScript.
// Metro resolverá automáticamente adapter.native.ts para Android/iOS y adapter.web.ts para Web.
export function createAdapter(): IDatabaseAdapter {
  throw new Error('Platform adapter not resolved by bundler');
}

