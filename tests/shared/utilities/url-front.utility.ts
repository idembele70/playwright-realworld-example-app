import { ENV, ENV_CONFIG } from '@config/env.config';

const FRONT_BASE_URL = ENV_CONFIG[ENV].baseURL.front;
const ESCAPED_FRONT_BASE_URL = FRONT_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const FRONT_URLS_REG_EXP = {
  HOME: new RegExp(`^${ESCAPED_FRONT_BASE_URL}$`),
  LOGIN: new RegExp(`^${ESCAPED_FRONT_BASE_URL}login$`),
  REGISTER: new RegExp(`^${ESCAPED_FRONT_BASE_URL}register$`),
  ARTICLE_EDITOR: (slug?:string) => new RegExp(`^${ESCAPED_FRONT_BASE_URL}editor${slug ? `/${slug}` : ''}$`),
  ARTICLE_DETAILS: (slug?: string) => new RegExp(`^${ESCAPED_FRONT_BASE_URL}article${slug ? `/${slug}` : ''}$`),
} as const;

export const FRONT_URLS = {
  HOME:'',
  LOGIN:'login',
  REGISTER:'register',
  ARTICLE_EDITOR: 'editor',
  ARTICLE_DETAILS: 'article',
  PROFILE: 'profile'
} as const;