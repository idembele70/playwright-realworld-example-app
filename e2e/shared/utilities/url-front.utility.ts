import { ENV, ENV_CONFIG } from '@config/env.config';

const FRONT_BASE_URL = ENV_CONFIG[ENV].baseURL.front;
export const FRONT_URLS_REG_EXP = {
  HOME: new RegExp(`^${FRONT_BASE_URL}$`),
  LOGIN: new RegExp(`^${FRONT_BASE_URL}login$`),
  REGISTER: new RegExp(`^${FRONT_BASE_URL}register$`),
  ARTICLE_EDITOR: new RegExp(`^${FRONT_BASE_URL}editor$`),
  ARTICLE_DETAILS: new RegExp(`^${FRONT_BASE_URL}article/[a-zA-Z0-9-]$`),
} as const;

export const FRONT_URLS = {
  HOME:'',
  LOGIN:'login',
  REGISTER:'register',
  ARTICLE_EDITOR: 'editor',
} as const;