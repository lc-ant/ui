export class Locale {

  constructor(
    private _language: string,
    private _country: string,
    private _variant: string
  ) {}

  public get language(): string {
    return this._language;
  }

  public get country(): string {
    return this._country;
  }

  public get variant(): string {
    return this._variant;
  }

  public toString(): string {
    let s = this._language;
    if (this._country) {
      s += '_' + this._country;
      if (this._variant) {
        s += '_' + this._variant;
      }
    }
    return s;
  }

  public static fromString(s: string): Locale {
    const components = s.split('_');
    if (components.length == 1) return new Locale(components[0], '', '');
    if (components.length == 2) return new Locale(components[0], components[1], '');
    return new Locale(components[0], components[1], components[2]);
  }

}
