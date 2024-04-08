import { BehaviorSubject, Observable, combineLatest, switchMap } from 'rxjs';
import { NoAngularComponent } from '../component';
import { NoAngularText } from '../basics/text';
import { Subscriptions } from '@lc-ant/core';
import { HtmlUtils } from '../html-utils';
import { NoAngularContainer } from '../basics/container';
import { TableHeaderCell } from './table-header-cell';

export class TableColumn {

  public _headerRenderer: (parent: TableHeaderCell) => NoAngularComponent<any> = () => new NoAngularText('');
  public _cellRenderer?: (data$: Observable<any>) => NoAngularComponent<any>;

  public resizable = true;
  public minimumWidth = 5;
  public maximumWidth = -1;

  public witdh$ = new BehaviorSubject<number>(0);
  public visible$ = new BehaviorSubject<boolean>(true);

  public subColumns$ = new BehaviorSubject<TableColumn[]>([]);
  public finalColumns$ = new BehaviorSubject<TableColumn[]>([this]);

  public parent?: TableColumn;

  public customData = new Map<string, any>();

  private subColumnsSubcriptions = new Subscriptions();

  constructor(
    public id: string
  ) {
    this.subColumns$.subscribe(cols => {
      this.subColumnsSubcriptions.unsusbcribe();
      if (cols.length === 0) {
        this.finalColumns$.next([this]);
      } else {
        // update finalColumns from finalColumns of children
        this.subColumnsSubcriptions.add(combineLatest(cols.map(col => col.finalColumns$)).subscribe(
          subFinalColumns => {
            const merge = [];
            for (const columns of subFinalColumns) merge.push(...columns);
            this.finalColumns$.next(merge);
          }
        ));
        // update visible = at least one final is visible
        this.subColumnsSubcriptions.add(this.finalColumns$.pipe(
          switchMap(finalColumns => combineLatest(finalColumns.map(col => col.visible$)))
        ).subscribe(visibilities => {
          const iamVisible = visibilities.indexOf(true) >= 0;
          if (this.visible$.value !== iamVisible) this.visible$.next(iamVisible);
        }));
      }
    });
  }

  public header(_headerRenderer: (parent: TableHeaderCell) => NoAngularComponent<any>): this {
    this._headerRenderer = _headerRenderer;
    return this;
  }

  public headerWithLabel(text: string | Observable<string>): this {
    return this.header(() => {
      const container = new NoAngularContainer();
      const h = new NoAngularText(text);
      container.appendChild(h);
      HtmlUtils.applyStyle(container.element, {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end'
      });
      return container;
    });
  }

  public fixedWidth(width: number): this {
    this.resizable = false;
    if (this.witdh$.value !== width) this.witdh$.next(width);
    return this;
  }

  public resizableWidth(initialWidth: number, minimumWidth: number, maximumWidth: number): this {
    this.resizable = true;
    this.minimumWidth = minimumWidth;
    this.maximumWidth = maximumWidth;
    if (this.witdh$.value !== initialWidth) this.witdh$.next(initialWidth);
    return this;
  }

  public visible(visible: boolean): this {
    if (this.visible$.value !== visible) this.visible$.next(visible);
    return this;
  }

  public hidden(): this {
    return this.visible(false);
  }

  public shown(): this {
    return this.visible(true);
  }

  public cellRenderer(renderer: (data$: Observable<any>) => NoAngularComponent<any>): this {
    this._cellRenderer = renderer;
    return this;
  }

  public withCustomData(key: string, value: any): this {
    this.customData.set(key, value);
    return this;
  }

}
