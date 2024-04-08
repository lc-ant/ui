import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractComponent, FieldDescription, FieldType, LcAntCoreModule, ObjectType } from '@lc-ant/core';
import { DataFilterComponent } from './data-filter.component';
import { DataFilter, ValueFilter } from './data-filter';
import { StringContainsFilter } from './string/string-filters';
import { combineLatest, switchMap } from 'rxjs';

@Component({
  selector: 'lc-ant-commons-data-filters',
  templateUrl: './data-filters.component.html',
  styleUrl: './data-filters.component.scss',
  standalone: true,
  imports: [
    LcAntCoreModule,
    CommonModule,
    DataFilterComponent
  ]
})
export class DataFiltersComponent extends AbstractComponent {

  @Input()
  dataType?: ObjectType

  @Input()
  filters?: DataFilter[];

  @Output()
  filtersChange = new EventEmitter<DataFilter[]>;

  protected override _getState(): any[] {
    return [this.dataType, this.filters];
  }

  protected override _refreshComponent(previousState: any[], newState: any[]): void {
    if (this.dataType) {
      if (!this.filters) {
        this.filters = [];
        for (const f of this.dataType.fields.entries()) {
          const valueFilter = this.getDefaultValueFilter(f[1].type);
          if (valueFilter) {
            const filter = new DataFilter(f[0], f[1], valueFilter);
            this.filters.push(filter);
          }
        }
      }
      this.subscriptionsRefresh.add(
        combineLatest(this.filters.map(f => f.valueFilter$.pipe(switchMap(vf => vf.value$))))
        .subscribe(() => this.filtersChange.emit(this.filters))
      );
    }
  }

  private getDefaultValueFilter(type: FieldType): ValueFilter<any> | undefined {
    switch (type) {
      case FieldType.STRING: return new StringContainsFilter();
    }
    return undefined;
  }

}
