import { Injector } from '@angular/core';
import { Observable } from 'rxjs';

export interface NavigationRoute {

  labelNS?: string;
  labelKey?: string;
  label?: string;
  labelProvider$?: (injector: Injector) => Observable<string>;
  icon?: string;
  route?: string;
  hasMenu: boolean;
  hasBreadcrumb: boolean;
  subElements$?: (injector: Injector) => Observable<NavigationRoute[]>;
  categoryId?: string;

}
