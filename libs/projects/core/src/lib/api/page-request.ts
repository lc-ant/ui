import { LcAntHttpRequest } from '../http/http-request';

export class PageRequest {

  public page?: number;
  public pageSize?: number;
  public sort?: Sort[];
  public withTotal = false;

  constructor() {}

  public addToURL(url: string): string {
    if (this.page) url = LcAntHttpRequest.addQueryParam(url, 'page', '' + this.page);
    if (this.pageSize) url = LcAntHttpRequest.addQueryParam(url, 'pageSize', '' + this.pageSize);
    if (this.withTotal) url = LcAntHttpRequest.addQueryParam(url, 'withTotal', 'true');
    if (this.sort) {
      for (const s of this.sort) {
        url = LcAntHttpRequest.addQueryParam(url, 'sort', (s.order === SortOrder.ASC ? '' : '-') + s.field);
      }
    }
    return url;
  }
}

export class Sort {
  constructor(public field: string, public order: SortOrder) {}
}

export enum SortOrder {
  ASC, DESC
}
