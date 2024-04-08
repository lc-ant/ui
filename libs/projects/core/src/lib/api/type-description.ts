import { ValidatorFn, Validators } from '@angular/forms';

export class ObjectType {

  public mainField?: string;

  constructor(
    public fields: Map<string, FieldDescription>,
  ) {}

  main(mainField: string): this {
    this.mainField = mainField;
    return this;
  }

}

export class FieldDescription {

  constructor(
    public type: FieldType,
    public isOptional: boolean,
    public constraints: Constraint[],
    public nameNS: string,
    public nameKey: string,
    public objectType?: ObjectType,
  ) {}

}

export enum FieldType {
  BOOL = 'boolean',
  INT = 'integer',
  FLOAT = 'float',
  STRING = 'string',
  OBJECT = 'object',
  DATE = 'date',
  TIME = 'time',
  TIMESTAMP = 'timestamp'
}

export interface Constraint {

  toValidators(): ValidatorFn[];

}

export class MandatoryConstraint implements Constraint {
  toValidators(): ValidatorFn[] {
    return [Validators.required];
  }
}

export class NumberRangeConstraint implements Constraint {

  constructor(
    public min?: number,
    public max?: number
  ) {}

  toValidators(): ValidatorFn[] {
    const validators = [];
    if (typeof this.min === 'number')
      validators.push(Validators.min(this.min));
    if (typeof this.max === 'number')
      validators.push(Validators.max(this.max));
    return validators;
  }
}

export class StringLengthConstraint implements Constraint {

  constructor(
    public minLength?: number,
    public maxLength?: number
  ) {}

  toValidators(): ValidatorFn[] {
    const validators = [];
    if (typeof this.minLength === 'number')
      validators.push(Validators.minLength(this.minLength));
    if (typeof this.maxLength === 'number')
      validators.push(Validators.maxLength(this.maxLength));
    return validators;
  }

}

export enum ComparisonOperator {
  EQ, NOT_EQ, LESS, LESS_OR_EQUAL, GREATER, GREATER_OR_EQUAL
}

export class CompareToFieldConstraint implements Constraint {

  constructor(
    public otherField: string,
    public operator: ComparisonOperator,
  ) {}

  toValidators(): ValidatorFn[] {
    // TODO
    return [];
  }

}
