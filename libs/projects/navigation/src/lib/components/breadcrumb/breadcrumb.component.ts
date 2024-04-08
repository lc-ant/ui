import { Component } from '@angular/core';
import { LcAntNavigationService } from '../../lc-ant-navigation.service';
import { NavigationElement } from '../../navigation-element';
import { Observable } from 'rxjs';

@Component({
  selector: 'lc-ant-navigation-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {

  breadcrumb$: Observable<NavigationElement[]>;

  constructor(
    service: LcAntNavigationService
  ) {
    this.breadcrumb$ = service.breadcrumb$;
  }

}
