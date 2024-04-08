import { Injector, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantListPageComponent } from './pages/tenant-list-page/tenant-list-page.component';
import { TenantPageComponent } from './pages/tenant-page/tenant-page.component';
import { TenantGeneralInfoPageComponent } from './pages/tenant-general-info-page/tenant-general-info-page.component';
import { NewTenantPageComponent } from './pages/new-tenant-page/new-tenant-page.component';
import { LcAntNavigationService, NavigationRoute } from '@lc-ant/navigation';
import { AdminTenantService } from './admin-tenant.service';
import { EMPTY, map, mergeMap } from 'rxjs';
import { Tenant } from '@lc-ant/core';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: TenantListPageComponent,
      },
      {
        path: 'new-tenant',
        component: NewTenantPageComponent,
        data: {
          navigation: <NavigationRoute>{
            hasBreadcrumb: true,
            hasMenu: true,
            labelNS: 'admin-tenant',
            labelKey: 'new tenant'
          }
        }
      },
      {
        path: 'tenant/:tenantId',
        component: TenantPageComponent,
        data: {
          navigation: <NavigationRoute>{
            hasBreadcrumb: true,
            hasMenu: true,
            labelProvider$: (injector: Injector) =>
              injector.get(LcAntNavigationService).routeParams$.pipe(
                mergeMap(params => {
                  const tenantId = params['tenantId'];
                  if (!tenantId) return EMPTY;
                  return injector.get(AdminTenantService).getById(tenantId).item$;
                }),
                map(tenant => tenant instanceof Tenant ? tenant.displayName : '')
              )
          }
        },
        children: [
          {
            path: 'general-info',
            component: TenantGeneralInfoPageComponent,
            data: {
              navigation: <NavigationRoute>{
                hasBreadcrumb: true,
                hasMenu: true,
                labelNS: 'admin-tenant',
                labelKey: 'nav.general-info',
              }
            },
          },
          {
            path: '',
            redirectTo: 'general-info',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminTenantRoutingModule { }
