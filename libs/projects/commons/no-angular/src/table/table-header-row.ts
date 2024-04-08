import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { NoAngularComponent } from '../component';
import { TableColumn } from './table-column';
import { HtmlUtils } from '../html-utils';
import { TableHeaderCell } from './table-header-cell';
import { NoAngularTableSortOptions } from './table';

export class TableHeaderRow extends NoAngularComponent<HTMLDivElement> {

  constructor(
    public columns$: Observable<TableColumn[]>,
    private sortOptions: NoAngularTableSortOptions,
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
      flexDirection: 'row',
      alignItems: 'stretch',
      position: 'relative',
    });

    const visibleColumns$ = this.columns$.pipe(
      switchMap(cols => combineLatest(cols.map(col => col.visible$)).pipe(
        map(visibilities => {
          const visibleColumns = [];
          for (let i = 0; i < visibilities.length; ++i)
            if (visibilities[i]) visibleColumns.push(cols[i]);
          return visibleColumns;
        })
      ))
    );

    this.subscriptions.add(visibleColumns$.subscribe(cols => {
      const newChildren: TableHeaderCell[] = [];
      for (const col of cols) {
        let cell = <TableHeaderCell>this.children.find(c => c instanceof TableHeaderCell && c.column === col);
        if (!cell) {
          cell = new TableHeaderCell(col, this.sortOptions);
        }
        newChildren.push(cell);
      }
      this.reorgChildren(newChildren);
    }));
  }

  protected override _destroy(): void {
    // nothing
  }

}
