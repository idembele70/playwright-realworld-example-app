export type TestEnv = 'local' | 'production';
export const ENV = (process.env.TEST_ENV  as TestEnv) ?? 'production';

const FRONT_BASE_PATHNAME = '/angular-conduit/';
const API_BASE_PATHNAME = '/api/';

interface BaseUrl {
  baseURL: {
      front: string;
      api: string;
    }
} 
export const ENV_CONFIG: Record<TestEnv, BaseUrl> = {
  local: {
    baseURL: {
      front: `http://localhost:4200${FRONT_BASE_PATHNAME}`,
      api: `http://localhost:3000${API_BASE_PATHNAME}`,
    },
  },
  production: {
    baseURL: {
      front: `https://vps-dc56a7e6.vps.ovh.net${FRONT_BASE_PATHNAME}`,
      api: `https://vps-dc56a7e6.vps.ovh.net/angular-conduit-api${API_BASE_PATHNAME}`,
    },
  },
} as const;