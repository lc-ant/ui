import { ApiData } from '../api/api-data';
import { LcAntUtils } from '../utils/lc-ant-utils';

export class Tenant extends ApiData {

  constructor(
    id: string,
    version: number,
    public publicId: string,
    public displayName: string,
    public validityStart?: Date,
    public validityEnd?: Date
  ) {
    super(id, version);
  }

  public static of(partial: Partial<Tenant>): Tenant {
    if (partial instanceof Tenant) return partial;
    return new Tenant(
      partial.id ?? '',
      partial.version ?? 0,
      partial.publicId ?? '',
      partial.displayName ?? '',
      LcAntUtils.stringToDate(<any>partial.validityStart),
      LcAntUtils.stringToDate(<any>partial.validityEnd)
    );
  }

  public override isEqual(other: Tenant): boolean {
    return super.isEqual(other) &&
      this.publicId === other.publicId &&
      this.displayName === other.displayName &&
      LcAntUtils.dateToSQLString(this.validityStart) === LcAntUtils.dateToSQLString(other.validityStart) &&
      LcAntUtils.dateToSQLString(this.validityEnd) === LcAntUtils.dateToSQLString(other.validityEnd);
  }

  public override toDto(): any {
    return {...super.toDto(),
      publicId: this.publicId,
      displayName: this.displayName,
      validityStart: LcAntUtils.dateToSQLString(this.validityStart),
      validityEnd: LcAntUtils.dateToSQLString(this.validityEnd),
    };
  }

}
