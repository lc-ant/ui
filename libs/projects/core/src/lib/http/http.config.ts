import { InjectionToken } from '@angular/core';

export class HttpConfig {
  public maxConcurrentRequests = 100;
  public apiBaseUrl = '/';
}

export const HTTP_CONFIG = new InjectionToken<HttpConfig>('http config');
