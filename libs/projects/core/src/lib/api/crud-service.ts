import { Observable } from 'rxjs';
import { HttpService } from '../http/http.service';
import { PageRequest } from './page-request';
import { PageResponse } from './page-response';

export class CrudService<T> {

  constructor(private http: HttpService, private baseUrl: string) {}

  public search(criteria?: any, pageRequest?: PageRequest): Observable<PageResponse<Partial<T>>> {
    let url = this.http.getApiBaseUrl() + this.baseUrl + '/_search';
    if (pageRequest) url = pageRequest.addToURL(url);
    return this.http.post<PageResponse<Partial<T>>>(url, criteria);
	}

  public findById(id: string): Observable<Partial<T>> {
    return this.http.get<Partial<T>>(this.http.getApiBaseUrl() + this.baseUrl + '/' + id);
  }

  public create(element: T): Observable<Partial<T>> {
    return this.http.post<Partial<T>>(this.http.getApiBaseUrl() + this.baseUrl, element);
  }

  public update(element: T): Observable<Partial<T>> {
    return this.http.put<Partial<T>>(this.http.getApiBaseUrl() + this.baseUrl, element);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete(this.http.getApiBaseUrl() + this.baseUrl + '/' + id);
  }

}
