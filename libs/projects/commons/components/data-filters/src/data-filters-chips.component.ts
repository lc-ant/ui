import { CommonModule } from '@angular/common';
import { Component, Injector, Input } from '@angular/core';
import { AbstractComponent, I18nService, LcAntCoreModule, ObjectType } from '@lc-ant/core';
import { DataFilter, ValueFilter } from './data-filter';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'lc-ant-commons-data-filters-chips',
  templateUrl: './data-filters-chips.component.html',
  styleUrl: './data-filters-chips.component.scss',
  standalone: true,
  imports: [
    LcAntCoreModule,
    CommonModule,
    MatIconModule,
    MatChipsModule,
  ]
})
export class DataFiltersChipsComponent extends AbstractComponent {

  constructor(
    injector: Injector,
    protected i18n: I18nService,
  ) {
    super(injector);
  }

  @Input()
  filters?: DataFilter[];

  hasFilters$?: Observable<boolean>;

  protected override _getState(): any[] {
    return [this.filters];
  }

  protected override _refreshComponent(previousState: any[], newState: any[]): void {
    if (this.filters) {
      this.hasFilters$ = combineLatest(this.filters.map(f => f.valueFilter$)).pipe(
        switchMap(list =>
          combineLatest(list.map(vf => vf.value$)).pipe(
            map(values => {
              for (const vf of list) {
                if (!vf.isEmpty()) return true;
              }
              return false;
            })
          )
        )
      );
    }
  }

}
