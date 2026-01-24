import { ENV, ENV_CONFIG } from '@config/env.config';

const frontBaseURL = ENV_CONFIG[ENV].baseURL.front;
export const FRONT_URLS = {
  HOME: new RegExp(`^${frontBaseURL}$`),
  LOGIN: new RegExp(`^${frontBaseURL}login$`),
} as const;
