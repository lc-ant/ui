import { Params } from '@angular/router';

export const emailValidation = new RegExp('^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');

export class LcAntUtils {

  public static removeArrayElement<T>(array: T[] | null | undefined, element: T): boolean {
    if (!array) return false;
    const index = array.indexOf(element);
    if (index < 0) return false;
    array.splice(index, 1);
    return true;
  }

  public static arraysContainSameElements<T>(array1: T[], array2: T[], comparator: (element1: T, element2: T) => boolean = (e1, e2) => e1 === e2) {
    if (array1.length !== array2.length) return false;
    const remaining2 = [...array2];
    for (const element1 of array1) {
      const index = LcAntUtils.indexOf(remaining2, element1, comparator);
      if (index < 0) return false;
      remaining2.splice(index, 1);
    }
    return true;
  }

  public static indexOf<T>(array: T[], element: T, comparator: (element1: T, element2: T) => boolean = (e1, e2) => e1 === e2): number {
    for (let index = 0; index < array.length; ++index) {
      if (comparator(element, array[index])) return index;
    }
    return -1;
  }

  public static distinct<T>(array: T[], comparator: (element1: T, element2: T) => boolean = (e1, e2) => e1 === e2): T[] {
    const newArray: T[] = [];
    for (const element of array) {
      const index = LcAntUtils.indexOf(newArray, element, comparator);
      if (index < 0) newArray.push(element);
    }
    return newArray;
  }

  public static leftPadding(s: string, padding: string, nbChars: number): string {
    while (s.length < nbChars) {
      s = padding + s;
    }
    return s;
  }

  public static stringToDate(date?: string | Date): Date | undefined {
    return date ? (date instanceof Date ? date : new Date(date)) : undefined;
  }

  public static dateToSQLString(date?: Date): string | undefined {
    if (!date) return undefined;
    return LcAntUtils.leftPadding('' + date.getFullYear(), '0', 4)
      + '-' + LcAntUtils.leftPadding('' + (date.getMonth() + 1), '0', 2)
      + '-' + LcAntUtils.leftPadding('' + date.getDate(), '0', 2);
  }

  public static timestampMillisToDate(date?: number | Date): Date | undefined {
    return date ? (date instanceof Date ? date : new Date(date)) : undefined;
  }

  public static timestampSecondsToDate(date?: number | Date): Date | undefined {
    return date ? (date instanceof Date ? date : new Date(date * 1000)) : undefined;
  }

  public static parseQueryParams(url: string): Params {
    const q = url.indexOf('?');
    if (q < 0) return {};
    const query = url.substring(q + 1);
    const queryParams: Params = {};
    const search = /([^&=]+)=?([^&]*)/g;
    const decode = (s: string) => decodeURIComponent(s.replace(/\+/g, ' '));
    let match;
    while (match = search.exec(query))
      queryParams[decode(match[1])] = decode(match[2]);
    return queryParams;
  }

}
