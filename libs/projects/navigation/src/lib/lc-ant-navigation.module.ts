import { NgModule } from '@angular/core';
import { LcAntCoreModule } from '@lc-ant/core';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [
    BreadcrumbComponent,
    MenuComponent,
  ],
  imports: [
    LcAntCoreModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatExpansionModule,
  ],
  exports: [
    BreadcrumbComponent,
    MenuComponent,
  ]
})
export class LcAntNavigationModule { }
