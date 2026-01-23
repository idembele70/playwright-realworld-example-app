export type TestEnv = 'local' | 'production';
export const ENV = (process.env.TEST_ENV  as TestEnv) ?? 'local';

export const FRONT_BASE_PATHNAME = '/angular-conduit/';

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
      api: `http://localhost:3000/api/`,
    },
  },
  production: {
    baseURL: {
      front: `https://vps-dc56a7e6.vps.ovh.net${FRONT_BASE_PATHNAME}`,
      api: `https://vps-dc56a7e6.vps.ovh.net/angular-conduit-api/api/`,
    },
  },
} as const;