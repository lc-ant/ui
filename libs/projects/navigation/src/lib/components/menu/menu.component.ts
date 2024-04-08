import { Component, Injector } from '@angular/core';
import { AccessibleNavigation, LcAntNavigationService } from '../../lc-ant-navigation.service';
import { NavigationElement } from '../../navigation-element';

@Component({
  selector: 'lc-ant-navigation-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  parents: NavigationElement[] = [];
  current?: NavigationElement;
  navigation?: AccessibleNavigation;

  constructor(
    public injector: Injector,
    private nav: LcAntNavigationService
  ) {
    nav.currentElement$.subscribe(element => {
      this.current = element;
      this.navigation = undefined;
      if (element) {
        this.nav.getAccessibleNavigationFrom(element).subscribe(n => this.navigation = n);
      }
    });
    nav.menuParents$.subscribe(parents => this.parents = parents);
  }


}
