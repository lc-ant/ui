import { ObjectType, FieldDescription, FieldType, NumberRangeConstraint } from './type-description';

export abstract class ApiData {

  constructor(
    public id: string,
    public version: number
  ) {}

  public isEqual(other: ApiData): boolean {
    return this.id === other.id && this.version === other.version;
  }

  public toDto(): any {
    return {id: this.id, version: this.version};
  }

}

export const ApiDataType = new ObjectType(new Map<string, FieldDescription>([
  ['id', new FieldDescription(FieldType.STRING, false, [], 'core', 'id')],
  ['version', new FieldDescription(FieldType.INT, false, [new NumberRangeConstraint(1)], 'core', 'version')]
]));
