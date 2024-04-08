import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersManagementPageComponent } from './pages/users-management-page/users-management-page.component';
const routes: Routes = [
  {
    path: '',
    component: UsersManagementPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminUsersRoutingModule { }
