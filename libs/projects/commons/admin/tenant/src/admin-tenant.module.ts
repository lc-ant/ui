import { NgModule } from '@angular/core';
import { AdminTenantRoutingModule } from './admin-tenant-routing.module';
import { TenantPageComponent } from './pages/tenant-page/tenant-page.component';
import { TenantListComponent } from './components/tenant-list/tenant-list.component';
import { CommonModule } from '@angular/common';
import { TenantListPageComponent } from './pages/tenant-list-page/tenant-list-page.component';
import { TenantFormComponent } from './components/tenant-form/tenant-form.component';
import { TenantGeneralInfoPageComponent } from './pages/tenant-general-info-page/tenant-general-info-page.component';
import { NewTenantPageComponent } from './pages/new-tenant-page/new-tenant-page.component';
import { DataTableComponent } from '@lc-ant/commons/components/data-table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LcAntCoreModule } from '@lc-ant/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { IonGrid, IonRow, IonCol, IonRouterOutlet } from '@ionic/angular/standalone';
import { DialogConfirmComponent, DialogErrorComponent } from '@lc-ant/commons/components/dialogs';

@NgModule({
  declarations: [
    TenantListPageComponent,
    TenantPageComponent,
    TenantGeneralInfoPageComponent,
    NewTenantPageComponent,
    TenantListComponent,
    TenantFormComponent,
  ],
  imports: [
    AdminTenantRoutingModule,
    CommonModule,
    LcAntCoreModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    DataTableComponent,
    DialogConfirmComponent,
    DialogErrorComponent,
    IonGrid,
    IonRow,
    IonCol,
    IonRouterOutlet,
  ],
  exports: [
  ]
})
export class AdminTenantModule {

}
