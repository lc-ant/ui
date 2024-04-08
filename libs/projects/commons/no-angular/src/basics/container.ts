import { NoAngularComponent } from '../component';

export class NoAngularContainer extends NoAngularComponent<HTMLDivElement> {

  constructor(
    noBuild?: boolean
  ) {
    super(noBuild);
  }

  protected override _createElement(): HTMLDivElement {
    return <HTMLDivElement>document.createElement('DIV');
  }

  protected override _build(): void {
  }

  protected override _destroy(): void {
  }

  public add(child: NoAngularComponent<any>): this {
    return this.appendChild(child);
  }

}
