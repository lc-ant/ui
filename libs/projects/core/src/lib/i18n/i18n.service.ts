import { Inject, Injectable } from '@angular/core';
import { I18N_CONFIG, I18nConfig } from './i18n.config';
import { Locale } from './locale';
import { BehaviorSubject, Observable, catchError, filter, first, forkJoin, map, of } from 'rxjs';
import { HttpService } from '../http/http.service';
import { LcAntHttpRequest } from '../http/http-request';

const STORAGE_KEY_LOCALE = 'lc-ant-locale';

@Injectable({
  providedIn: 'root'
})
export class I18nService {

  private currentLocale: Locale;
  private nsMap = new Map<string, BehaviorSubject<any>>();

  constructor(
    @Inject(I18N_CONFIG) private config: I18nConfig,
    private http: HttpService,
  ) {
    this.currentLocale = this.detectLocale();
    this.localeChanged();
    http.addRequestInterceptor(r => this.addAcceptLanguageHeader(r));
  }

  public setLocale(locale: Locale): void {
    if (locale.language === this.currentLocale.language && locale.country === this.currentLocale.country && locale.variant === this.currentLocale.variant) return;
    this.currentLocale = locale;
    this.localeChanged();
  }

  public getValue(namespace: string, key: string, args?: any[]): Observable<string> {
    if (!namespace) {
      console.error(new Error('No namespace provided'));
      return of('?');
    }
    if (!key) {
      console.error(new Error('No key provided'));
      return of('?');
    }
    return this.loadNamespace(namespace)
    .pipe(
      map(ns => {
        const elements = key.split('.');
        let value = ns;
        for (const element of elements) {
          value = value[element];
          if (!value) break;
        }
        if (!value) {
          console.error('Missing key <' + key + '> in namespace <' + namespace + '> for locale ' + this.currentLocale.toString());
          return '?' + namespace + '.' + key + '?';
        }
        // TODO resolve with args
        return value;
      })
    );
  }

  public loadNamespaces(namespaces: string[]): Observable<void> {
    const loads: Observable<any>[] = [];
    for (const ns of namespaces) loads.push(this.loadNamespace(ns).pipe(first()));
    return forkJoin(loads).pipe(map(() => {}));
  }

  public loadNamespace(namespace: string): Observable<any> {
    let ns = this.nsMap.get(namespace);
    if (ns) return ns.pipe(filter(r => !!r));
    ns = new BehaviorSubject<any>(null);
    this.nsMap.set(namespace, ns);
    this._loadNamespace(namespace, ns);
    return ns.pipe(filter(r => !!r));
  }

  private _loadNamespace(namespace: string, result: BehaviorSubject<any>): void {
    const loads: Observable<any>[] = [];
    loads.push(this._loadFile(namespace + '_' + this.currentLocale.language + '.json'));
    if (this.currentLocale.country !== '') {
      loads.push(this._loadFile(namespace + '_' + this.currentLocale.language + '_' + this.currentLocale.country + '.json'));
      if (this.currentLocale.variant !== '') {
        loads.push(this._loadFile(namespace + '_' + this.currentLocale.language + '_' + this.currentLocale.country + '_' + this.currentLocale.variant + '.json'));
      }
    }
    forkJoin(loads).subscribe(loaded => {
      let r = loaded[0];
      for (let i = 1; i < loaded.length; ++i) {
        r = {...r, ...loaded[i]};
      }
      result.next(r);
    });
  }

  private _loadFile(filename: string): Observable<any> {
    console.log('i18n: loading ' + filename);
    return this.http.get(this.config.localizationFilesLocation + '/' + filename).pipe(
      catchError(err => {
        console.error('i18: error loading ' + filename, err);
        return of({});
      })
    );
  }

  private localeChanged(): void {
    console.log('Locale: ', this.currentLocale);
    document.documentElement.lang = this.currentLocale.language;
    localStorage.setItem(STORAGE_KEY_LOCALE, this.currentLocale.toString());
    // reload
    for (const ns of this.nsMap.entries()) {
      this._loadNamespace(ns[0], ns[1]);
    }
  }

  private detectLocale(): Locale {
    let l = this.getFromLocalStorage();
    if (l) return l;
    l = this.getFromDefaultNavigatorLanguage();
    if (l) return l;
    l = this.getFromNavigatorLanguages();
    if (l) return l;
    return Locale.fromString(this.config.defaultLocale);
  }

  private getLocale(s: string): Locale | undefined {
    const locale = Locale.fromString(s);
    if (this.config.availableLocales[locale.language]) return locale;
    return undefined;
  }

  private getFromLocalStorage(): Locale | undefined {
    const s = localStorage.getItem(STORAGE_KEY_LOCALE);
    if (!s) return undefined;
    return this.getLocale(s);
  }

  private getFromDefaultNavigatorLanguage(): Locale | undefined {
    return this.getLocale(navigator.language);
  }

  private getFromNavigatorLanguages(): Locale | undefined {
    for (const s of navigator.languages) {
      const l = this.getLocale(s);
      if (l) return l;
    }
    return undefined;
  }

  private addAcceptLanguageHeader(request: LcAntHttpRequest): Observable<LcAntHttpRequest> {
    request.headers['Accept-Language'] = this.currentLocale.toString();
    return of(request);
  }
}
