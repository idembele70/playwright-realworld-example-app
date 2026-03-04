import { ENV, ENV_CONFIG } from '@config/env.config';

const API_BASE_URL = ENV_CONFIG[ENV].baseURL.front;
const API_BASE_PATHNAME = '/api/';

export const API_URLS_REGEX = {
  HOME: new RegExp(`^${API_BASE_URL}$`),
  LOGIN: new RegExp(`^${API_BASE_URL}login$`),
} as const;

export const API_URLS = {
  ARTICLES: {
    CREATION: 'articles/',
    DELETION: (slug: string) => `articles/${slug}`
  },
};

export const mockApiUrl = (pathname: string): string => `**${pathname}`;