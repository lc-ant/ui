import { Observable } from 'rxjs';
import { NoAngularComponent } from '../component';
import { TableColumn } from './table-column';
import { HtmlUtils } from '../html-utils';

export class TableDataCell extends NoAngularComponent<HTMLDivElement> {

  constructor(
    public column: TableColumn,
    public data$: Observable<any>,
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
      justifyContent: 'stretch',
      alignItems: 'stretch',
      boxSizing: 'border-box',
    });

    if (this.column._cellRenderer) {
      this.appendChild(this.column._cellRenderer(this.data$));
    }

    this.subscriptionsVisible.subscribe(this.column.witdh$, w => HtmlUtils.applyStyle(this.element, {
      minWidth: w + 'px',
      maxWidth: w + 'px',
    }));
  }

  protected override _destroy(): void {
    // nothing
  }

}
