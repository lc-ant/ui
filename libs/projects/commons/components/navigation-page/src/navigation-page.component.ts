import { Component, Injector } from '@angular/core';
import { AbstractComponent } from '@lc-ant/core';
import { NavigationItemComponent, NavigationItemViewType } from '@lc-ant/commons/components/navigation-item';
import { AccessibleNavigation, LcAntNavigationModule, LcAntNavigationService, NavigationElement } from '@lc-ant/navigation';
import { CommonModule } from '@angular/common';
import { IonCol, IonGrid, Platform } from '@ionic/angular/standalone';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggle, MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'lc-ant-commons-navigation-page',
  templateUrl: './navigation-page.component.html',
  styleUrl: './navigation-page.component.scss',
  standalone: true,
  imports: [
    LcAntNavigationModule,
    NavigationItemComponent,
    CommonModule,
    IonGrid,
    IonCol,
    MatToolbarModule,
    MatIconModule,
    MatButtonToggleModule,
  ]
})
export class NavigationPageComponent extends AbstractComponent {

  element?: NavigationElement;
  navigation?: AccessibleNavigation;

  viewType: NavigationItemViewType = NavigationItemViewType.SMALL_ROW;
  userViewType?: NavigationItemViewType;
  platformLarge = false;

  constructor(
    injector: Injector,
    private nav: LcAntNavigationService,
    private platform: Platform,
  ) {
    super(injector);
  }

  protected override _init(): void {
    this.subscriptionsVisible.subscribe(this.nav.currentElement$, element => {
      this.element = element;
      this.navigation = undefined;
      if (element) {
        this.nav.getAccessibleNavigationFrom(element).subscribe(an => {
          if (this.element === element) this.navigation = an;
        });
      }
    });
    this.updatePlatformSize();
    this.subscriptionsAlive.add(this.platform.resize.subscribe(() => this.updatePlatformSize()));
  }

  private updatePlatformSize(): void {
    this.platformLarge = this.platform.width() >= 600 && this.platform.height() >= 600;
    this.viewType = this.userViewType ?? (this.platformLarge ? NavigationItemViewType.LARGE_BADGE : NavigationItemViewType.SMALL_BADGE);
  }

  selectViewType(viewType: MatButtonToggleChange): void {
    this.userViewType = viewType.value;
    this.viewType = this.userViewType!;
  }

}
