import { Observable } from 'rxjs';
import { NoAngularComponent } from '../component';
import { TableColumn } from './table-column';
import { TableDataCell } from './table-data-cell';
import { HtmlUtils } from '../html-utils';

export class TableDataRow extends NoAngularComponent<HTMLDivElement> {

  constructor(
    public columns$: Observable<TableColumn[]>,
    public data: any,
    private data$: Observable<any>,
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
      flexDirection: 'row',
      alignItems: 'stretch',
      position: 'relative',
    });

    this.subscriptionsVisible.subscribe(this.columns$,
      cols => {
        const newChildren: TableDataCell[] = [];
        for (const col of cols) {
          let cell = <TableDataCell>this._children.find(c => c instanceof TableDataCell && c.column === col);
          if (!cell) {
            cell = new TableDataCell(col, this.data$);
          }
          newChildren.push(cell);
        }
        this.reorgChildren(newChildren);
      }
    );
    this.subscriptionsVisible.subscribe(this.data$, data => {
      this.rowStyle(data, this);
    });
  }

  protected override _destroy(): void {

  }

}
