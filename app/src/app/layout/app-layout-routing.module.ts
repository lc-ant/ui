import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayoutPageComponent } from './app-layout-page/app-layout-page.component';
import { NavigationRoute } from '@lc-ant/navigation';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutPageComponent,
    data: {
      navigation: <NavigationRoute>{
        hasBreadcrumb: true,
        hasMenu: true,
        icon: 'home',
        labelNS: 'app',
        labelKey: 'nav.home',
        route: 'home',
      }
    },
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule),
      },
      {
        path: 'admin',
        loadChildren: () => import('@lc-ant/commons/admin/routing').then(m => m.AdminRoutingModule),
        data: {
          navigation: <NavigationRoute>{
            hasBreadcrumb: true,
            hasMenu: true,
            labelNS: 'admin',
            labelKey: 'nav.root',
            icon: 'settings'
          }
        }
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppLayoutRoutingModule {}
