import { Injectable } from '@angular/core';
import { ApiDataEventsService, ApiDataStore, CrudService, HttpService, ObservableItem, PageRequest, PageResponse, Tenant } from '@lc-ant/core';
import { Observable, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminTenantService {

  private store;
  private crud: CrudService<Tenant>;

  constructor(
    private http: HttpService,
    eventsService: ApiDataEventsService,
  ) {
    this.store = new TenantStore(http, eventsService);
    this.crud = new CrudService<Tenant>(http, 'api/tenant/v1');
  }

  public search(criteria?: any, pageRequest?: PageRequest): Observable<PageResponse<ObservableItem<Tenant>>> {
    return this.crud.search(criteria, pageRequest).pipe(
      map(page => <PageResponse<ObservableItem<Tenant>>>{
        total: page.total,
        data: this.store.listLoaded(page.data)
      })
    );
  }

  public searchText(text: string, pageRequest?: PageRequest): Observable<PageResponse<ObservableItem<Tenant>>> {
    let url = this.http.getApiBaseUrl() + 'api/tenant/v1/_textSearch?text=' + encodeURIComponent(text);
    if (pageRequest) url = pageRequest.addToURL(url);
    return this.http.get<PageResponse<Partial<Tenant>>>(url).pipe(
      map(page => <PageResponse<ObservableItem<Tenant>>>{
        total: page.total,
        data: this.store.listLoaded(page.data)
      })
    );
  }

  public getById(id: string): ObservableItem<Tenant> {
    return this.store.get$(id);
  }

  public update(tenant: Tenant): Observable<Tenant> {
    return this.crud.update(tenant.toDto()).pipe(
      map(partial => Tenant.of(partial)),
      tap(result => this.store.elementLoaded(result))
    );
  }

  public create(tenant: Tenant): Observable<Tenant> {
    return this.crud.create(tenant.toDto()).pipe(
      map(partial => Tenant.of(partial)),
      tap(result => this.store.elementLoaded(result))
    );
  }

  public delete(id: string): Observable<void> {
    return this.crud.delete(id).pipe(
      tap({complete: () => this.store.elementDeleted(id)})
    );
  }

}

class TenantStore extends ApiDataStore<Tenant> {

  constructor(
    http: HttpService,
    eventsService: ApiDataEventsService,
  ) {
    super(eventsService, 'tenant', 'Tenant', 10 * 60000, 7 * 60000);
    this._loaderById = id => http.get<Partial<Tenant>>(http.getApiBaseUrl() + 'api/tenant/v1/' + id);
  }

  override createInstance(partial: Partial<Tenant>): Tenant {
    return Tenant.of(partial);
  }

}
