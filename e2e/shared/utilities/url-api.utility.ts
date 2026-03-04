import { ENV, ENV_CONFIG } from '@config/env.config';

const API_BASE_URL = ENV_CONFIG[ENV].baseURL.api;

const ESCAPED_API_BASE_URL = API_BASE_URL.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
export const API_URLS_REGEX = {
  HOME: new RegExp(`^${ESCAPED_API_BASE_URL}$`),
  LOGIN: new RegExp(`^${ESCAPED_API_BASE_URL}login$`),
} as const;

export const API_URLS = {
  ARTICLES: {
    CREATION: 'articles/',
    DELETION: (slug: string) => `articles/${slug}`
  },
};

export const mockApiUrl = (pathname: string): string => `**${pathname}`;