import { Component, Injector, ViewChild } from '@angular/core';
import { AbstractComponent, AuthService, Tenant } from '@lc-ant/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminTenantService } from '../../admin-tenant.service';
import { forkJoin } from 'rxjs';
import { TenantListComponent } from '../../components/tenant-list/tenant-list.component';
import { DialogErrorComponent } from '@lc-ant/commons/components/dialogs';

@Component({
  selector: 'lc-ant-commons-tenant-list-page',
  templateUrl: './tenant-list-page.component.html',
  styleUrl: './tenant-list-page.component.scss'
})
export class TenantListPageComponent extends AbstractComponent {

  canCreate = false;
  canUpdate = false;
  canDelete = false;

  noRoot = (tenant: Tenant) => tenant.publicId !== 'root';

  selection: Tenant[] = [];

  @ViewChild('table') table!: TenantListComponent;

  constructor(
    injector: Injector,
    private router: Router,
    private route: ActivatedRoute,
    authService: AuthService,
    private service: AdminTenantService,
  ) {
    super(injector);
    this.subscriptionsVisible.subscribe(authService.authentication$, auth => {
      if (auth) {
        this.canCreate = auth.hasServicePermission('tenant', 'create');
        this.canUpdate = auth.hasServicePermission('tenant', 'update');
        this.canDelete = auth.hasServicePermission('tenant', 'delete');
      } else {
        this.canCreate = false;
        this.canUpdate = false;
        this.canDelete = false;
      }
    });
  }

  newTenant(): void {
    this.router.navigate(['../new-tenant'], {
      relativeTo: this.route
    });
  }

  selectionChanged(selection: Tenant[]): void {
    this.selection = selection;
  }

  deleteSelection(): void {
    DialogErrorComponent.catch(this.injector, forkJoin(this.selection.map(tenant => this.service.delete(tenant.id)))).subscribe({
      complete: () => {
        this.table.reloadData();
      }
    });
  }

}
