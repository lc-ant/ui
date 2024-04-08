import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { AbstractComponent, ObservableItem } from '@lc-ant/core';
import { TableColumn, NoAngularTable, NoAngularTableData, NoAngularTableSelectionOptions, TableDataRow, NoAngularTableSortOptions } from '@lc-ant/commons/no-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { NoAngularComponentWrapperComponent } from '@lc-ant/commons/components/no-angular-component-wrapper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lc-ant-commons-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  standalone: true,
  imports: [
    NoAngularComponentWrapperComponent,
    CommonModule,
  ]
})
export class TableComponent extends AbstractComponent {

  @Input()
  public columns$?: Observable<TableColumn[]>;

  @Input()
  public dataProvider?: () => Observable<ObservableItem<any>[]>;

  @Input()
  public selectionOptions?: NoAngularTableSelectionOptions;

  @Input()
  public sortOptions?: NoAngularTableSortOptions;

  @Input()
  public rowStyle: (observedData: any, row: TableDataRow) => void = () => {};

  table?: NoAngularTable;

  private data$ = new BehaviorSubject<ObservableItem<any>[]>([]);

  constructor(
    injector: Injector,
  ) {
    super(injector);
  }

  protected override _getState(): any[] {
    return [this.columns$, this.dataProvider, this.selectionOptions];
  }

  protected override _refreshComponent(previousState: any[], newState: any[]): void {
    if (!this.columns$ || !this.dataProvider || !this.selectionOptions) return;
    if (this.table) return;
    this.table = new NoAngularTable(
      this.columns$,
      new NoAngularTableData(this.data$)
        .withComparator((item1, item2) => item1.id === item2.id)
        .withDataObservable(item => item.item$),
      this.selectionOptions,
      this.sortOptions,
      this.rowStyle
    );
    this.reloadData();
  }

  public reloadData(): void {
    if (this.dataProvider) {
      this.dataProvider().subscribe(
        data => {
          this.data$.next(data);
        }
      );
    }
  }

}
