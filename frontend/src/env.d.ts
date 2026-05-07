/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface Window {
  __TASKFACTORY_API_BASE__?: string;
}
