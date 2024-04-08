import { Component, Injector, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AbstractComponent } from '@lc-ant/core';

@Component({
  selector: 'app-app-layout-page',
  templateUrl: './app-layout-page.component.html',
  styleUrls: ['./app-layout-page.component.scss'],
})
export class AppLayoutPageComponent extends AbstractComponent {

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

}
