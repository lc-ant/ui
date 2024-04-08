import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LcAntHttpRequest } from './http-request';
import { Observable, catchError, map, of } from 'rxjs';
import { LcAntHttpResponse } from './http-response';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(private client: HttpClient) {}

  public send(request: LcAntHttpRequest): Observable<LcAntHttpResponse<any>> {
    return this.client.request(
      request.method,
      request.url,
      {
        headers: request.headers,
        observe: 'response',
        responseType: request.responseType,
        body: request.body
      }
    ).pipe(
      map(r => this.toResponse(request, r)),
      catchError(err => of(this.toResponse(request, err)))
    );
  }

  private toResponse<T>(request: LcAntHttpRequest, response: HttpResponse<T>): LcAntHttpResponse<T> {
    if (response instanceof HttpErrorResponse)
      return new LcAntHttpResponse<T>(request, response.error, this.toHeaders(response.headers), response.status, response.statusText);
    return new LcAntHttpResponse<T>(request, response.body, this.toHeaders(response.headers), response.status, response.statusText);
  }

  private toHeaders(headers: HttpHeaders): { [header: string]: string } {
    const result: { [header: string]: string } = {};
    for (const key of headers.keys()) {
      result[key] = headers.get(key)!;
    }
    return result;
  }
}
