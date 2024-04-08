import { Component, Injector, ViewChild } from '@angular/core';
import { AbstractComponent, Tenant } from '@lc-ant/core';
import { LcAntNavigationService } from '@lc-ant/navigation';
import { EMPTY, switchMap } from 'rxjs';
import { AdminTenantService } from '../../admin-tenant.service';
import { Location } from '@angular/common';
import { DialogErrorComponent } from '@lc-ant/commons/components/dialogs';
import { TenantFormComponent } from '../../components/tenant-form/tenant-form.component';

@Component({
  selector: 'lc-ant-commons-tenant-general-info-page',
  templateUrl: './tenant-general-info-page.component.html',
  styleUrl: './tenant-general-info-page.component.scss'
})
export class TenantGeneralInfoPageComponent extends AbstractComponent {

  public tenant?: Tenant;

  tenantUpdated?: Tenant;
  saving = false;

  @ViewChild('form') form?: TenantFormComponent;

  constructor(
    injector: Injector,
    navigationService: LcAntNavigationService,
    private service: AdminTenantService,
    private location: Location,
  ) {
    super(injector);
    this.subscriptionsVisible.subscribe(
      navigationService.routeParams$.pipe(
        switchMap(params => {
          if (!params['tenantId']) return EMPTY;
          return service.getById(params['tenantId']).item$;
        })
      ),
      item => {
        if (item instanceof Tenant) {
          this.tenant = item;
        } else {
          this.tenant = undefined;
        }
      }
    );
  }

  tenantChanged(tenantUpdated: Tenant): void {
    this.tenantUpdated = tenantUpdated;
  }

  canSave(): boolean {
    return !!this.tenantUpdated && !!this.tenant && !this.tenantUpdated.isEqual(this.tenant) && !!this.form?.isValid();
  }

  save(): void {
    this.saving = true;
    DialogErrorComponent.catch(this.injector, this.service.update(this.tenantUpdated!)).subscribe({
      next: () => this.saving = false,
      error: () => this.saving = false
    });
  }

}
