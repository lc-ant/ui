import { Inject, Injectable } from '@angular/core';
import { HTTP_CONFIG, HttpConfig } from './http.config';
import { RequestLimiter } from '../utils/request-limiter';
import { HttpClientService } from './http-client.service';
import { HttpMethod, LcAntHttpRequest, ResponseType } from './http-request';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';
import { LcAntHttpResponse } from './http-response';
import { ApiError } from './api-error';

export type RequestInterceptor =
  ((request: LcAntHttpRequest) => LcAntHttpRequest) |
  ((request: LcAntHttpRequest) => Observable<LcAntHttpRequest>);

export type ResponseInterceptor =
  ((response: LcAntHttpResponse<any>) => LcAntHttpResponse<any>) |
  ((response: LcAntHttpResponse<any>) => Observable<LcAntHttpResponse<any>>);

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private requestLimiter: RequestLimiter;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(
    @Inject(HTTP_CONFIG) private config: HttpConfig,
    private httpClient: HttpClientService
  ) {
    this.requestLimiter = new RequestLimiter(config.maxConcurrentRequests);
  }

  public getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  public get<T>(url: string): Observable<T> {
    return this.send(new LcAntHttpRequest(HttpMethod.GET, url, {}, null, ResponseType.JSON));
  }

  public post<T>(url: string, body: any, headers?: any): Observable<T> {
    return this.send(new LcAntHttpRequest(HttpMethod.POST, url, headers ?? {}, body, ResponseType.JSON));
  }

  public put<T>(url: string, body: any, headers?: any): Observable<T> {
    return this.send(new LcAntHttpRequest(HttpMethod.PUT, url, headers ?? {}, body, ResponseType.JSON));
  }

  public delete(url: string): Observable<void> {
    return this.send(new LcAntHttpRequest(HttpMethod.DELETE, url, {}, null, ResponseType.JSON));
  }

  public sendRaw(request: LcAntHttpRequest): Observable<LcAntHttpResponse<any>> {
    let interceptedRequest = of(request);
    for (const interceptor of this.requestInterceptors) {
      interceptedRequest = interceptedRequest.pipe(switchMap(previous => {
        const step = interceptor(previous);
        if (step instanceof LcAntHttpRequest) return of(step);
        return step;
      }));
    }
    let interceptedResponse = interceptedRequest.pipe(switchMap(request => this.httpClient.send(request)));
    for (const interceptor of this.responseInterceptors) {
      interceptedResponse = interceptedResponse.pipe(switchMap(previous => {
        const step = interceptor(previous);
        if (step instanceof LcAntHttpResponse) return of(step);
        return step;
      }));
    }
    return this.requestLimiter.add(interceptedResponse);
  }

  public send<T>(request: LcAntHttpRequest): Observable<T> {
    return this.sendRaw(request)
    .pipe(
      switchMap(response => {
        if (response.status / 100 === 2) return of(response.body);
        return throwError(() => ApiError.fromHttpResponse(response));
      })
    );
  }
}
