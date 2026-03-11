import { TestInfo } from "@playwright/test";
import { CompositeIdFactory } from "@shared/factories/composite-id.factory";
import { Article, CreateArticleRequest } from "./models/article.model";

export class ArticleFactory {
  static buildArticlePayload(id: string, overrides?: CreateArticleRequest): CreateArticleRequest {
    return {
      title: `title-${id}`,
      description: `description-${id}`,
      body: `body-${id}`,
      tagList: [`tag-1-${id}`, `tag-2-${id}`],
      ...overrides,
    };
  }

  static buildArticle(id: string | number, overrides?: Article): Article {
    return {
      slug: `title-${id}`,
      title: `title ${id}`,
      description: `Description ${id}`,
      body: 'body',
      tagList: [`tag-${id}`],
      createdAt: String(Date.now()),
      updatedAt: String(Date.now()),
      favorited: false,
      favoritesCount: 0,
      author: {
        username: `user-${id}`,
        bio: null,
        image: '',
        following: false,
      },
      ...overrides,
    }
  }

  static buildArticleComment(id: string): string {
    return `Comment-${id}`;
  }

  static buildArticleTagList(parallelIndex: number, length: number): string[] {
    return Array.from({ length }, (_, idx) => `tag-worker-${parallelIndex}-${idx}`);
  }

  static buildLongText({ text = 'A', length = 5000 } = {}): string {
    return text.repeat(length);
  }

  static buildSpecialTextDeterministic({
    length = 200,
    characters = `!@#$%^&*()_+[]{}<>?/\\|~\`"';:,.-=éèàç🚀`,
  } = {}): string {
    return characters.repeat(Math.ceil(length / characters.length)).slice(0, length);
  }

  static generateTestArticle(workerInfo: TestInfo, title: string): CreateArticleRequest {
    const id = CompositeIdFactory.fromExecutionInfo(workerInfo, title);
    return ArticleFactory.buildArticlePayload(id);
  }
}