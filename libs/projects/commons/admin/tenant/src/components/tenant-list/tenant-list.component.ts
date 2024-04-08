import { Component, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { TenantType } from '../../model/tenant';
import { Observable } from 'rxjs';
import { AbstractComponent, ObservableItem, PageRequest, PageResponse, Tenant } from '@lc-ant/core';
import { AdminTenantService } from '../../admin-tenant.service';
import { DataTableComponent } from '@lc-ant/commons/components/data-table';

@Component({
  selector: 'lc-ant-commons-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrl: './tenant-list.component.scss'
})
export class TenantListComponent extends AbstractComponent {

  @Input()
  public enableSelection = false;

  @Input()
  public tenantSelectable: (tenant: Tenant) => boolean = () => true;

  @Output()
  public selectionChanged = new EventEmitter<Tenant[]>();

  tenantType = TenantType;
  searchByCriteria: (criteria?: any, pageRequest?: PageRequest) => Observable<PageResponse<ObservableItem<any>>>;
  searchByText: (text: string, pageRequest?: PageRequest) => Observable<PageResponse<ObservableItem<any>>>;
  itemLink = (item: Tenant) => {
    return '../tenant/' + item.id;
  };

  @ViewChild('table') table!: DataTableComponent;

  constructor(
    injector: Injector,
    private service: AdminTenantService,
  ) {
    super(injector);
    this.searchByCriteria = (criteria, pageRequest) => this.service.search(criteria, pageRequest);
    this.searchByText = (text, pageRequest) => this.service.searchText(text, pageRequest);
    let firstVisible = true;
    this.isVisible$.subscribe(visible => {
      if (visible) {
        if (firstVisible) firstVisible = false;
        else this.table?.reloadData();
      }
    });
  }

  tenantSelectionChanged(selection: Tenant[]): void {
    this.selectionChanged.emit(selection);
  }

  public reloadData(): void {
    this.table.reloadData();
  }

}
