import { NgModule, inject } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthService } from '@lc-ant/core';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: '_',
    canActivate: [() => inject(AuthService).guardAuthenticated()],
    loadChildren: () => import('./layout/app-layout.module').then(m => m.AppLayoutModule),
  },
  {
    path: '',
    redirectTo: '/_/home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
