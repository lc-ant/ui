import { BehaviorSubject, Observable, Subscriber, filter, map } from 'rxjs';
import { ApiData } from './api-data';
import { RetryableError } from '../utils/retryable-error';
import { ApiError } from '../http/api-error';
import { LcAntUtils } from '../utils/lc-ant-utils';
import { ApiDataChangeEventListener, ApiDataEventsService } from './api-data-events.service';
import { ApiDataChangeEventType } from './api-data-change-event';

export abstract class ApiDataStore<T extends ApiData> {

  private items = new Map<string, Item<T>>();
  public _loaderById?: (id: string) => Observable<Partial<T>>;
  public _loaderByIds?: (ids: string[]) => Observable<Partial<T>[]>;

  constructor(
    private eventsService: ApiDataEventsService,
    private dataDomain: string,
    private dataType: string,
    private itemTimeoutMillis: number,
    private cleaningIntervalMillis: number
  ) {
    if (this.itemTimeoutMillis < 60000) this.itemTimeoutMillis = 60000;
    if (this.cleaningIntervalMillis < 60000) this.cleaningIntervalMillis = 60000;
    // TODO timeout for cleaning
    // TODO when auth user changes (not accessToken), disconnect and clean everything
  }

  public get$(id: string): ObservableItem<T> {
    let item = this.items.get(id);
    if (!item) {
      item = new Item<T>(id, this);
      this.items.set(id, item);
      this.listen();
    }
    return item.get$();
  }

  public elementLoaded(partialElement: Partial<T>): ObservableItem<T> {
    const element = this.createInstance(partialElement);
    let item = this.items.get(element.id);
    if (!item) {
      item = new Item<T>(element.id, this);
      this.items.set(element.id, item);
      this.listen();
    }
    item.newItem(element);
    return item.get$();
  }

  public elementDeleted(id: string): void {
    const item = this.items.get(id);
    if (item) item.newItem(new DeletedItem(id));
  }

  public listLoaded(partialElements: Partial<T>[]): ObservableItem<T>[] {
    return partialElements.map(e => this.elementLoaded(e));
  }

  public abstract createInstance(partial: Partial<T>): T;

  private requestedIds: { id: string, onSuccess: ((element: Partial<T>) => void)[], onError: ((error: ApiError) => void)[] }[] = [];

  private requestId(id: string, subscriber: Subscriber<Partial<T>>): void {
    let r = this.requestedIds.find(ri => ri.id === id);
    if (r) {
      r.onSuccess.push(element => {
        subscriber.next(element);
        subscriber.complete();
      });
      r.onError.push(error => subscriber.error(error));
      return;
    }
    r = { id, onSuccess: [element => {
      subscriber.next(element);
      subscriber.complete();
    }], onError: [(error) => {
      subscriber.error(error);
    }]};
    if (this.requestedIds.length === 0) setTimeout(() => this.processRequestedIds(), 0);
    this.requestedIds.push(r);
  }

  private processRequestedIds(): void {
    var requests = this.requestedIds;
    this.requestedIds = [];
    if (requests.length === 0) return;
    if (requests.length === 1 && this._loaderById) {
      this._loaderById(requests[0].id).subscribe({
        next: value => {
          for (const listener of requests[0].onSuccess)
            listener(value);
        },
        error: err => {
          for (const listener of requests[0].onError)
            listener(err);
        }
      });
      return;
    }
    if (this._loaderByIds) {
      this._loaderByIds(requests.map(r => r.id)).subscribe({
        next: values => {
          for (const value of values) {
            const r = requests.find(request => request.id === value.id);
            if (r) {
              for (const listener of r.onSuccess) {
                listener(value);
              }
            }
          }
        },
        error: err => {
          for (const request of requests) {
            for (const listener of request.onError) {
              listener(err);
            }
          }
        }
      });
      return;
    }
    if (!this._loaderById) throw new Error('_loaderById or _loaderByIds must be declared');
    for (const request of requests) {
      this._loaderById(request.id).subscribe({
        next: value => {
          for (const listener of request.onSuccess) {
            listener(value);
          }
        },
        error: err => {
          for (const listener of request.onError) {
            listener(err);
          }
        }
      });
    }
  }

  public _loadItemById(id: string): Observable<Partial<T>> {
    return new Observable<Partial<T>>(subscriber => {
      this.requestId(id, subscriber);
    });
  };

  // --- Web Socket ---
  private listening = false;
  private listener = <ApiDataChangeEventListener>{
    connected: () => {
      // TODO
    },
    disconnected: () => {
      // TODO
    },
    event: event => {
      const item = this.items.get(event.dataId);
      if (!item) return;
      if (event.eventType === ApiDataChangeEventType.DELETED) {
        item.newItem(new DeletedItem(event.dataId));
      } else if (event.eventType === ApiDataChangeEventType.UPDATED) {
        item.newItem(this.createInstance(event.data));
      }
    }
  };

  private listen(): void {
    if (this.listening) return;
    this.eventsService.listen(this.dataDomain + ':' + this.dataType, this.listener);
    this.listening = true;
  }

  private unlisten(): void {
    if (!this.listening) return;
    this.eventsService.unlisten(this.dataDomain + ':' + this.dataType, this.listener);
    this.listening = false;
  }

}

export class DeletedItem {
  constructor(public id: string) {}
}

export class ObservableItem<T extends ApiData> {
  constructor(
    public id: string,
    public item$: Observable<T | RetryableError | DeletedItem>
  ) {}
}

class Item<T extends ApiData> {

  private item$ = new BehaviorSubject<T | RetryableError | DeletedItem | undefined>(undefined);
  private subscribers: Subscriber<T>[] = [];
  private lastObserverTime: number = 0;
  private loading$?: Observable<T>;

  constructor(
    private id: string,
    private store: ApiDataStore<T>
  ) {}

  public get$(): ObservableItem<T> {
    return new ObservableItem<T>(
      this.id,
      new Observable<T | RetryableError | DeletedItem>(subscriber => {
        this.needItem();
        this.subscribers.push(subscriber);
        const item$ = <Observable<T | RetryableError | DeletedItem>>this.item$.pipe(filter(i => !!i));
        const subscription = item$.subscribe({
          next: value => subscriber.next(value),
          error: err => subscriber.error(err),
          complete: () => subscriber.complete()
        });
        return () => {
          subscription.unsubscribe();
          LcAntUtils.removeArrayElement(this.subscribers, subscriber);
          this.lastObserverTime = Date.now();
        };
      })
    );
  }

  private needItem(): void {
    if (this.loading$) return;
    if (this.item$.value instanceof ApiData || this.item$.value instanceof DeletedItem) return;
    this.loading$ = this.store._loadItemById(this.id).pipe(
      map(partial => this.store.createInstance(partial))
    );
    this.loading$.subscribe({
      next: item => {
        this.loading$ = undefined;
        this.newItem(item);
      },
      error: err => {
        this.loading$ = undefined;
        this.newItem(<ApiError>err);
      }
    });
  }

  public newItem(item: T | ApiError | DeletedItem): void {
    if (item instanceof ApiData) {
      if (this.item$.value instanceof ApiData) {
        if (item.version > this.item$.value.version) {
          this.item$.next(item);
        }
      } else {
        this.item$.next(item);
      }
    } else if (item instanceof DeletedItem) {
      if (!(this.item$.value instanceof DeletedItem)) {
        this.item$.next(item);
      }
    } else if (!(this.item$.value instanceof ApiData)) {
      const e = <RetryableError>{
        error: item,
        retry: () => this.needItem()
      };
      this.item$.next(e);
    }
  }
}
