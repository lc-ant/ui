import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePage } from './home.page';
import { NavigationPageComponent } from '@lc-ant/commons/components/navigation-page';
import { HomePageRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    CommonModule,
    HomePageRoutingModule,
    NavigationPageComponent,
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
