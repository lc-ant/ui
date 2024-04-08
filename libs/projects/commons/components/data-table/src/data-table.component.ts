import { Component, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { AbstractComponent, ApiData, DeletedItem, FieldDescription, FieldType, I18nService, LcAntCoreModule, ObjectType, ObservableItem, PageRequest, PageResponse, Sort, SortOrder } from '@lc-ant/core';
import { TableColumn, NoAngularText, NoAngularComponent, NoAngularLink, NoAngularTableSelectionOptions, TableDataRow, HtmlUtils, NoAngularTableSortOptions } from '@lc-ant/commons/no-angular';
import { BehaviorSubject, Observable, debounceTime, first, map, of, skip } from 'rxjs';
import { TableComponent } from '@lc-ant/commons/components/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LcAntNavigationService } from '@lc-ant/navigation';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { DataFilter, DataFiltersChipsComponent, DataFiltersComponent } from '@lc-ant/commons/components/data-filters';

@Component({
  selector: 'lc-ant-commons-data-table',
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  standalone: true,
  imports: [
    TableComponent,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    LcAntCoreModule,
    MatExpansionModule,
    DataFiltersComponent,
    DataFiltersChipsComponent,
  ]
})
export class DataTableComponent extends AbstractComponent {

  @Input()
  public dataType?: ObjectType;

  @Input()
  public pageIndex = 0;

  @Input()
  public pageSize?: number;

  @Input()
  public sortField?: string;

  @Input()
  public sortOrder = SortOrder.ASC;

  @Input()
  public criteria?: any;

  @Input()
  public searchByCriteria?: (criteria?: any, pageRequest?: PageRequest) => Observable<PageResponse<ObservableItem<any>>>;

  @Input()
  public searchByText?: (text: string, pageRequest?: PageRequest) => Observable<PageResponse<ObservableItem<any>>>;

  @Input()
  public itemLink?: (item: any) => string | undefined;

  @Input()
  public enableSelection = false;

  @Input()
  public dataSelectable: (data: any) => boolean = () => true;

  @Output()
  public selectionChanged = new EventEmitter<any[]>();

  columns$?: Observable<TableColumn[]>;
  dataProvider = () => this.doSearch();
  selectionOptions?: NoAngularTableSelectionOptions;
  sortOptions?: NoAngularTableSortOptions;

  textSearch = '';
  textSearch$ = new BehaviorSubject<string>('');
  useCriteria = false;
  dataFilters?: DataFilter[];
  dataFilters$ = new BehaviorSubject<any>(undefined);

  rowStyle: (observedData: any, row: TableDataRow) => void = (data, row) => {
    if (data instanceof ApiData) {
      HtmlUtils.applyStyle(row.element, {
        backgroundColor: ''
      });
    } else if (data instanceof DeletedItem) {
      HtmlUtils.applyStyle(row.element, {
        backgroundColor: 'var(--lca-disabled-background-color)'
      });
    }
  };

  @ViewChild('table') table?: TableComponent;

  constructor(
    injector: Injector,
    public i18n: I18nService,
    private router: Router,
    private route: ActivatedRoute,
    private navigation: LcAntNavigationService,
  ) {
    super(injector);
  }

  protected override _getState(): any[] {
    return [this.dataType, this.searchByCriteria, this.searchByText];
  }

  protected override _refreshComponent(previousState: any[], newState: any[]): void {
    if (this.dataType && (this.searchByCriteria || this.searchByText) && !this.columns$) {
      if (!this.searchByText) this.useCriteria = true;
      this.useCriteria = true; // TODO remove this
      const columns: TableColumn[] = [];
      for (const field of this.dataType.fields.entries()) {
        columns.push(this.buildColumn(field[0], field[1]));
      }
      this.columns$ = of(columns);
      this.selectionOptions = new NoAngularTableSelectionOptions()
        .enableSelection(this.enableSelection)
        .withSelectableData(data => {
          if (!(data instanceof ApiData)) return false;
          return this.dataSelectable(data);
        });
      this.subscriptionsVisible.subscribe(this.selectionOptions.selection$, selection => this.selectionChanged.emit(selection));
      this.sortOptions = new NoAngularTableSortOptions()
        .withSortable(col => this.isSortable(col.customData.get('fieldDescription')))
        ;
      this.sortOptions.sort$.subscribe(sort => {
        this.sortField = sort ? sort.column.customData.get('fieldName') : undefined;
        this.sortOrder = sort?.ascending ? SortOrder.ASC : SortOrder.DESC;
        if (this.isVisible$.value) this.reloadData();
      });
      this.textSearch$.pipe(
        skip(1),
        debounceTime(500)
      ).subscribe(() => {
        if (this.isVisible$.value && !this.useCriteria) this.reloadData();
      });
      this.dataFilters$.pipe(
        skip(1),
        debounceTime(500)
      ).subscribe(() => {
        if (this.isVisible$.value && this.useCriteria) this.reloadData();
      });
    }
  }

  private buildColumn(fieldName: string, descr: FieldDescription): TableColumn {
    return new TableColumn(fieldName)
    .headerWithLabel(this.i18n.getValue(descr.nameNS, descr.nameKey))
    .visible(fieldName !== 'id' && fieldName !== 'version')
    .resizableWidth(100, 10, -1) // TODO ?
    .cellRenderer((data$) => this.cellRenderer(fieldName, descr, data$))
    .withCustomData('fieldName', fieldName)
    .withCustomData('fieldDescription', descr)
    ;
  }

  private isSortable(descr?: FieldDescription): boolean {
    if (!descr) return false;
    // TODO
    return true;
  }

  private cellRenderer(fieldName: string, descr: FieldDescription, data$: Observable<any>): NoAngularComponent<any> {
    if (this.dataType?.mainField === fieldName) return this.linkFieldRenderer(fieldName, descr, data$);
    switch (descr.type) {
      default: return this.textFieldRenderer(fieldName, descr, data$);
    }
  }

  private textFieldRenderer(fieldName: string, descr: FieldDescription, data$: Observable<any>): NoAngularComponent<any> {
    return new NoAngularText(data$.pipe(
      map(data => {
        if (data instanceof ApiData) {
          const value = (<any>data)[fieldName];
          return this.fieldToText(value, descr);
        }
        return '';
      })
    ));
  }

  private linkFieldRenderer(fieldName: string, descr: FieldDescription, data$: Observable<any>): NoAngularComponent<any> {
    return new NoAngularLink(
      data$.pipe(
        map(data => {
          if (data instanceof ApiData) {
            const value = (<any>data)[fieldName];
            return this.fieldToText(value, descr);
          }
          return '';
        })
      ),
      () => {
        // link handler
        if (this.itemLink) {
          data$.pipe(
            first()
          ).subscribe(data => {
            const link = data instanceof ApiData ? (this.itemLink ? this.itemLink(data) : undefined) : undefined;
            if (link) {
              this.router.navigateByUrl(this.navigation.resolveLink(this.route, link));
            }
          });
        }
      },
      data$.pipe(
        map(data => {
          const link = this.itemLink ? this.itemLink(data) : undefined;
          if (link) {
            return this.navigation.resolveLink(this.route, link);
          }
          return '';
        })
      )
    );
  }

  private fieldToText(value: any, descr: FieldDescription): string {
    switch (descr.type) {
      case FieldType.DATE: return value ? (<Date>value).toLocaleDateString() : '';
      default: return value;
    }
  }

  textSearchChanged(newText: string): void {
    if (this.textSearch === newText) return;
    this.textSearch = newText;
    this.textSearch$.next(newText);
  }

  dataFiltersChanged(newFilters: DataFilter[]): void {
    this.dataFilters = newFilters;
    const filters = [];
    for (const df of newFilters) {
      if (!df.valueFilter$.value.isEmpty()) {
        filters.push(df.valueFilter$.value.toExpression(df.fieldName));
      }
    }
    this.dataFilters$.next(filters.length > 0 ? {and: filters} : undefined);
  }

  private doSearch(): Observable<ObservableItem<any>[]> {
    const pageRequest = this.buildPageRequest();
    const request = this.doSearchRequest(pageRequest);
    return this.handlePageResponse(request);
  }

  private buildPageRequest(): PageRequest | undefined {
    const p = new PageRequest();
    if (this.sortField) {
      p.sort = [new Sort(this.sortField, this.sortOrder)];
    }
    // TODO
    return p;
  }

  private doSearchRequest(pageRequest?: PageRequest): Observable<PageResponse<ObservableItem<any>>> {
    const text = this.textSearch.trim();
    if (text.length > 0)
      return this.searchByText!(text, pageRequest);
    return this.searchByCriteria!(this.useCriteria ? this.dataFilters$.value : undefined, pageRequest);
  }

  private handlePageResponse(pageResponse: Observable<PageResponse<ObservableItem<any>>>): Observable<ObservableItem<any>[]> {
    return pageResponse.pipe(
      map(page => {
        // TODO total count
        return page.data;
      })
    );
  }

  private dataReloadRequested = false;
  public reloadData(): void {
    if (this.dataReloadRequested) return;
    this.dataReloadRequested = true;
    setTimeout(() => {
      this.dataReloadRequested = false;
      this.table?.reloadData();
    }, 0);
  }

  toggleCriteria(): void {
    this.useCriteria = !this.useCriteria;
  }

}
