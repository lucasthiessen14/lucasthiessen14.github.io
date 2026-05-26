/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_GAME_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
