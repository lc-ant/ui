import { FieldDescription, I18nService } from '@lc-ant/core';
import { BehaviorSubject, Observable, combineLatest, map, switchMap } from 'rxjs';

export class DataFilter {

  public valueFilter$: BehaviorSubject<ValueFilter<any>>;

  constructor(
    public fieldName: string,
    public fieldDescription: FieldDescription,
    filter: ValueFilter<any>,
  ) {
    this.valueFilter$ = new BehaviorSubject<ValueFilter<any>>(filter);
  }

  public description(i18n: I18nService): Observable<string> {
    return combineLatest([
      i18n.getValue(this.fieldDescription.nameNS, this.fieldDescription.nameKey),
      this.valueFilter$.pipe(switchMap(f => f.description(i18n)))
    ]).pipe(
      map(strings => strings[0] + ' ' + strings[1])
    );
  }

}

export abstract class ValueFilter<T> {

  public value$: BehaviorSubject<T>;

  constructor(
    value: T
  ) {
    this.value$ = new BehaviorSubject<T>(value);
  }

  public abstract description(i18n: I18nService): Observable<string>;

  public abstract isEmpty(): boolean;
  public abstract clear(): void;

  public abstract toExpression(fieldName: string): any;
}
