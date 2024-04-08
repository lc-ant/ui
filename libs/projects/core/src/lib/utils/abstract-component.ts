import { Component, ComponentRef, ContentChildren, ElementRef, InjectionToken, Injector, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChildren, ViewContainerRef, forwardRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Resubscribeables, Subscriptions } from './subscription-utils';

const ComponentsToken = new InjectionToken<AbstractComponent>('lcAntAbstractComponent');

@Component({
  template: ''
})
export class AbstractComponent implements OnInit, OnDestroy, OnChanges {

  protected subscriptionsAlive = new Subscriptions();
  protected subscriptionsVisible = new Resubscribeables();
  protected subscriptionsRefresh = new Subscriptions();

  protected isVisible$ = new BehaviorSubject<boolean>(false);

  protected activatedRoute: ActivatedRoute;
  protected routeParams: any = {};
  protected queryParams: any = {};

  private _currentState;
  private _isInit = false;

  @ViewChildren(ComponentRef) children?: QueryList<any>;

  constructor(
    protected injector: Injector,
  ) {
    this.activatedRoute = injector.get(ActivatedRoute);
    this._currentState = this._getState();
    this.subscriptionsVisible.subscribe(
      combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams]),
      ([params, query]) => {
        this.routeParams = params;
        this.queryParams = query;
        this.checkRefresh();
      }
    );
    this.isVisible$.subscribe(visible => {
      const view = <any>injector.get(ViewContainerRef);
      const element = injector.get(ElementRef);
      if (view && view['_hostLView']) {
        for (const viewElement of view['_hostLView']) {
          if (Array.isArray(viewElement) && viewElement[0] === element.nativeElement) {
            for (const child of viewElement) {
              if (child === this) continue;
              if (child instanceof AbstractComponent) {
                if (child._isInit) {
                  if (child.isVisible$.value !== visible) {
                    if (visible) child.ionViewWillEnter();
                    else child.ionViewWillLeave();
                  }
                }
              }
            }
            break;
          }
        }
      }
    });
  }

  protected _init(): void {
    // nothing by default
  }

  protected _getState(): any[] {
    return [];
  }

  protected _refreshComponent(previousState: any[], newState: any[]): void {
    // nothing by default
  }

  protected checkRefresh(): void {
    const state = this._getState();
    let needRefresh = false;
    for (const s of this._currentState) {
      if (state.indexOf(s) < 0) {
        needRefresh = true;
        break;
      }
    }
    if (!needRefresh) {
      for (const s of state) {
        if (this._currentState.indexOf(s) < 0) {
          needRefresh = true;
          break;
        }
      }
    }
    if (needRefresh) {
      this.subscriptionsRefresh.unsusbcribe();
      this._refreshComponent(this._currentState, state);
      this._currentState = state;
    }
  }

  ngOnInit(): void {
    this.isVisible$.next(true);
    this._init();
    this._isInit = true;
    this.checkRefresh();
  }

  ngOnDestroy(): void {
    this.isVisible$.next(false);
    this.isVisible$.complete();
    this.subscriptionsRefresh.unsusbcribe();
    this.subscriptionsVisible.stop();
    this.subscriptionsAlive.unsusbcribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.checkRefresh();
  }

  ionViewWillEnter(): void {
    if (!this.isVisible$.value) {
      this.isVisible$.next(true);
      this.subscriptionsVisible.resume();
      this.checkRefresh();
    }
  }

  ionViewWillLeave(): void {
    this.isVisible$.next(false);
    this.subscriptionsRefresh.unsusbcribe();
    this.subscriptionsVisible.pause();
    this._currentState = this._getState();
  }

}
