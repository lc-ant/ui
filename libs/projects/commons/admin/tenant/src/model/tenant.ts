import { FieldDescription, FieldType, ObjectType, ApiDataType, StringLengthConstraint, ComparisonOperator, CompareToFieldConstraint, MandatoryConstraint } from '@lc-ant/core';

export const TenantType = new ObjectType(new Map<string, FieldDescription>([
  ...ApiDataType.fields,
  ['publicId', new FieldDescription(FieldType.STRING, false, [new MandatoryConstraint(), new StringLengthConstraint(3, 30)], 'admin-tenant', 'fields.publicId')],
  ['displayName', new FieldDescription(FieldType.STRING, false, [new MandatoryConstraint(), new StringLengthConstraint(3, 100)], 'admin-tenant', 'fields.displayName')],
  ['validityStart', new FieldDescription(FieldType.DATE, true, [new CompareToFieldConstraint('validityEnd', ComparisonOperator.LESS)], 'admin-tenant', 'fields.validityStart')],
  ['validityEnd', new FieldDescription(FieldType.DATE, true, [new CompareToFieldConstraint('validityStart', ComparisonOperator.GREATER)], 'admin-tenant', 'fields.validityEnd')],
]))
.main('displayName');
