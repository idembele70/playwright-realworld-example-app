import { ENV, ENV_CONFIG } from '@config/env.config';

const API_BASE_URL = ENV_CONFIG[ENV].baseURL.api;

const ESCAPED_API_BASE_URL = API_BASE_URL.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
export const API_URLS_REGEX = {
  HOME: new RegExp(`^${ESCAPED_API_BASE_URL}$`),
  LOGIN: new RegExp(`^${ESCAPED_API_BASE_URL}login$`),
} as const;

export const API_URLS = {
  ARTICLES: {
    SAVE: (slug?: string) => `articles/${slug ?? ''}`,
    DELETION: (slug: string) => `articles/${slug}`,
    GET_LIST: ({ limit = 10, offset = 0 } = {}) => `articles?limit=${limit}&offset=${offset}`
  },
  TAG: {
    GET_LIST: 'tags'
  }
};

export const mockApiUrl = (pathname: string): string => `**${pathname}`;