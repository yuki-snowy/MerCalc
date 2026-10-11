/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SCROLL_TO_TOP_THRESHOLD,
  applyScrollToTopVisibility,
  getWindowScrollY,
  initScrollToTop,
  shouldShowScrollToTop,
} from './scroll-to-top';

describe('shouldShowScrollToTop', () => {
  it('閾値以下では非表示', () => {
    expect(shouldShowScrollToTop(0)).toBe(false);
    expect(shouldShowScrollToTop(SCROLL_TO_TOP_THRESHOLD)).toBe(false);
  });

  it('閾値を超えたら表示', () => {
    expect(shouldShowScrollToTop(SCROLL_TO_TOP_THRESHOLD + 1)).toBe(true);
    expect(shouldShowScrollToTop(1000)).toBe(true);
  });
});

describe('getWindowScrollY', () => {
  it('scrollY を優先して返す', () => {
    expect(getWindowScrollY({ scrollY: 420, pageYOffset: 0 })).toBe(420);
  });
});

describe('applyScrollToTopVisibility', () => {
  it('表示時は is-visible を付ける', () => {
    const button = document.createElement('button');
    applyScrollToTopVisibility(button, true);
    expect(button.classList.contains('is-visible')).toBe(true);
    expect(button.getAttribute('aria-hidden')).toBe('false');
  });

  it('非表示時は is-visible を外す', () => {
    const button = document.createElement('button');
    button.classList.add('is-visible');
    applyScrollToTopVisibility(button, false);
    expect(button.classList.contains('is-visible')).toBe(false);
    expect(button.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('initScrollToTop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('スクロール量に応じて表示を切り替える', () => {
    const button = document.createElement('button');
    button.id = 'scroll-to-top';
    document.body.appendChild(button);

    let scrollY = 0;
    const listeners = new Map<string, EventListener>();
    const fakeWindow = {
      get scrollY() {
        return scrollY;
      },
      pageYOffset: 0,
      matchMedia: () => ({ matches: false }) as MediaQueryList,
      scrollTo: vi.fn(),
      addEventListener: (type: string, listener: EventListener) => {
        listeners.set(type, listener);
      },
      removeEventListener: vi.fn(),
    } as unknown as Window;

    const dispose = initScrollToTop(button, fakeWindow);
    expect(button.classList.contains('is-visible')).toBe(false);

    scrollY = SCROLL_TO_TOP_THRESHOLD + 50;
    listeners.get('scroll')?.(new Event('scroll'));
    expect(button.classList.contains('is-visible')).toBe(true);

    scrollY = 0;
    listeners.get('scroll')?.(new Event('scroll'));
    expect(button.classList.contains('is-visible')).toBe(false);

    dispose();
  });

  it('クリックで最上部へ戻る', () => {
    const button = document.createElement('button');
    const scrollTo = vi.fn();
    const fakeWindow = {
      scrollY: 500,
      pageYOffset: 500,
      matchMedia: () => ({ matches: false }) as MediaQueryList,
      scrollTo,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window;

    initScrollToTop(button, fakeWindow);
    button.click();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
