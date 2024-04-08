import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { NoAngularComponent } from '../component';
import { TableColumn } from './table-column';
import { TableDataRow } from './table-data-row';
import { HtmlUtils } from '../html-utils';
import { NoAngularTableData } from './table';

export class TableDataContainer extends NoAngularComponent<HTMLDivElement> {

  constructor(
    private columns$: Observable<TableColumn[]>,
    private data: NoAngularTableData,
    private rowStyle: (observedData: any, row: TableDataRow) => void,
    noBuild?: boolean
  ) {
    super(true);
    if (!noBuild) this._build();
  }

  protected override _createElement(): HTMLDivElement {
    return <HTMLDivElement>document.createElement('DIV');
  }

  protected override _build(): void {
    HtmlUtils.applyStyle(this.element, {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    });

    const finalVisibleColumns$ = this.columns$.pipe(
      switchMap(cols => combineLatest(cols.map(col => col.finalColumns$))),
      map(cols => cols.flatMap(finalColumns => finalColumns)),
      switchMap(cols => combineLatest(cols.map(col => col.visible$)).pipe(
        map(visibilities => {
          const visibleColumns = [];
          for (let i = 0; i < visibilities.length; ++i)
            if (visibilities[i]) visibleColumns.push(cols[i]);
          return visibleColumns;
        })
      ))
    );

    this.subscriptionsVisible.subscribe(this.data.data$,
      dataList => {
        const newRows: TableDataRow[] = [];
        for (const data of dataList) {
          const shown = this.data.isShown(data);
          let row = <TableDataRow>this._children.find(c => c instanceof TableDataRow && this.data.compareData(data, c.data));
          if (shown) {
            if (!row) {
              row = new TableDataRow(finalVisibleColumns$, data, this.data.toObservable(data), this.rowStyle);
            }
            newRows.push(row);
          }
        }
        this.reorgChildren(newRows);
      }
    );
  }

  protected override _destroy(): void {

  }

}
