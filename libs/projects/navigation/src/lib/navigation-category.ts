import { Injector } from '@angular/core';
import { Observable } from 'rxjs';

export interface NavigationCategory {
  id: string;
  labelNS?: string;
  labelKey?: string;
  label?: string;
  labelProvider$?: (injector: Injector) => Observable<string>;
  icon?: string;
  hideLevel$?: (injector: Injector) => Observable<boolean>;
  subCategories?: NavigationCategory[];
}
