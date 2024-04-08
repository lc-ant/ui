import { Route } from '@angular/router';
import { Observable } from 'rxjs';
import { NavigationCategory } from './navigation-category';

export class NavigationElement {

  constructor(
    public path: string,
    public route: string,
    public config: Route,
    public label$: Observable<string>,
    public icon: string | undefined,
    public categoryId: string | undefined,
    public parentCategories: NavigationCategory[],
  ) {}

}
