/** この量を超えてスクロールしたら「上部へ戻る」を表示 */
export const SCROLL_TO_TOP_THRESHOLD = 320;

export function shouldShowScrollToTop(
  scrollY: number,
  threshold = SCROLL_TO_TOP_THRESHOLD,
): boolean {
  return scrollY > threshold;
}

export function getWindowScrollY(
  win: Pick<Window, 'scrollY' | 'pageYOffset'> = window,
): number {
  if (typeof win.scrollY === 'number') return win.scrollY;
  return win.pageYOffset ?? 0;
}

export function applyScrollToTopVisibility(
  button: HTMLElement,
  visible: boolean,
): void {
  button.classList.toggle('is-visible', visible);
  button.setAttribute('aria-hidden', visible ? 'false' : 'true');
}

export function initScrollToTop(
  button: HTMLElement | null = typeof document !== 'undefined'
    ? document.getElementById('scroll-to-top')
    : null,
  win: Window = typeof window !== 'undefined' ? window : (undefined as never),
): () => void {
  if (!button || !win) return () => {};

  const syncVisibility = () => {
    applyScrollToTopVisibility(
      button,
      shouldShowScrollToTop(getWindowScrollY(win)),
    );
  };

  const onClick = () => {
    const reduceMotion = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    win.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  button.addEventListener('click', onClick);
  win.addEventListener('scroll', syncVisibility, { passive: true });
  syncVisibility();

  return () => {
    button.removeEventListener('click', onClick);
    win.removeEventListener('scroll', syncVisibility);
  };
}
