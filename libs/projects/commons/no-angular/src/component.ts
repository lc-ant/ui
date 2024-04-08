import { BehaviorSubject, Observable } from 'rxjs';
import { LcAntUtils, Resubscribeables, Subscriptions } from '@lc-ant/core';

const NOANGULAR_ATTRIBUTE = '_lcantnoangular';

export abstract class NoAngularComponent<T extends HTMLElement> {

  protected _element!: T;
  protected subscriptions = new Subscriptions();
  protected subscriptionsVisible = new Resubscribeables();
  protected _visible = new BehaviorSubject<boolean>(false);

  protected _children: NoAngularComponent<any>[] = [];
  protected _parent?: NoAngularComponent<any>;

  public customData: any = {};

  constructor(noBuild: boolean | undefined = false, noCreateElement: boolean | undefined = false) {
    if (!noCreateElement) {
      this.__initElement();
      if (!noBuild) this._build();
    }
  }

  protected __initElement(): void {
    this._element = this._createElement();
    this._element.classList.add(this.constructor.name);
    (<any>this._element)[NOANGULAR_ATTRIBUTE] = this;
  }

  protected abstract _createElement(): T;

  protected abstract _build(): void;

  protected abstract _destroy(): void;

  public get element(): T {
    return this._element;
  }

  public get parent(): NoAngularComponent<any> | undefined {
    return this._parent;
  }

  public get children(): NoAngularComponent<any>[] {
    return [...this._children];
  }

  public get isVisible$(): Observable<boolean> {
    return this._visible;
  }

  public shown(): void {
    if (this._visible.value) return;
    this._visible.next(true);
    this.subscriptionsVisible.resume();
    for (const c of this._children) c.shown();
  }

  public hidden(): void {
    if (!this._visible.value) return;
    this.subscriptionsVisible.pause();
    this._visible.next(false);
    for (const c of this._children) c.hidden();
  }

  public destroy(): void {
    this.subscriptionsVisible.stop();
    this.subscriptions.unsusbcribe();
    this._destroy();
    for (const c of this._children) c.destroy();
    this._children = [];
  }

  public appendChild(child: NoAngularComponent<any>): this {
    if (child.element.parentElement) {
      const parentComponent: NoAngularComponent<any> | null = child.element.parentElement[NOANGULAR_ATTRIBUTE];
      if (parentComponent) {
        if (parentComponent === this) {
          if (this._children[this._children.length - 1] === child) return this;
          return this.moveChildAt(this._children.length - 1, child);
        }
        parentComponent.removeChild(child, false);
      }
    }
    this._children.push(child);
    this._element.appendChild(child.element);
    child._parent = this;
    return this;
  }

  public removeChild(child: NoAngularComponent<any>, destroy: boolean = true): this {
    if (LcAntUtils.removeArrayElement(this._children, child)) {
      this._element.removeChild(child.element);
      if (destroy) {
        child.destroy();
      }
      child._parent = undefined;
    }
    return this;
  }

  public addChildAt(index: number, child: NoAngularComponent<any>): this {
    if (this._children.length <= index) return this.appendChild(child);
    if (child.element.parentElement) {
      const parentComponent: NoAngularComponent<any> | null = child.element.parentElement[NOANGULAR_ATTRIBUTE];
      if (parentComponent) {
        if (parentComponent === this) {
          if (this._children[index] === child) return this;
          return this.moveChildAt(index, child);
        }
        parentComponent.removeChild(child, false);
      }
    }
    this._element.insertBefore(child.element, this._children[index].element);
    this._children.splice(index, 0, child);
    child._parent = this;
    return this;
  }

  public moveChildAt(index: number, child: NoAngularComponent<any>): this {
    const currentIndex = this._children.indexOf(child);
    if (currentIndex < 0) return this.addChildAt(index, child);
    this._children.splice(currentIndex, 1);
    this._element.removeChild(child.element);
    if (index >= this._children.length) {
      this._children.push(child);
      this._element.appendChild(child.element);
    } else {
      this._children.splice(index, 0, child);
      this._element.insertBefore(child.element, this._children[index + 1].element);
    }
    return this;
  }

  public reorgChildren(expected: NoAngularComponent<any>[]): this {
    let i;
    for (i = 0; i < expected.length; ++i) {
      if (this._children.length > i && this._children[i] === expected[i]) continue;
      this.addChildAt(i, expected[i]);
    }
    while (i < this._children.length) this.removeChild(this._children[i]);
    return this;
  }

}
