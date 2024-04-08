import { APP_BASE_HREF, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';
import { LcAntRouterConfig, ROUTER_CONFIG } from './lc-ant-router.config';
import { LcAntUtils } from '../utils/lc-ant-utils';

@Injectable()
export class PreserveQueryParamsLocationStrategy extends PathLocationStrategy {

  constructor(
    @Inject(ROUTER_CONFIG) private config: LcAntRouterConfig,
    platformLocation: PlatformLocation,
    @Optional() @Inject(APP_BASE_HREF) href?: string
  ) {
    super(platformLocation, href);
  }

  override prepareExternalUrl(internal: string): string {
    let url = super.prepareExternalUrl(internal);
    let params = LcAntUtils.parseQueryParams(url);
    let existingParams = LcAntUtils.parseQueryParams(window.location.search);
    for (const name of this.config.queryParamsToPreserve) {
      if (!params[name] && existingParams[name]) {
        if (url.indexOf('?') < 0) url += '?'; else url += '&';
        url += encodeURIComponent(name) + '=' + encodeURIComponent(existingParams[name]);
      }
    }
    return url;
  }

}
