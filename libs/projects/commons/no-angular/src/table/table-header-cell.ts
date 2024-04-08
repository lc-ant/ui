import { combineLatest, map, switchMap } from 'rxjs';
import { NoAngularContainer } from '../basics/container';
import { NoAngularComponent } from '../component';
import { HtmlUtils } from '../html-utils';
import { TableColumn } from './table-column';
import { NoAngularTableSortOptions } from './table';
import { NoAngularHtmlElement } from '../basics/html-element';

export class TableHeaderCell extends NoAngularComponent<HTMLDivElement> {

  constructor(
    public column: TableColumn,
    private sortOptions: NoAngularTableSortOptions,
    noBuild?: boolean
  ) {
    super(true);
    if (!noBuild) this._build();
  }

  private container?: NoAngularContainer;
  private topContainer?: NoAngularContainer;
  private subColumnsContainer?: NoAngularContainer;

  protected override _createElement(): HTMLDivElement {
    return <HTMLDivElement>document.createElement('DIV');
  }

  protected override _build(): void {
    HtmlUtils.applyStyle(this.element, {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      boxSizing: 'border-box',
      position: 'relative',
    });
    this.container = new NoAngularContainer();
    this.appendChild(this.container);
    HtmlUtils.applyStyle(this.container.element, {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'stretch',
      alignItems: 'stretch',
    });
    this.topContainer = new NoAngularContainer();
    HtmlUtils.applyStyle(this.topContainer.element, {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'stretch'
    });
    const topHeader = this.column._headerRenderer(this);
    HtmlUtils.applyStyle(topHeader.element, {
      flex: '1 1 100%'
    });
    this.topContainer.appendChild(topHeader);
    this.container.appendChild(this.topContainer);

    if (this.column.resizable) {
      const resizer = new NoAngularContainer();
      this.appendChild(resizer);
      HtmlUtils.applyStyle(resizer.element, {
        cursor: 'col-resize',
        position: 'absolute',
        top: '0',
        bottom: '0',
        right: '-5px',
        width: '10px',
      });
      const line = new NoAngularContainer();
      resizer.appendChild(line);
      HtmlUtils.applyStyle(line.element, {
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '2px',
        width: '1px',
        transition: 'background 0.25s ease',
      });
      resizer.element.onmouseenter = () => {
        HtmlUtils.applyStyle(line.element, {
          backgroundColor: 'rgba(var(--lca-foreground-color-rgb), 0.4)'
        });
      };
      resizer.element.onmouseleave = () => {
        HtmlUtils.applyStyle(line.element, {
          backgroundColor: 'transparent'
        });
      };
      this.element.onmouseenter = () => {
        HtmlUtils.applyStyle(line.element, {
          backgroundColor: 'rgba(var(--lca-foreground-color-rgb), 0.2)'
        });
      };
      this.element.onmouseleave = () => {
        HtmlUtils.applyStyle(line.element, {
          backgroundColor: 'transparent'
        });
      };
      resizer.element.onmousedown = (event: MouseEvent) => {
        const dragElement = document.createElement('DIV');
        HtmlUtils.applyStyle(dragElement, {
          top: '0',
          bottom: '0',
          width: '1px',
          backgroundColor: 'var(--lca-foreground-color)',
        });
        HtmlUtils.dragHorizontally(
          dragElement,
          this.element.parentElement!,
          this.column.witdh$.value,
          this.column.minimumWidth,
          this.column.maximumWidth,
          newValue => this.column.witdh$.next(newValue),
          this.element.offsetLeft + this.element.offsetWidth - 2,
          event,
          () => {}
        );
      };
    }

    if (this.sortOptions.isSortable(this.column)) {
      HtmlUtils.applyStyle(topHeader.element, {
        cursor: 'pointer',
      });
      topHeader.element.onclick = () => {
        if (this.sortOptions.sort$.value?.column === this.column) {
          if (this.sortOptions.sort$.value.ascending) {
            this.sortOptions.sort$.next({column: this.column, ascending: false});
          } else {
            this.sortOptions.sort$.next(undefined);
          }
        } else {
          this.sortOptions.sort$.next({column: this.column, ascending: true});
        }
      };
      let sortIcon: NoAngularHtmlElement | undefined;
      let sortAsc: boolean | undefined;
      this.subscriptionsVisible.subscribe(this.sortOptions.sort$, sort => {
        if (sort?.column === this.column) {
          if (sortIcon) {
            if (sortAsc === sort.ascending) return;
            this.topContainer?.removeChild(sortIcon);
          }
          sortAsc = sort.ascending;
          sortIcon = new NoAngularHtmlElement('<span class="material-icons">arrow_' + (sort.ascending ? 'downward' : 'upward')  + '</span>');
          HtmlUtils.applyStyle(sortIcon.element, {
            flex: 'none',
            alignSelf: 'flex-end',
            opacity: 0.7,
            fontSize: '20px',
          });
          this.topContainer?.appendChild(sortIcon);
        } else {
          if (sortIcon) {
            this.topContainer?.removeChild(sortIcon);
            sortIcon = undefined;
            sortAsc = undefined;
          }
        }
      });
    }

    const visibleSubColumns$ = this.column.subColumns$.pipe(
      switchMap(cols => combineLatest(cols.map(col => col.visible$)).pipe(
        map(visibilities => {
          const visibleColumns = [];
          for (let i = 0; i < visibilities.length; ++i)
            if (visibilities[i]) visibleColumns.push(cols[i]);
          return visibleColumns;
        })
      ))
    );

    this.subscriptions.add(visibleSubColumns$.subscribe(subColumns => {
      if (subColumns.length === 0) {
        if (!this.subColumnsContainer) return;
        this.removeChild(this.subColumnsContainer);
        this.subColumnsContainer = undefined;
      } else {
        if (!this.subColumnsContainer) {
          this.subColumnsContainer = new NoAngularContainer();
          HtmlUtils.applyStyle(this.subColumnsContainer.element, {
            // TODO
          });
          this.appendChild(this.subColumnsContainer);
          for (const col of subColumns) {
            this.subColumnsContainer.add(new TableHeaderCell(col, this.sortOptions));
          }
        } else {
          // TODO
        }
      }
    }));
    this.subscriptionsVisible.subscribe(this.column.witdh$, w => HtmlUtils.applyStyle(this.element, {
      minWidth: w + 'px',
      maxWidth: w + 'px',
    }));
  }

  protected override _destroy(): void {
    // nothing
  }

}
