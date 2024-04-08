import { Inject, Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { BehaviorSubject, EMPTY, Observable, combineLatest, filter, first, map, of, tap } from 'rxjs';
import { LcAntHttpRequest } from '../http/http-request';
import { LcAntHttpResponse } from '../http/http-response';
import { AUTH_CONFIG, AuthConfig } from './auth.config';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DatabaseService } from '../database/database.service';
import { User } from '../user/user';
import { AuthenticatedUserResponse, JwtResponse } from './auth-response';
import { LcAntUtils } from '../utils/lc-ant-utils';

/*
We store in the 'default' database a list of account, with for each an id and an email: [{id: number, email: string, tenantId: string}]
Then, for each account, data is stored in a database with the email as database name.
The id is used in query parameters, so each URL contains on which account we are.
If no id is set in the query parameters, and a single account exists, we use this single account.
*/
const DEFAULT_DB_ACCOUNTS_LIST_KEY = 'auth-accounts';
const ACCOUNT_DB_AUTH_KEY = 'auth';

export interface KnownAccount {
  id: number;
  username: string;
  email: string;
  tenantId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public authentication$ = new BehaviorSubject<AuthenticatedUserResponse | null | undefined>(undefined);

  constructor(
    private http: HttpService,
    @Inject(AUTH_CONFIG) private config: AuthConfig,
    private router: Router,
    private databaseService: DatabaseService,
  ) {
    http.addRequestInterceptor(r => this.addBearerToken(r));
    http.addResponseInterceptor(r => this.handle401Response(r));
    this.load();
  }

  public get authenticated(): boolean {
    return !!this.authentication$.value;
  }

  public get user$(): Observable<AuthenticatedUserResponse | null> {
    return <Observable<AuthenticatedUserResponse | null>>this.authentication$.pipe(
      filter(value => value !== undefined)
    );
  }

  public get user(): AuthenticatedUserResponse | null | undefined {
    return this.authentication$.value;
  }

  public get authenticated$(): Observable<boolean> {
    return this.user$.pipe(map(user => user !== null));
  }

  public hasPermission$(serviceName: string, permissionName: string): Observable<boolean> {
    return this.user$.pipe(map(user => user?.hasServicePermission(serviceName, permissionName) ?? false));
  }

  public guardAuthenticated(): Observable<boolean> {
    return this.authenticated$.pipe(
      tap(isAuth => {
        if (!isAuth) this.redirectUnauthorized();
      })
    );
  }

  public getKnownAccounts$(): Observable<KnownAccount[]> {
    return this.databaseService.get().get$(DEFAULT_DB_ACCOUNTS_LIST_KEY).pipe(
      map(list => (list || []).filter((a: KnownAccount) => a?.id && a?.username && a?.email && a?.tenantId))
    );
  }

  private saveKnownAccount(auth: AuthenticatedUserResponse): void {
    this.databaseService.get().get$(DEFAULT_DB_ACCOUNTS_LIST_KEY).subscribe(list => {
      if (!list) list = [];
      const known = list.find((a: any) => a.email === auth.user.email && a.tenantId === auth.user.tenantId && a.username === auth.user.username);
      let id;
      if (known) {
        id = known.id;
      } else {
        let id = 1;
        while (list.find((a: any) => a.id === id)) id++;
        list.push({id, username: auth.user.username, email: auth.user.email, tenantId: auth.user.tenantId});
        this.databaseService.get().set(DEFAULT_DB_ACCOUNTS_LIST_KEY, list);
      }
      const queryParams = LcAntUtils.parseQueryParams(window.location.search);
      if (queryParams[this.config.accountIdQueryParam] != id) {
        let url = this.router.routerState.snapshot.url;
        const i = url.indexOf('?');
        if (i < 0) url += '?' + this.config.accountIdQueryParam + '=' + id;
        else url += '&' + this.config.accountIdQueryParam + '=' + id;
        this.router.navigateByUrl(url);
      }
    });
  }

  private removeKnownAccounts(ids: number[]): void {
    this.databaseService.get().get$(DEFAULT_DB_ACCOUNTS_LIST_KEY).subscribe((list: KnownAccount[]) => {
      if (!list) list = [];
      for (const id of ids) {
        const index = list.findIndex(a => a.id === id);
        if (index >= 0) list.splice(index, 1);
      }
      this.databaseService.get().set(DEFAULT_DB_ACCOUNTS_LIST_KEY, list);
    });
  }

  public searchEmail(email: string): Observable<User> {
    return this.http.get<User>(this.http.getApiBaseUrl() + 'public-api/auth/v1/_searchEmail?email=' + encodeURIComponent(email)).pipe(
      map(User.of)
    );
  }

  public authenticateWithUsernameAndPassword(tenantId: string, username: string, password: string): Observable<AuthenticatedUserResponse> {
    return this.http.post<Partial<AuthenticatedUserResponse>>(this.http.getApiBaseUrl() + 'public-api/auth/v1/tenant/' + tenantId + '/user/' + username, password).pipe(
      map(response => {
        const user = AuthenticatedUserResponse.of(response);
        this.setAuthenticatedUser(user);
        return user;
      })
    );
  }

  public logout(): void {
    const auth = this.authentication$.value;
    if (!auth) return;
    this.http.post(this.http.getApiBaseUrl() + 'public-api/auth/v1/' + auth.user.tenantId + '/closeToken', { accessToken: auth.accessToken, refreshToken: auth.refreshToken }).subscribe();
    this.databaseService.get(auth.user.email + '_' + auth.user.tenantId).remove(ACCOUNT_DB_AUTH_KEY);
    this.setAuthenticatedUser();
    this.redirectUnauthorized();
  }

