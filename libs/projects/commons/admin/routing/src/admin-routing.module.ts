import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthService, TenantService } from '@lc-ant/core';
import { NavigationCategory, NavigationRoute } from '@lc-ant/navigation';
import { map } from 'rxjs';

const routes: Routes = [
  {
    path: '',
    data: {
      navigationCategories: <NavigationCategory[]>[
        {
          id: 'platform',
          labelNS: 'admin',
          labelKey: 'nav.categories.platform'
        }, {
          id: 'current-tenant',
          labelProvider$: (injector) => injector.get(TenantService).tenant$.pipe(map(tenant => tenant?.displayName)),
          hideLevel$: (injector) => injector.get(AuthService).authentication$.pipe(map(auth => !auth?.isRoot())),
          subCategories: [{
            id: 'current-tenant-general-admin',
            labelNS: 'admin',
            labelKey: 'nav.categories.current-tenant.general-admin'
          }]
        }
      ]
    },
    children: [
      {
        path: '',
        loadComponent: () => import('@lc-ant/commons/components/navigation-page').then(m => m.NavigationPageComponent),
      },
      {
        path: 'tenant',
        loadChildren: () => import('@lc-ant/commons/admin/tenant').then(m => m.AdminTenantModule),
        canActivate: [() => inject(AuthService).hasPermission$('tenant', 'read')],
        data: {
          navigation: <NavigationRoute>{
            hasBreadcrumb: true,
            hasMenu: true,
            labelNS: 'admin',
            labelKey: 'nav.tenant',
            icon: 'domain',
            categoryId: 'platform'
          }
        }
      },
      {
        path: 'users',
        loadChildren: () => import('@lc-ant/commons/admin/users').then(m => m.AdminUsersModule),
        canActivate: [() => inject(AuthService).hasPermission$('user', 'read')],
        data: {
          navigation: <NavigationRoute>{
            hasBreadcrumb: true,
            hasMenu: true,
            labelNS: 'admin',
            labelKey: 'nav.users',
            icon: 'group',
            categoryId: 'current-tenant-general-admin'
          }
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
