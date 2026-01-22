import { User } from './auth.model';

export class AuthFactory {

  static buildUser(id: number | string, overrides?: Partial<User>): User {
    return {
      email: `user-${id}@invalid.invalid`,
      username: `user-${id}`,
      password: 'P@ssw0rd!?',
      ...overrides,
    };
  }

  static buildId(...ids: (string | number)[]): string { return ids.join('-') }

}