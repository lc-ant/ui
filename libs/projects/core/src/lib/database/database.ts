import { Storage } from '@ionic/storage-angular';
import { AsyncSubject, BehaviorSubject, Observable, filter, first, from, of, switchMap } from 'rxjs';

export class Database {

  private storage: Storage;
  private ready$ = new BehaviorSubject<boolean>(false);

  private setKeyWaitingList = new Map<string, {data: any, removed: boolean, subject: AsyncSubject<any>}>();
  private setKeyPending = new Map<string, {data: any, removed: boolean, subject: AsyncSubject<any>}>();

  constructor(name: string) {
    this.storage = new Storage({name});
    this.storage.create().then(() => this.ready$.next(true)).catch(error => this.ready$.error(error));
  }

  private onReadyObservable(action: (storage: Storage) => Observable<any>): Observable<any> {
    return this.ready$.pipe(
      filter(ready => ready),
      switchMap(r => action(this.storage)),
      first()
    );
  }

  private onReadyPromise(promise: (storage: Storage) => Promise<any>): Observable<any> {
    return this.onReadyObservable(s => from(promise(s)));
  }

  public get$(key: string): Observable<any> {
    const waiting = this.setKeyWaitingList.get(key);
    if (waiting) {
      if (waiting.removed) return of(undefined);
      return of(waiting.data);
    }
    return this.onReadyPromise(s => s.get(key));
  }

  public set$(key: string, value: any): Observable<any> {
    return this.setOrRemove$(key, value, false);
  }

  public set(key: string, value: any): void {
    this.set$(key, value).subscribe();
  }

  public remove$(key: string): Observable<any> {
    return this.setOrRemove$(key, null, true);
  }

  public remove(key: string): void {
    this.remove$(key).subscribe();
  }

  private setOrRemove$(key: string, data: any, removed: boolean): Observable<any> {
    const pending = this.setKeyPending.get(key);
    if (pending) {
      const waiting = this.setKeyWaitingList.get(key);
      const subject = waiting ? waiting.subject : new AsyncSubject<any>();
      this.setKeyWaitingList.set(key, {data, removed, subject});
      return subject;
    }
    const subject = new AsyncSubject<any>();
    this.setKeyPending.set(key, {data, removed, subject});
    this.onReadyPromise(s => removed ? s.remove(key) : s.set(key, data)).subscribe({
      next: value => subject.next(value),
      complete: () => {
        subject.complete();
        this.processNextWaiting(key);
      },
      error: e => {
        subject.error(e);
        this.processNextWaiting(key);
      }
    });
    return subject;
  }

  private processNextWaiting(key: string): void {
    const next = this.setKeyWaitingList.get(key);
    if (!next) {
      this.setKeyPending.delete(key);
      return;
    }
    this.setKeyPending.set(key, next);
    (next.removed ? this.storage.remove(key) : this.storage.set(key, next.data))
    .then(value => {
      next.subject.next(value);
      next.subject.complete();
      this.processNextWaiting(key);
    })
    .catch(error => {
      next.subject.error(error);
      this.processNextWaiting(key);
    });
  }

}
