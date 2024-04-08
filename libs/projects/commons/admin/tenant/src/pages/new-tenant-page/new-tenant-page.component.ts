import { Component, Injector, ViewChild } from '@angular/core';
import { AbstractComponent, Tenant } from '@lc-ant/core';
import { AdminTenantService } from '../../admin-tenant.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogErrorComponent } from '@lc-ant/commons/components/dialogs';
import { TenantFormComponent } from '../../components/tenant-form/tenant-form.component';

@Component({
  selector: 'lc-ant-commons-new-tenant-page',
  templateUrl: './new-tenant-page.component.html',
  styleUrl: './new-tenant-page.component.scss'
})
export class NewTenantPageComponent extends AbstractComponent {

  tenant = Tenant.of({});
  saving = false;
  tenantUpdated?: Tenant;

  @ViewChild('form') form?: TenantFormComponent;

  constructor(
    injector: Injector,
    private service: AdminTenantService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super(injector);
  }

  tenantChanged(tenantUpdated: Tenant): void {
    this.tenantUpdated = tenantUpdated;
  }

  canSave(): boolean {
    return !!this.tenantUpdated && !!this.form?.isValid();
  }

  save(): void {
    this.saving = true;
    DialogErrorComponent.catch(this.injector, this.service.create(this.tenantUpdated!))
    .subscribe({
      next: created => {
        this.saving = false;
        this.tenant = Tenant.of({});
        this.tenantUpdated = undefined;
        this.router.navigate(['../list'], { relativeTo: this.route });
      },
      error: () => this.saving = false
    });
  }

}
