export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export type CreateArticleRequest = Pick<
  Article,
  'title' | 'description' | 'body' | 'tagList'
>;

interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}