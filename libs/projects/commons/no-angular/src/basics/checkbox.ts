import { BehaviorSubject } from 'rxjs';
import { NoAngularComponent } from '../component';

export class NoAngularCheckbox extends NoAngularComponent<HTMLDivElement> {

  public checked$ = new BehaviorSubject<boolean | null>(false);

  constructor(
    noBuild?: boolean
  ) {
    super(true);
    if (!noBuild) this._build();
  }

  private input!: HTMLInputElement;
  private checkbox!: HTMLDivElement;

  protected override _createElement(): HTMLDivElement {
    return <HTMLDivElement>document.createElement('DIV');
  }

  protected override _build(): void {
    this.input = <HTMLInputElement>document.createElement('INPUT');
    this.input.type = 'checkbox';
    this.checkbox = <HTMLDivElement>document.createElement('DIV');
    this._element.appendChild(this.input);
    this._element.appendChild(this.checkbox);
    this.checkbox.innerHTML = '<svg focusable="false" viewBox="0 0 24 24"><path fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"></path></svg><div></div>';
    this.input.onchange = () => {
      this._element.classList.remove('indeterminate');
      if (this.isChecked()) this._element.classList.add('checked');
      else this._element.classList.remove('checked');
      this.checked$.next(this.isChecked());
    };
  }

  protected override _destroy(): void {
    this.checked$.complete();
  }

  public isDisabled(): boolean {
    return this.input.disabled;
  }

  public isEnabled(): boolean {
    return !this.isDisabled();
  }

  public setDisabled(disabled: boolean): this {
    this.input.disabled = disabled;
    if (disabled) this._element.classList.add('disabled');
    else this._element.classList.remove('disabled');
    return this;
  }

  public setEnabled(enabled: boolean): this {
    return this.setDisabled(!enabled);
  }

  public isChecked(): boolean {
    return this.input.checked;
  }

  public setChecked(checked: boolean): this {
    if (!this.input.indeterminate && this.input.checked === checked) return this;
    this.input.checked = checked;
    this.input.indeterminate = false;
    if (checked) this._element.classList.add('checked');
    else this._element.classList.remove('checked');
    this._element.classList.remove('indeterminate');
    this.checked$.next(checked);
    return this;
  }

  public setIndeterminate(): this {
    if (this.input.indeterminate) return this;
    this.input.indeterminate = true;
    this._element.classList.add('indeterminate');
    this._element.classList.remove('checked');
    this.checked$.next(null);
    return this;
  }

}
