/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Address of the chat API (see server/chat). Leave empty to use only the built-in offline search. */
  readonly VITE_CHAT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
