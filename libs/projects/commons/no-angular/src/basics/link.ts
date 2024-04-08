import { Observable } from 'rxjs';
import { NoAngularComponent } from '../component';

export class NoAngularLink extends NoAngularComponent<HTMLAnchorElement> {

  constructor(
    public textProvider: string | Observable<string>,
    public linkHandler: () => void,
    public linkProvider?: string | Observable<string>,
    noBuild?: boolean
  ) {
    super(true);
    if (!noBuild) this._build();
  }

  protected override _createElement(): HTMLAnchorElement {
    return <HTMLAnchorElement>document.createElement('A');
  }

  protected override _build(): void {
    // text
    if (typeof this.textProvider === 'string') {
      this.element.innerText = this.textProvider;
    } else {
      this.subscriptionsVisible.subscribe(this.textProvider, value => this.element.innerText = value);
    }
    // link
    if (typeof this.linkProvider === 'string') {
      this.element.href = this.linkProvider;
    } else if (typeof this.linkProvider === 'object') {
      this.subscriptionsVisible.subscribe(this.linkProvider, value => this.element.href = value);
    } else {
      this.element.href = '#';
    }
    this.element.onclick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      this.linkHandler();
      return false;
    };
  }

  protected override _destroy(): void {
    // nothing to do
  }

}
