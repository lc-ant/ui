import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractComponent, ApiError, AuthService, I18nService, KnownAccount, LcAntUtils, Locale, Tenant, TenantService, ThemeService, ThemeType, emailValidation } from '@lc-ant/core';
import { EMPTY, catchError, defaultIfEmpty, forkJoin } from 'rxjs';

class Account {
  constructor(
    public id: number,
    public username: string,
    public email: string,
    public tenant: Tenant
  ) {}
}

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage extends AbstractComponent {

  accounts?: Account[];

  tenant: Tenant | null | undefined;

  inputEmail = '';
  inputEmailError?: string;

  authMode?: string;

  inputUsername = '';
  inputPassword = '';
  inputUsernameAndPasswordError?: string;

  loading = false;

  LIGHT_THEME = ThemeType.LIGHT;
  DARK_THEME = ThemeType.DARK;
  SYSTEM_THEME = ThemeType.SYSTEM;

  constructor(
    injector: Injector,
    private authService: AuthService,
    private tenantService: TenantService,
    private router: Router,
    private themeService: ThemeService,
    private i18nService: I18nService,
  ) {
    super(injector);
  }

  protected override _getState(): any[] {
    return [this.isVisible$.value];
  }

  protected override _refreshComponent(): void {
    this.accounts = undefined;
    this.tenant = undefined;
    this.authMode = undefined;
    this.resetLoginInfo();
    this.loading = false;
    this.authService.getKnownAccounts$().subscribe(list => {
      if (this.accounts) return;
      const tenantsIds = LcAntUtils.distinct(list.map(acc => acc.tenantId));
      forkJoin(tenantsIds.map(id =>
        this.tenantService.getTenantById(id).pipe(
          catchError(e => {
            console.log(e);
            return EMPTY;
          }),
          defaultIfEmpty(null)
        )
      )).subscribe(
        existingTenants => {
          if (this.accounts) return;
          this.accounts = [];
          for (const ka of list) {
            const tenant = existingTenants.find(t => t && t.id === ka.tenantId);
            if (tenant) this.accounts.push(new Account(ka.id, ka.username, ka.email, tenant));
          }
          console.log('accounts', this.accounts);
          if (this.accounts.length === 0) {
            this.authMode = 'from-email';
          } else if (this.accounts.length === 1) {
            this.chooseAccount(this.accounts[0]);
          } else {
            this.authMode = 'choose-account';
          }
        }
      );
    });
    this.subscriptionsRefresh.add(this.tenantService.tenant$.subscribe(tenant => this.tenant = tenant));
    this.subscriptionsRefresh.add(this.authService.user$.subscribe(user => {
      if (user) this.loginSuccess();
    }));
  }

  private resetLoginInfo(): void {
    this.inputPassword = '';
    this.inputEmailError = undefined;
    this.inputUsernameAndPasswordError = undefined;
  }

  inputEmailValid(): boolean {
    return this.inputEmail.length > 0 && emailValidation.test(this.inputEmail);
  }

  checkInputEmail(): void {
    console.log('check');
    if (!this.inputEmailValid()) this.inputEmailError = 'errors.invalid-email';
    else this.inputEmailError = undefined;
  }

  validateInputEmail(): boolean {
    this.loading = true;
    this.authService.searchEmail(this.inputEmail).subscribe({
      next: user => {
        this.selectWithTenantId(user.username, user.email, user.tenantId);
      },
      error: (err: ApiError) => {
        if (err.httpCode === 404) {
          this.inputEmailError = 'errors.unknown-email';
        } else {
          console.error(err);
          this.inputEmailError = 'errors.internal-error';
        }
        this.loading = false;
      }
    });
    return false;
  }

  private selectWithTenantId(username: string, email: string, tenantId: string): void {
    this.loading = true;
    this.tenantService.setTenantId(tenantId).subscribe({
      next: tenant => {
        if (tenant) {
          this.selectWithTenant(username, email, tenant);
        }
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.inputEmail = email;
        this.inputEmailError = 'errors.internal-error';
        this.authMode = 'from-email';
        this.loading = false;
      }
    });
  }

  private selectWithTenant(username: string, email: string, tenant: Tenant): void {
    this.inputUsername = username;
    this.inputEmail = email;
    this.tenant = tenant;
    this.authMode = 'internal'; // TODO
  }

  chooseAccount(account: Account): void {
    this.selectWithTenant(account.username, account.email, account.tenant);
  }

  inputUsernameAndPasswordValid(): boolean {
    return this.inputUsername.length > 0 && this.inputPassword.length > 0;
  }

  validateInputUsernameAndPassword(): boolean {
    this.loading = true;
    this.authService.authenticateWithUsernameAndPassword(this.tenant!.id, this.inputUsername, this.inputPassword).subscribe({
      next: () => {},
      error: (err: ApiError) => {
        if (err.httpCode === 401) {
          this.inputUsernameAndPasswordError = 'errors.invalid-credentials';
        } else {
          console.error(err);
          this.inputUsernameAndPasswordError = 'errors.internal-error';
        }
        this.loading = false;
      }
    });
    this.inputPassword = '';
    return false;
  }

  private loginSuccess(): void {
    this.loading = false;
    const queryParams: any = {...this.queryParams};
    let url = queryParams['returnUrl'];
    if (url === undefined || url.startsWith('/login')) {
      url = '/';
    } else {
      delete queryParams['returnUrl'];
    }
    this.router.navigate([url], { queryParams });
  }

  switchAccount(): void {
    this.resetLoginInfo();
    if (this.accounts!.length < 2) {
      this.authMode = 'from-email';
    } else {
      this.authMode = 'choose-account';
    }
  }

  setTheme(theme: ThemeType): void {
    this.themeService.theme = theme;
  }

  setLocale(locale: string): void {
    this.i18nService.setLocale(Locale.fromString(locale));
  }

}
