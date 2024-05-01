declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_IS_DEV: 'yes' | 'no';
    }
  }
}

export {};
