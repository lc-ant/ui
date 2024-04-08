import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AbstractComponent, LcAntCoreModule } from '@lc-ant/core';
import { DataFilter, ValueFilter } from '../data-filter';
import { StringContainsFilter } from './string-filters';
import { BehaviorSubject } from 'rxjs';

enum StringFilterType {
  CONTAINS
}

@Component({
  selector: 'lc-ant-commons-string-filter',
  templateUrl: './string-filter.component.html',
  styleUrl: './string-filter.component.scss',
  standalone: true,
  imports: [
    LcAntCoreModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ]
})
export class StringFilterComponent extends AbstractComponent {

  @Input()
  public filter?: DataFilter;

  type?: StringFilterType;
  value$?: BehaviorSubject<string>;

  valueChange(s: string): void {
    if (this.value$) {
      this.value$.next(s);
    }
  }

  protected override _getState(): any[] {
    return [this.filter];
  }

  protected override _refreshComponent(previousState: any[], newState: any[]): void {
    if (this.filter) {
      this.subscriptionsRefresh.add(this.filter.valueFilter$.subscribe(
        valueFilter => {
          if (valueFilter instanceof StringContainsFilter) {
            this.type = StringFilterType.CONTAINS;
            this.value$ = valueFilter.value$;
          } else {
            this.type = undefined;
            this.value$ = undefined;
          }
        }
      ));
    }
  }

}
