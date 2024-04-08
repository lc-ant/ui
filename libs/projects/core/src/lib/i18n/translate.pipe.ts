import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform, OnDestroy {

  private currentValue?: string;
  private currentText?: string;
  private subscription?: Subscription;

  constructor(
    private service: I18nService,
    private ref: ChangeDetectorRef,
  ) {}

  transform(value: unknown, ...args: unknown[]): unknown {
    if (this.currentValue) {
      if (value === this.currentValue) return this.currentText;
      this.ngOnDestroy();
    }
    this.currentText = '';
    if (typeof value === 'string') {
      const index = value.indexOf('.');
      if (index > 0) {
        const ns = value.substring(0, index);
        const key = value.substring(index + 1);
        this.currentValue = value;
        let onInit = true;
        this.subscription = this.service.getValue(ns, key, args).subscribe(text => {
          this.currentText = text;
          if (!onInit) this.ref.markForCheck();
        });
        onInit = false;
      }
    }
    return this.currentText;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }

}
