import { Article } from "./models/article.model";

export class ArticleFactory {
  static buildArticle(id: string, overrides?: Partial<Article>): Article {
    return {
      title: `article-${id}`,
      description: `description-${id}`,
      content: `content-${id}`,
      tags: [`tag-1-${id}`, `tag-2-${id}`],
      ...overrides,
    };
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
}