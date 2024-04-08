import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { NoAngularComponent } from '../component';
import { TableColumn } from './table-column';
import { TableHeaderRow } from './table-header-row';
import { TableDataContainer } from './table-data-container';
import { TableHeaderCell } from './table-header-cell';
import { NoAngularCheckbox } from '../basics/checkbox';
import { TableDataRow } from './table-data-row';
import { TableDataCell } from './table-data-cell';
import { LcAntUtils } from '@lc-ant/core';
import { NoAngularContainer } from '../basics/container';
import { HtmlUtils } from '../html-utils';

export class NoAngularTableData {

  public compareData: (data1: any, data2: any) => boolean = (d1, d2) => d1 === d2;
  public toObservable: (data: any) => Observable<any> = data => data instanceof Observable ? data : of(data);
  public isShown: (data: any) => boolean = () => true;

  constructor(
    public data$: Observable<any[]>
  ) {}

  public withComparator(comparator: (data1: any, data2: any) => boolean): this {
    this.compareData = comparator;
    return this;
  }

  public withDataObservable(converter: (data: any) => Observable<any>): this {
    this.toObservable = converter;
    return this;
  }

  public withDataShown(filter: (data: any) => boolean): this {
    this.isShown = filter;
    return this;
  }

}

export class NoAngularTableSelectionOptions {

  public selectable = false;
  public dataSelectable: (data: any) => boolean = () => true;

  public selection$ = new BehaviorSubject<any[]>([]);

  public enableSelection(enabled: boolean): this {
    this.selectable = enabled;
    return this;
  }

  public withSelectableData(filter: (data: any) => boolean): this {
    this.dataSelectable = filter;
    return this;
  }

}

export class NoAngularTableSortOptions {

  public isSortable: (column: TableColumn) => boolean = () => false;

  public sort$ = new BehaviorSubject<{column: TableColumn, ascending: boolean} | undefined>(undefined);

  public withSortable(filter: (column: TableColumn) => boolean): this {
    this.isSortable = filter;
    return this;
  }

  public withSortableColumns(columns: TableColumn[]): this {
    return this.withSortable((col) => columns.indexOf(col) >= 0);
  }

  public withSortableColumnsIds(ids: string[]): this {
    return this.withSortable((col) => ids.indexOf(col.id) >= 0);
  }

}

const SELECTION_COLUMN_ID = '#_selection';

export class NoAngularTable extends NoAngularComponent<HTMLDivElement> {

  constructor(
    private columns$: Observable<TableColumn[]>,
    private data: NoAngularTableData,
    private selectionOptions: NoAngularTableSelectionOptions = new NoAngularTableSelectionOptions(),
    private sortOptions: NoAngularTableSortOptions = new NoAngularTableSortOptions(),
    private rowStyle: (observedData: any, row: TableDataRow) => void = () => {},
    noBuild: boolean = false,
  ) {
    super(true);
    if (!noBuild) this._build();
  }

  protected override _createElement(): HTMLDivElement {
    return <HTMLDivElement>document.createElement('DIV');
  }

  protected override _build(): void {
    let cols$ = this.columns$;
    if (this.selectionOptions.selectable) {
      cols$ = cols$.pipe(
        map(cols => [
          new TableColumn(SELECTION_COLUMN_ID)
            .fixedWidth(50)
            .header(parent => this.selectionHeaderRenderer(parent))
            .cellRenderer(data$ => this.selectionDataRenderer(data$))
          , ...cols
        ])
      );
    }
    this.appendChild(new TableHeaderRow(cols$, this.sortOptions));
    this.appendChild(new TableDataContainer(cols$, this.data, this.rowStyle));
  }

  protected override _destroy(): void {
  }

