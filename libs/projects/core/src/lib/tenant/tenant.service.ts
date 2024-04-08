import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Tenant } from './tenant';
import { HttpService } from '../http/http.service';
import { ApiError } from '../http/api-error';

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  public tenant$ = new BehaviorSubject<Tenant | null | undefined>(undefined);

  constructor(
    private authService: AuthService,
    private http: HttpService,
  ) {
    authService.authentication$.subscribe(user => {
      if (user) this.setTenantId(user.user.tenantId).subscribe();
      else if (!this.tenant$.value) {
        // TODO from URL
        console.log('Unkown tenant: TODO from URL');
        this.tenant$.next(null);
      }
    })
  }

  public setTenantId(id?: string): Observable<Tenant | null> {
    if (!id) {
      console.log('No known tenant');
      if (this.tenant$.value) this.tenant$.next(null);
      return of(null);
    }
    if (this.tenant$.value && this.tenant$.value.id === id) return of(this.tenant$.value);
    return this.getTenantById(id).pipe(
      tap(tenant => {
        console.log('Current tenant', tenant);
        this.tenant$.next(tenant);
      })
    );
  }

  public setTenant(tenant?: Tenant): void {
    if (this.tenant$.value?.id === tenant?.id) return;
    this.tenant$.next(tenant);
  }

  public getTenantById(id: string): Observable<Tenant> {
    return this.http.get<Partial<Tenant>>(this.http.getApiBaseUrl() + 'public-api/tenant/v1/' + id).pipe(
      map(Tenant.of),
      tap({
        error: e => {
          if (e instanceof ApiError && e.errorCode === 'not-found:tenant') {
            this.authService.tenantDeleted(id);
          }
        }
      })
    );
  }

}
