import { Component, EventEmitter, Injector, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataFormService } from '@lc-ant/commons/utils/data';
import { AbstractComponent, Tenant } from '@lc-ant/core';
import { TenantType } from '../../model/tenant';

@Component({
  selector: 'lc-ant-commons-tenant-form',
  templateUrl: './tenant-form.component.html',
  styleUrl: './tenant-form.component.css'
})
export class TenantFormComponent extends AbstractComponent {

  @Input()
  public tenant?: Tenant;

  @Input()
  public disabled = false;

  @Output()
  public tenantChanged = new EventEmitter<Tenant>();

  form: FormGroup;
  latestTenantChanged?: Tenant;

  constructor(
    injector: Injector,
    private dataFormService: DataFormService
  ) {
    super(injector);
    this.form = this.dataFormService.buildDataTypeForm(TenantType);
    this.form.valueChanges.subscribe(value => {
      if (this.latestTenantChanged) {
        const newTenant = Tenant.of(value);
        if (!newTenant.isEqual(this.latestTenantChanged)) {
          this.latestTenantChanged = newTenant;
          this.tenantChanged.emit(newTenant);
        }
      }
    });
  }

  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled']) {
      if (this.disabled) this.form.disable();
      else this.form.enable();
    }
    super.ngOnChanges(changes);
  }

  protected override _getState(): any[] {
    return [this.tenant];
  }

  protected override _refreshComponent(previousState: any[], newState: any[]): void {
    this.latestTenantChanged = this.tenant;
    if (this.tenant) {
      this.dataFormService.updateFormWith(this.form, this.tenant, TenantType);
    }
  }

  public isValid(): boolean {
    return this.form.valid;
  }

}
