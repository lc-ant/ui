export class HtmlUtils {

  public static applyStyle(element: HTMLElement, style: any): void {
    if (style) {
      const es: any = element.style;
      for (const name in style) {
        if (Object.prototype.hasOwnProperty.call(style, name)) {
          es[name] = style[name];
        }
      }
    }
  }

  public static dragHorizontally(
    element: HTMLElement,
    moveInElement: HTMLElement,
    initialValue: number,
    minimumValue: number,
    maximumValue: number,
    onMove: (newValue: number) => any,
    initialPosition: number,
    initialMouseEvent: MouseEvent,
    onEnd: (finalValue: number) => any
  ): void {
    HtmlUtils.applyStyle(element, {
      position: 'absolute',
      left: initialPosition + 'px',
    });
    moveInElement.appendChild(element);
    let startX = initialMouseEvent.screenX;
    let currentX = startX;
    let currentValue = initialValue;
    const onmousemove = (event: MouseEvent) => {
      const x = event.screenX;
      if (x === currentX) return;
      currentX = x;
      let diff = x - startX;
      if (initialValue + diff < minimumValue) {
        diff = minimumValue - initialValue;
      }
      if (maximumValue != -1 && initialValue + diff > maximumValue) {
        diff = maximumValue - initialValue;
      }
      currentValue = initialValue + diff;
      element.style['left'] = (initialPosition + currentValue - initialValue) + 'px';
      onMove(currentValue);
    };
    const onend = () => {
      console.log('end');
      document.removeEventListener('mousemove', onmousemove);
      document.removeEventListener('mouseup', onend);
      document.removeEventListener('mouseleave', onend);
      moveInElement.removeChild(element);
      onEnd(currentValue);
    };
    document.addEventListener('mousemove', onmousemove);
    document.addEventListener('mouseup', onend);
    document.addEventListener('mouseleave', onend);
  }

}
