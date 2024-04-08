import { User } from '../user/user';
import { LcAntUtils } from '../utils/lc-ant-utils';
import { PERMISSION_AUTHORITY_PREFIX, ROOT_AUTHORITY } from './authorities';

export class JwtResponse {

  public authorities: string[];

  constructor(
    public accessToken: string,
    public accessTokenExpiresAt: Date,
    public refreshToken: string,
    public refreshTokenExpiresAt: Date,
  ) {
    const payloadStart = accessToken.indexOf('.') + 1;
    const payloadEnd = accessToken.indexOf('.', payloadStart);
    const payload = JSON.parse(atob(accessToken.substring(payloadStart, payloadEnd)));
    this.authorities = payload.authorities;
  }

  public static of(partial: Partial<JwtResponse>): JwtResponse {
    if (partial instanceof JwtResponse) return partial;
    return new JwtResponse(
      partial.accessToken ?? '',
      LcAntUtils.timestampSecondsToDate(partial.accessTokenExpiresAt) ?? new Date(),
      partial.refreshToken ?? '',
      LcAntUtils.timestampSecondsToDate(partial.refreshTokenExpiresAt) ?? new Date(),
    );
  }

  public isRoot(): boolean {
    return this.authorities.indexOf(ROOT_AUTHORITY) >= 0;
  }

}

export class AuthenticatedUserResponse extends JwtResponse {

  constructor(
    accessToken: string,
    accessTokenExpiresAt: Date,
    refreshToken: string,
    refreshTokenExpiresAt: Date,
    public user: User
  ) {
    super(accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt);
  }

  public hasAuthority(authority: string): boolean {
    return this.user.authorities.indexOf(authority) >= 0;
  }

  public hasServicePermission(serviceName: string, permissionName: string): boolean {
    return this.hasAuthority(PERMISSION_AUTHORITY_PREFIX + ':' + serviceName + ':' + permissionName);
  }

  public static override of(partial: Partial<AuthenticatedUserResponse>): AuthenticatedUserResponse {
    if (partial instanceof AuthenticatedUserResponse) return partial;
    return new AuthenticatedUserResponse(
      partial.accessToken ?? '',
      LcAntUtils.timestampSecondsToDate(partial.accessTokenExpiresAt) ?? new Date(),
      partial.refreshToken ?? '',
      LcAntUtils.timestampSecondsToDate(partial.refreshTokenExpiresAt) ?? new Date(),
      User.of(partial.user ?? {})
    );
  }

  public static ofUpdatedJwt(previous: AuthenticatedUserResponse, newJwt: JwtResponse): AuthenticatedUserResponse {
    return new AuthenticatedUserResponse(newJwt.accessToken, newJwt.accessTokenExpiresAt, newJwt.refreshToken, newJwt.refreshTokenExpiresAt, previous.user);
  }

}