  private load(): void {
    const queryParams = LcAntUtils.parseQueryParams(window.location.search);
    this.getKnownAccounts$().pipe(first()).subscribe(accounts => {
      console.log('Known accounts: ', accounts)
      let accountId = queryParams[this.config.accountIdQueryParam];
      if (!accountId && accounts.length == 1) accountId = accounts[0].id;
      let account: KnownAccount | undefined = undefined;
      if (accountId) account = accounts.find(a => a.id == accountId);
      if (!account) {
        this.authentication$.next(null);
      } else {
        this.databaseService.get(account.email + '_' + account.tenantId).get$(ACCOUNT_DB_AUTH_KEY).subscribe(
          auth => {
            console.log('found authentication info from local storage', auth);
            try {
              const expiration = auth?.accessTokenExpiresAt?.getTime();
              if (expiration && expiration > Date.now() - 10000) {
                this.http.post(this.http.getApiBaseUrl() + 'public-api/auth/v1/_validate', auth.accessToken).subscribe({
                  complete: () => this.setAuthenticatedUser(AuthenticatedUserResponse.of(auth)),
                  error: e => {
                    console.log('authentication token not valid', e);
                    this.setAuthenticatedUser();
                  }
                });
                return;
              }
              console.log('expired => check if we can renew', expiration);
              const renewExpiration = auth?.refreshTokenExpiresAt?.getTime();
              if (renewExpiration && renewExpiration > Date.now() - 10000) {
                this.scheduleTokenRenewal(Date.now(), auth);
                return;
              }
              console.log('renew token expired => no auth', renewExpiration);
            } catch (e) {
              console.log('cannot get authentication info', e);
            }
            this.setAuthenticatedUser();
          }
        );
      }
    });
  }

  private setAuthenticatedUser(auth?: AuthenticatedUserResponse): void {
    console.log('set authenticated user: ', auth);
    try {
      if (!auth) {
        this.authentication$.next(null);
      } else if (auth.accessTokenExpiresAt.getTime() > Date.now()) {
        this.scheduleTokenRenewal(auth.accessTokenExpiresAt.getTime() - 60000, auth);
        this.authentication$.next(auth);
        this.databaseService.get(auth.user.email + '_' + auth.user.tenantId).set(ACCOUNT_DB_AUTH_KEY, auth);
        this.saveKnownAccount(auth);
      } else if (auth.refreshTokenExpiresAt.getTime() > Date.now()) {
        this.scheduleTokenRenewal(Date.now(), auth);
      } else {
        this.authentication$.next(null);
      }
    } catch(error) {
      console.error(error);
      this.authentication$.next(null);
    }
  }

  /** Called by the tenant service, when retrieving a tenant by id returns not found. */
  public tenantDeleted(tenantId: string): void {
    this.getKnownAccounts$().subscribe(list => {
      const ids = [];
      for (const account of list) {
        if (account.tenantId === tenantId) {
          ids.push(account.id);
        }
      }
      if (ids.length > 0) this.removeKnownAccounts(ids);
    });
  }

  private addBearerToken(request: LcAntHttpRequest): Observable<LcAntHttpRequest> {
    if (request.url.startsWith(this.http.getApiBaseUrl() + 'api/')) {
      if (this.authentication$.value) {
        request.headers['Authorization'] = 'Bearer ' + this.authentication$.value.accessToken;
      } else {
        this.redirectUnauthorized();
        return EMPTY;
      }
    }
    return of(request);
  }

  private handle401Response(response: LcAntHttpResponse<any>): Observable<LcAntHttpResponse<any>> {
    if (response.status === 401 && response.request.url.indexOf('/public-api/auth/') < 0) {
      this.redirectUnauthorized();
      return EMPTY;
    }
    return of(response);
  }

  private redirectUnauthorized(): void {
    const queryParams = LcAntUtils.parseQueryParams(window.location.search);

    let url = this.router.routerState.snapshot.url;
    const i = url.indexOf('?');
    if (i > 0) url = url.substring(0, i);
    queryParams[this.config.returnUrlQueryParam] = url;
    this.router.navigate([this.config.unauthorizedRoute], { queryParams });
  }

  private renewTimeout: any;

  private scheduleTokenRenewal(at: number, auth: AuthenticatedUserResponse): void {
    console.log('Schedule token renewal at ' + new Date(at));
    if (this.renewTimeout) clearTimeout(this.renewTimeout);
    let timeout = at - Date.now();
    if (timeout < 1) timeout = 1;
    this.renewTimeout = setTimeout(() => {
      this.renewTimeout = undefined;
      this.renewToken(auth);
    }, timeout);
  }

  private renewToken(auth: AuthenticatedUserResponse): void {
    console.log('renew', auth);
    this.http.post<Partial<JwtResponse>>(this.http.getApiBaseUrl() + 'public-api/auth/v1/' + auth.user.tenantId + '/refreshToken', { accessToken: auth.accessToken, refreshToken: auth.refreshToken }).subscribe({
      next: response => {
        this.setAuthenticatedUser(AuthenticatedUserResponse.ofUpdatedJwt(auth, JwtResponse.of(response)));
      },
      error: e => {
        console.log(e);
        this.setAuthenticatedUser();
        this.redirectUnauthorized();
      }
    });
  }
}
