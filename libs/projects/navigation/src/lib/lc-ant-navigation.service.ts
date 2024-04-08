import { Injectable, Injector } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Params, Route, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { BehaviorSubject, Observable, first, forkJoin, map, of, switchMap } from 'rxjs';
import { NavigationElement } from './navigation-element';
import { NavigationRoute } from './navigation-route';
import { I18nService } from '@lc-ant/core';
import { PathLocationStrategy } from '@angular/common';
import { NavigationCategory } from './navigation-category';

@Injectable({
  providedIn: 'root'
})
export class LcAntNavigationService {

  public breadcrumb$ = new BehaviorSubject<NavigationElement[]>([]);
  public menuParents$ = new BehaviorSubject<NavigationElement[]>([]);
  public currentElement$ = new BehaviorSubject<NavigationElement | undefined>(undefined);

  public route$: BehaviorSubject<RouterStateSnapshot>;
  public routeParams$: Observable<Params>;

  constructor(
    private injector: Injector,
    private router: Router,
    private locationStrategy: PathLocationStrategy,
    private i18n: I18nService,
  ) {
    this.route$ = new BehaviorSubject<RouterStateSnapshot>(this.router.routerState.snapshot);
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const routeParams = this.collectRouteParams(router.routerState.snapshot.root);
        //this.log(router.routerState.root, '', 0, routeParams);
        // breadcrumb
        this.breadcrumb$.next(this.buildElements(router.routerState.root, '', routeParams, [], routeNav => routeNav.hasBreadcrumb));
        // menu
        const parents = this.buildElements(router.routerState.root, '', routeParams, [], routeNav => routeNav.hasMenu);
        let current = undefined;
        if (parents.length > 0) {
          current = parents[parents.length - 1];
          parents.splice(parents.length - 1, 1);
        }
        this.menuParents$.next(parents);
        this.currentElement$.next(current);
        // route
        this.route$.next(this.router.routerState.snapshot);
      }
    });
    this.routeParams$ = this.route$.pipe(
      map(snapshot => this.collectRouteParams(snapshot.root))
    );
  }

  /*
  private log(route: ActivatedRoute, path: string, indent: number, routeParams: Params): void {
    let s = '';
    for (let i = 0; i < indent; ++i) s += ' - ';
    const newPath = this.getPath(path, route.routeConfig?.path, routeParams);
    console.log(s + ' > ' + newPath, route.routeConfig);
    for (const child of route.children) {
      this.log(child, newPath, indent + 1, routeParams);
    }
  }*/

  private buildElements(route: ActivatedRoute, path: string, routeParams: Params, parentCategories: NavigationCategory[], filter: (routeNav: NavigationRoute) => boolean): NavigationElement[] {
    const newPath = this.getPath(path, route.routeConfig?.path, routeParams);
    const result: NavigationElement[] = [];
    const routeNav = this.getNavigationRoute(route.routeConfig);
    if (routeNav && filter(routeNav)) {
      result.push(this.buildElement(routeNav, route.routeConfig!, '/' + newPath, routeParams, parentCategories));
    }
    const categories = this.getNavigationCategories(route.routeConfig);
    for (const child of route.children) {
      const subElements = this.buildElements(child, newPath, routeParams, categories, filter);
      if (subElements.length > 0) {
        result.push(...subElements);
        break;
      }
    }
    return result;
  }

  private getNavigationRoute(route: Route | null | undefined): NavigationRoute | undefined {
    const routeData = route?.data;
    return routeData ? routeData['navigation'] : undefined;
  }

  private getNavigationCategories(route: Route | null | undefined): NavigationCategory[] {
    const routeData = route?.data;
    const categories: NavigationCategory[] | undefined = routeData ? routeData['navigationCategories'] : undefined;
    if (categories) {
      categories.forEach(category => this._ensureCategoryLabelProvider(category));
      return categories;
    }
    return [];
  }

  private _ensureCategoryLabelProvider(category: NavigationCategory): void {
    if (category.label) category.labelProvider$ = () => of(category.label!);
    else if (category.labelKey && category.labelNS) category.labelProvider$ = (injector: Injector) => injector.get(I18nService).getValue(category.labelNS!, category.labelKey!);
    else if (!category.labelProvider$) category.labelProvider$ = () => of('! no label !');
    if (category.subCategories) {
      for (const sub of category.subCategories) {
        this._ensureCategoryLabelProvider(sub);
      }
    }
  }

  private getPath(currentPath: string, routePath: string | undefined, routeParams: Params): string {
    if (!routePath) return currentPath;
    if (routePath.length === 0) return currentPath;
    if (currentPath.length === 0) return this.resolvePathWithParams(routePath, routeParams);
    return currentPath + '/' + this.resolvePathWithParams(routePath, routeParams);
  }

  private resolvePathWithParams(path: string, routeParams: Params): string {
    if (path.length === 0) return '';
    const elements = path.split('/');
    for (let i = 0; i < elements.length; ++i) {
      if (elements[i].startsWith(':')) {
        const paramName = elements[i].substring(1);
        if (routeParams[paramName]) elements[i] = routeParams[paramName];
      }
    }
    return elements.join('/');
  }

  private buildElement(route: NavigationRoute, config: Route, path: string, routeParams: Params, parentCategories: NavigationCategory[]): NavigationElement {
    let label$: Observable<string>;
    if (route.label) {
      label$ = of(route.label);
    } else if (route.labelNS && route.labelKey) {
      label$ = this.i18n.getValue(route.labelNS, route.labelKey);
    } else if (route.labelProvider$) {
      label$ = route.labelProvider$(this.injector);
    } else {
      label$ = of('! no label configured on NavigationRoute !');
    }
    return new NavigationElement(
      path,
      route.route ? this.getPath(path, route.route, routeParams) : path,
      config,
      label$,
      route.icon,
      route.categoryId,
      parentCategories,
    );
  }

  public resolveLink(currentRoute: ActivatedRoute, link: string): string {
    const url = this.router.createUrlTree([link], {
      relativeTo: currentRoute
    });
    return this.locationStrategy.prepareExternalUrl(this.router.serializeUrl(url));
  }

  private collectRouteParams(route: ActivatedRouteSnapshot): Params {
    let params: Params = {...route.params};
    for (const child of route.children) {
      params = {...params, ...this.collectRouteParams(child)};
    }
    return params;
  }


  public getChildren(element: NavigationElement): NavigationElement[] {
    //console.log('getChildren', element);
    return this._getChildren(element.config, element.path);
  }

  private _getChildren(route: Route, path: string): NavigationElement[] {
    const subRoutes: Routes = route.children || (<any>route)._loadedRoutes;
    if (!subRoutes) return [];
    const children: NavigationElement[] = [];
    const routeParams = this.collectRouteParams(this.router.routerState.snapshot.root);
    const categories = this.getNavigationCategories(route);
    for (const subRoute of subRoutes) {
      const routeNav = this.getNavigationRoute(subRoute);
      if (routeNav) {
        children.push(this.buildElement(routeNav, subRoute, this.getPath(path, subRoute.path, routeParams), routeParams, categories));
      }
    }
    if (children.length > 0) return children;
    for (const subRoute of subRoutes) {
      if (subRoute.path === '') {
        return this._getChildren(subRoute, path);
      }
    }
    return [];
  }

  public getAccessibleNavigationFrom(element: NavigationElement): Observable<AccessibleNavigation> {
    const children = element ? this.getChildren(element) : [];
      const categories: NavigationCategory[] = [];
      for (const child of children) {
        for (const cat of child.parentCategories) {
          if (categories.findIndex(c => c.id === cat.id) < 0) {
            categories.push(cat);
          }
        }
      }
      const catMap = new Map<string, CategoryLevel>();
      const newCategories: CategoryLevel[] = [];
      const newRoot: NavigationElement[] = [];
      this._buildCategoryLevel(categories, newCategories, catMap);
      this._assignElementsToCategories(catMap, children, newRoot);
      this._removeEmptyCategories(newCategories);
      return this._hideLevels(newCategories, newRoot).pipe(
        map(() => new AccessibleNavigation(newCategories, newRoot))
      );
  }

  private _buildCategoryLevel(list: NavigationCategory[], output: CategoryLevel[], map: Map<string, CategoryLevel>): void {
    for (const category of list) {
      const level = new CategoryLevel(category);
      output.push(level);
      map.set(category.id, level);
      if (category.subCategories) {
        this._buildCategoryLevel(category.subCategories, level.subCategories, map);
      }
    }
  }

  private _assignElementsToCategories(map: Map<string, CategoryLevel>, elements: NavigationElement[], noCategory: NavigationElement[]): void {
    for (const element of elements) {
      const catId = element.categoryId;
      const cat = catId ? map.get(catId) : undefined;
      if (cat) {
        cat.elements.push(element);
      } else {
        noCategory.push(element);
      }
    }
  }

  private _removeEmptyCategories(categories: CategoryLevel[]): void {
    for (let i = 0; i < categories.length; ++i) {
      const cat = categories[i];
      this._removeEmptyCategories(cat.subCategories);
      if (cat.subCategories.length === 0 && cat.elements.length === 0) {
        categories.splice(i, 1);
        i--;
      }
    }
  }

  private _hideLevels(levels: CategoryLevel[], parentElements: NavigationElement[]): Observable<CategoryLevel[]> {
    if (levels.length === 0) return of([]);
    return forkJoin(levels.map(level => this._hideLevels(level.subCategories, level.elements))).pipe(
      switchMap(() =>
        forkJoin(levels.map(level => level.category.hideLevel$ ? level.category.hideLevel$(this.injector).pipe(first()) : of(false))).pipe(
          map(toHide => {
            let iLevels = 0;
            for (const hide of toHide) {
              if (hide) {
                const level = levels[iLevels];
                levels.splice(iLevels, 1, ...level.subCategories);
                parentElements.push(...level.elements);
              } else {
                iLevels++;
              }
            }
            return levels;
          })
        )
      )
    )
  }

}

export class CategoryLevel {

  public subCategories: CategoryLevel[] = [];
  public elements: NavigationElement[] = [];

  constructor(
    public category: NavigationCategory
  ) {}
}

export class AccessibleNavigation {
  constructor(
    public categories: CategoryLevel[] = [],
    public rootElements: NavigationElement[] = [],
  ) {}
}
