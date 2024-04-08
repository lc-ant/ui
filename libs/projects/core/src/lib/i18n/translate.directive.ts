import { AfterViewChecked, Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { I18nService } from './i18n.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[translateKey]',
  standalone: false
})
export class TranslateDirective implements OnDestroy, OnInit, AfterViewChecked, OnChanges {

  @Input()
  translateNS: string = '';

  @Input()
  translateKey: string = '';

  @Input()
  translateArgs: any[] = [];

  private subscription?: Subscription;

  constructor(
    private el: ElementRef,
    private service: I18nService,
  ) {}

  ngOnInit(): void {
    this.update();
  }

  ngAfterViewChecked(): void {
    this.update();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.clear();
    this.update();
  }

  ngOnDestroy(): void {
    this.clear();
  }

  private clear(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }

  private update(): void {
    if (this.subscription) return;
    let ns = this.translateNS;
    if (ns === '') {
      let parent = this.el.nativeElement.parentElement;
      while (parent) {
        const attr = parent.attributes.getNamedItem('translateNS');
        if (attr) {
          ns = attr.value;
          break;
        }
        parent = parent.parentElement;
      }
    }
    if (ns === '') return;
    this.subscription = this.service.getValue(ns, this.translateKey, this.translateArgs).subscribe(
      value => this.el.nativeElement.innerText = value
    );
  }

}