  private selectionHeaderRenderer(parent: TableHeaderCell): NoAngularComponent<any> {
    const checkbox = this.selectionRenderer();
    const container = new NoAngularContainer();
    container.appendChild(checkbox);
    HtmlUtils.applyStyle(container.element, {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end'
    });
    checkbox.checked$.subscribe(checked => {
      if (checked === null) return;
      if (checked) this.selectAll();
      else this.unselectAll();
    });
    this.subscriptionsVisible.subscribe(this.selectionOptions.selection$, selection => {
      if (selection.length === 0) checkbox.setChecked(false);
      else {
        let allSelected = true;
        const dataContainer = this._children.find(child => child instanceof TableDataContainer)!;
        for (const row of dataContainer.children) {
          let rowSelected = true;
          for (const cell of row.children) {
            if ((<TableDataCell>cell).column.id === SELECTION_COLUMN_ID) {
              const checkbox = <NoAngularCheckbox>cell.children[0];
              rowSelected = checkbox.isDisabled() || !checkbox.customData.currentData || selection.indexOf(checkbox.customData.currentData) >= 0;
              break;
            }
          }
          if (!rowSelected) {
            allSelected = false;
            break;
          }
        }
        if (allSelected) checkbox.setChecked(true);
        else checkbox.setIndeterminate();
      }
    });
    return container;
  }

  private selectionDataRenderer(data$: Observable<any>): NoAngularComponent<any> {
    const checkbox = this.selectionRenderer();
    let currentRowData: any = undefined;
    let currentData: any = undefined;
    this.subscriptionsVisible.subscribe(data$, data => {
      const selectable = this.selectionOptions.dataSelectable(data);
      checkbox.setEnabled(selectable);
      if (!selectable) checkbox.setChecked(false);
      const row = <TableDataRow>checkbox.parent?.parent;
      const rowData = row?.data;
      if (currentRowData === undefined || rowData === undefined || !this.data.compareData(currentRowData, rowData)) {
        checkbox.setChecked(false);
      }
      currentRowData = rowData;
      const selected = checkbox.isChecked() && checkbox.isEnabled();
      checkbox.customData.currentData = data;
      if (currentData && currentData !== data) {
        this.removeFromSelection(currentData);
      }
      currentData = data;
      if (selected) this.addToSelection(data);
    });
    checkbox.checked$.subscribe(checked => {
      if (currentData) {
        if (checked) this.addToSelection(currentData);
        else this.removeFromSelection(currentData);
      }
    });
    this.subscriptionsVisible.subscribe(this.selectionOptions.selection$, selection => {
      const selected = currentData && selection.indexOf(currentData) >= 0 && checkbox.isEnabled();
      checkbox.setChecked(selected);
    });
    return checkbox;
  }

  private selectionRenderer(): NoAngularCheckbox {
    return new NoAngularCheckbox();
  }

  public addToSelection(data: any): void {
    if (this.selectionOptions.selection$.value.indexOf(data) >= 0) return;
    this.selectionOptions.selection$.next([...this.selectionOptions.selection$.value, data]);
  }

  public removeFromSelection(data: any): void {
    const index = this.selectionOptions.selection$.value.indexOf(data);
    if (index < 0) return;
    const newSelection = [...this.selectionOptions.selection$.value];
    newSelection.splice(index, 1);
    this.selectionOptions.selection$.next(newSelection);
  }

  public selectAll(): void {
    const all = [];
    const dataContainer = this._children.find(child => child instanceof TableDataContainer)!;
    for (const row of dataContainer.children) {
      for (const cell of row.children) {
        if ((<TableDataCell>cell).column.id === SELECTION_COLUMN_ID) {
          const checkbox = <NoAngularCheckbox>cell.children[0];
          if (!checkbox.isDisabled() && checkbox.customData.currentData) {
            all.push(checkbox.customData.currentData)
          }
        }
      }
    }
    if (LcAntUtils.arraysContainSameElements(all, this.selectionOptions.selection$.value)) return;
    this.selectionOptions.selection$.next(all);
  }

  public unselectAll(): void {
    if (this.selectionOptions.selection$.value.length === 0) return;
    this.selectionOptions.selection$.next([]);
  }

}
