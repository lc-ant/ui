import { I18nService } from '@lc-ant/core';
import { Observable, combineLatest, map } from 'rxjs';
import { ValueFilter } from '../data-filter';

export class StringContainsFilter extends ValueFilter<string> {

  constructor(
  ) {
    super('');
  }

  public override isEmpty(): boolean {
    return this.value$.value.length === 0;
  }

  public override clear(): void {
    this.value$.next('');
  }

  public override description(i18n: I18nService): Observable<string> {
    return combineLatest([
      i18n.getValue('filters', 'string.contains'),
      this.value$
    ]).pipe(map(strings => strings[0] + ' ' + strings[1]));
  }

  public override toExpression(fieldName: string) {
    return {
      toMatch: {
        stringField: fieldName
      },
      regexp: {
        value: this.value$.value // TODO to regexp
      }
    };
  }

}
