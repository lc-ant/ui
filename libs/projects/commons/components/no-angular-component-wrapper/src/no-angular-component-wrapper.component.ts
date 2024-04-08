import { ChangeDetectionStrategy, Component, ElementRef, Injector, Input } from '@angular/core';
import { AbstractComponent } from '@lc-ant/core';
import { NoAngularComponent } from '@lc-ant/commons/no-angular';

@Component({
  selector: 'lc-ant-commons-no-angular-component-wrapper',
  template: '',
  styles: ':host { display: flex; flex-direction: column; align-items: stretch; justify-content: stretch; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class NoAngularComponentWrapperComponent extends AbstractComponent {

  @Input()
  public component?: NoAngularComponent<any>;

  constructor(
    injector: Injector,
    private element: ElementRef,
  ) {
    super(injector);
    this.isVisible$.subscribe(visible => {
      if (this.component) {
        if (visible) this.component.shown();
        else this.component.hidden();
      }
    });
  }

  protected override _getState(): any[] {
    return [this.component];
  }

  protected override _refreshComponent(previousState: any[], newState: any[]): void {
    if (previousState[0]) {
      const current: NoAngularComponent<any> = previousState[0];
      const e = current.element;
      current.destroy();
      this.element.nativeElement.removeChild(e);
    }
    if (this.component) {
      this.element.nativeElement.appendChild(this.component.element);
    }
  }

}
