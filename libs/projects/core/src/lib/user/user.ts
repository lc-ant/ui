import { ApiData } from '../api/api-data';

export class User extends ApiData {

  constructor(
    id: string,
    version: number,
    public tenantId: string,
    public username: string,
    public email: string,
    public emailVerified: boolean,
    public firstName: string,
    public lastName: string,
    public roles: string[],
    public authorities: string[]
  ) {
    super(id, version);
  }

  public static of(partial: Partial<User>): User {
    if (partial instanceof User) return partial;
    return new User(
      partial.id ?? '',
      partial.version ?? 0,
      partial.tenantId ?? '',
      partial.username ?? '',
      partial.email ?? '',
      partial.emailVerified ?? false,
      partial.firstName ?? '',
      partial.lastName ?? '',
      partial.roles ?? [],
      partial.authorities ?? []
    );
  }

}
