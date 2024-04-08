import { Observable } from 'rxjs';
import { NoAngularComponent } from '../component';

export class NoAngularText extends NoAngularComponent<HTMLSpanElement> {

  constructor(
    public provider: string | Observable<string>,
    noBuild?: boolean
  ) {
    super(true);
    if (!noBuild) this._build();
  }

  protected override _createElement(): HTMLSpanElement {
    return <HTMLSpanElement>document.createElement('SPAN');
  }

  protected override _build(): void {
    if (typeof this.provider === 'string') {
      this.element.innerText = this.provider;
    } else {
      this.subscriptionsVisible.subscribe(this.provider, value => this.element.innerText = value);
    }
  }

  protected override _destroy(): void {
    // nothing to do
  }

}
