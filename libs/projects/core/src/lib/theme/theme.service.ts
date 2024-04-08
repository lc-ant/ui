import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEY = 'lc-ant-theme';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light'
}

export enum ThemeType {
  DARK = 'dark',
  LIGHT = 'light',
  SYSTEM = 'system'
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private _systemTheme: Theme;
  private _theme$ = new BehaviorSubject<Theme>(Theme.LIGHT);
  private _themeType$ = new BehaviorSubject<ThemeType>(ThemeType.SYSTEM);

  constructor() {
    this._systemTheme = this.getThemeFromString(document.documentElement.computedStyleMap().get('--lca-system-theme')?.toString()) ?? Theme.LIGHT;
    this.theme = this.getThemeTypeFromString(localStorage.getItem(STORAGE_KEY)) ?? ThemeType.SYSTEM;
  }

  public get theme$(): Observable<Theme> {
    return this._theme$;
  }

  public set theme(themeType: ThemeType) {
    if (this._themeType$.value === themeType) return;
    localStorage.setItem(STORAGE_KEY, themeType);
    const theme = this.getThemeFromType(themeType);
    this.applyTheme(theme);
    this._themeType$.next(themeType);
    this._theme$.next(theme);
  }

  private getThemeFromType(type: ThemeType): Theme {
    if (type === ThemeType.SYSTEM) return this._systemTheme;
    if (type == ThemeType.LIGHT) return Theme.LIGHT;
    if (type == ThemeType.DARK) return Theme.DARK;
    return this._systemTheme;
  }

  private getThemeFromString(theme: string | null | undefined): Theme | undefined {
    if (theme === 'dark') return Theme.DARK;
    if (theme === 'light') return Theme.LIGHT;
    return undefined;
  }

  private getThemeTypeFromString(theme: string | null | undefined): ThemeType | undefined {
    if (theme === 'dark') return ThemeType.DARK;
    if (theme === 'light') return ThemeType.LIGHT;
    if (theme === 'system') return ThemeType.SYSTEM;
    return undefined;
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.classList.remove('lca-theme-light');
    document.documentElement.classList.remove('lca-theme-dark');
    document.documentElement.classList.add('lca-theme-' + theme);
  }

}
