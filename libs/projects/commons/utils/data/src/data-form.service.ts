import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldDescription, ObjectType } from '@lc-ant/core';

@Injectable({
  providedIn: 'root'
})
export class DataFormService {

  constructor() {
  }

  public buildDataTypeForm(type: ObjectType): FormGroup {
    const group = new FormGroup({});
    for (const field of type.fields.entries()) {
      group.addControl(field[0], this.buildFieldControl(field[1]));
    }
    return group;
  }

  public buildFieldControl(field: FieldDescription): FormControl<any> {
    const control = new FormControl();
    control.addValidators(field.constraints.flatMap(constraint => constraint.toValidators()));
    return control;
  }

  public updateFormWith(form: FormGroup, data: any, type: ObjectType): void {
    const value: any = {};
    for (const fieldName in form.controls) {
      value[fieldName] = data[fieldName] || null;
    }
    form.setValue(value);
  }

}
