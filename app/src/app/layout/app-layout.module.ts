import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LcAntCoreModule } from '@lc-ant/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AppLayoutPageComponent } from './app-layout-page/app-layout-page.component';
import { AppLayoutRoutingModule } from './app-layout-routing.module';
import { LcAntNavigationModule } from '@lc-ant/navigation';
import { IonRouterOutlet } from '@ionic/angular/standalone';

@NgModule({
  declarations: [
    AppLayoutPageComponent,
    HeaderComponent,
  ],
  imports: [
    CommonModule,
    AppLayoutRoutingModule,
    LcAntCoreModule,
    LcAntNavigationModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatSidenavModule,
    IonRouterOutlet,
  ],
  exports: [
    AppLayoutPageComponent,
  ]
})
export class AppLayoutModule { }
