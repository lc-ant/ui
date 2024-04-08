import { InjectionToken } from '@angular/core';

export class LcAntRouterConfig {

  queryParamsToPreserve: string[] = ['_u'];

}

export const ROUTER_CONFIG = new InjectionToken<LcAntRouterConfig>('lc-ant router config');

