export interface Patch {

  fieldName: string;

}

export class PatchSetField implements Patch {

  constructor(
    public fieldName: string,
    public value: number | string | null,
  ) {}

}

export class PatchIntegerField implements Patch {

  constructor(
    public fieldName: string,
    public addInteger: number,
  ) {}

}

export class PatchAppendElement implements Patch {

  constructor(
    public fieldName: string,
    public elementToAppend: number | string | null,
  ) {}
}

export class PatchRemoveElement implements Patch {

  constructor(
    public fieldName: string,
    public elementToRemove: number | string | null,
  ) {}
}
