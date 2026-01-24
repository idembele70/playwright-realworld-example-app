import { ENV, ENV_CONFIG } from '@config/env.config';

const apiBaseURL = ENV_CONFIG[ENV].baseURL.front;
export const API_URLS = {
  HOME: new RegExp(`^${apiBaseURL}$`),
  LOGIN: new RegExp(`^${apiBaseURL}login$`),
} as const;
