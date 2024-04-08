import { InjectionToken } from '@angular/core';

export class AuthConfig {
  public unauthorizedRoute = '/login';
  public returnUrlQueryParam = 'returnUrl';
  public accountIdQueryParam = '_u';
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('auth config');
