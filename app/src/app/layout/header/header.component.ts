import { Component, ElementRef, EventEmitter, Injector, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractComponent, AuthService, I18nService, Locale, Theme, ThemeService, ThemeType, User } from '@lc-ant/core';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends AbstractComponent {

  user?: User;
  color$: Observable<string>;

  LIGHT_THEME = ThemeType.LIGHT;
  DARK_THEME = ThemeType.DARK;
  SYSTEM_THEME = ThemeType.SYSTEM;

  @Output()
  public menuToggle = new EventEmitter<any>();

  constructor(
    injector: Injector,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private i18nService: I18nService,
  ) {
    super(injector);
    this.color$ = themeService.theme$.pipe(map(theme => theme === Theme.DARK ? '' : 'primary'));
  }

  protected override _init(): void {
    this.subscriptionsVisible.subscribe(this.authService.authentication$, auth => this.user = auth?.user);
  }

  getAvatar(): string {
    if (!this.user) return '';
    let url = 'https://ui-avatars.com/api/?rounded=true&size=40';
    let fn = this.user.firstName;
    let ln = this.user.lastName;
    let fnParts = fn.split(/(\s+|\-)/);
    let lnParts = ln.split(/(\s+|\-)/);
    if (fnParts.length + lnParts.length <= 3) {
      url += '&name=' + encodeURIComponent(fnParts.join(' ') + ' ' + lnParts.join(' '));
      url += '&length=' + (fnParts.length + lnParts.length);
    } else if (fnParts.length > 1 && lnParts.length == 1) {
      url += '&name=' + encodeURIComponent(fnParts.slice(0, 2).join(' ') + ' ' + lnParts[0]) + '&length=3';
    } else if (fnParts.length == 1) {
      url += '&name=' + encodeURIComponent(fnParts[0] + ' ' + lnParts.slice(0, 2).join(' ')) + '&length=3';
    } else {
      url += '&name=' + encodeURIComponent(fn + ' ' + ln) + '&length=2';
    }
    return url;
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.menuToggle.emit(null);
  }

  goHome(): void {
    this.router.navigateByUrl('/_/home');
  }

  setTheme(theme: ThemeType): void {
    this.themeService.theme = theme;
  }

  setLocale(locale: string): void {
    this.i18nService.setLocale(Locale.fromString(locale));
  }

}
