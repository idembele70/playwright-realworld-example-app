import { ENV, ENV_CONFIG } from '@config/env.config';

const FRONT_BASE_URL = ENV_CONFIG[ENV].baseURL.front;
export const FRONT_URLS = {
  HOME: new RegExp(`^${FRONT_BASE_URL}$`),
  LOGIN: new RegExp(`^${FRONT_BASE_URL}login$`),
  REGISTER: new RegExp(`^${FRONT_BASE_URL}register$`),
} as const;
