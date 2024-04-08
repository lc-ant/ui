import { NoAngularComponent } from '../component';

export class NoAngularHtmlElement extends NoAngularComponent<HTMLElement> {

  constructor(
    private html: string
  ) {
    super(true, true);
    this.__initElement();
  }

  protected override _createElement(): HTMLElement {
    const div = document.createElement('DIV');
    div.innerHTML = this.html;
    if (div.children.length !== 1) throw Error('NoAngularHtmlElement must contain a single root element. found is ' + div.children.length + ' in ' + this.html);
    const e = div.children.item(0)!;
    div.removeChild(e);
    return <HTMLElement>e;
  }

  protected override _build(): void {
    // nothing
  }

  protected override _destroy(): void {
    // nothing
  }

}
