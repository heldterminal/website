// Scroll utility helpers for smooth animations

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutQuart = (t: number): number => {
  return 1 - Math.pow(1 - t, 4);
};

export const easeInOutQuart = (t: number): number => {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
};

export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
};

export const getScrollProgress = (
  element: HTMLElement,
  startOffset: number = 0,
  endOffset: number = 0
): number => {
  const rect = element.getBoundingClientRect();
  const elementHeight = element.offsetHeight;
  const viewportHeight = window.innerHeight;
  
  const start = -startOffset;
  const end = -(elementHeight - viewportHeight + endOffset);
  
  return clamp((rect.top - start) / (end - start), 0, 1);
};

export const getViewportScrollProgress = (
  element: HTMLElement,
  startViewportPercent: number = 0.8,
  endViewportPercent: number = 0.2
): number => {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  const start = viewportHeight * startViewportPercent;
  const end = viewportHeight * endViewportPercent;
  
  return clamp((start - rect.top) / (start - end), 0, 1);
};