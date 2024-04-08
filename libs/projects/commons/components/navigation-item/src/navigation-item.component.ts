import { CommonModule } from '@angular/common';
import { Component, Injector, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AbstractComponent } from '@lc-ant/core';

export enum NavigationItemViewType {
  SMALL_ROW = 'small-row',
  SMALL_BADGE = 'small-badge',
  LARGE_BADGE = 'large-badge'
}

@Component({
  selector: 'lc-ant-commons-navigation-item',
  templateUrl: './navigation-item.component.html',
  styleUrl: './navigation-item.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ]
})
export class NavigationItemComponent extends AbstractComponent {

  @Input()
  public label?: string;

  @Input()
  public icon?: string;

  @Input()
  public route?: string;

  @Input()
  public view: NavigationItemViewType = NavigationItemViewType.LARGE_BADGE;

  constructor(
    injector: Injector,
    private router: Router,
  ) {
    super(injector);
  }

  open(): void {
    if (this.route) this.router.navigateByUrl(this.route);
  }

}
