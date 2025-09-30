export function setupScrollTop(buttonId = 'scroll-top', thresholdPx = 200): void {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  const toggle = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y > thresholdPx) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
export function svgComponent() {
  document.querySelectorAll('[svg="component"]').forEach((element) => {
    const svgCode = element.textContent;
    if (svgCode !== null) {
      element.innerHTML = svgCode;
    }
  });
}

/**
 * Custom cursor for hero slider: shows left/right arrow based on half hovered.
 * Expects two elements in DOM (initially display:none):
 *  .cc--slider-arrow.custom-pieces-left-nav
 *  .cc--slider-arrow.custom-pieces-right-nav
 */
export function setupHeroCustomCursor(
  wrapperSelector = '.hero-slider_content',
  bgSwiperSelector = '.swiper.is-custom-pieces-bg'
): void {
  const wrapper = document.querySelector<HTMLElement>(wrapperSelector);
  if (!wrapper) return;

  // Ensure arrows exist; create if missing (self-contained, no CSS dependency)
  const ensureArrow = (id: string, className: string, rotateDeg = 0): HTMLElement => {
    let el = document.getElementById(id) as HTMLElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.className = `cc--slider-arrow ${className}`;
      el.innerHTML =
        '<div class="w-embed"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="14" viewBox="0 0 17 14" fill="none"><path d="M10 1L16 7M10 13L16 7M16 7L-2.62268e-07 7" stroke="#16151D"></path></svg></div>';
      wrapper.appendChild(el);
    }
    // Minimal inline styles to avoid breaking layout
    Object.assign(el.style, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: '1.25rem',
      height: '1.25rem',
      transform: `translate(-50%, -50%) rotate(${rotateDeg}deg)`,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: '0',
      visibility: 'hidden',
      zIndex: '20',
    } as CSSStyleDeclaration);
    // Ensure inner markup does not introduce extra whitespace
    const embed = el.querySelector('.w-embed') as HTMLElement | null;
    if (embed) {
      embed.style.display = 'block';
      embed.style.lineHeight = '0';
    }
    const svg = el.querySelector('svg') as SVGElement | null;
    if (svg) {
      (svg.style as CSSStyleDeclaration).display = 'block';
    }
    return el;
  };

  const left = ensureArrow('custom-pieces-left-nav', 'is-custom-pieces-left-nav', 180);
  const right = ensureArrow('custom-pieces-right-nav', 'is-custom-pieces-right-nav', 0);

  const bgEl = wrapper.querySelector<HTMLElement>(bgSwiperSelector);
  const bgSwiper = (
    bgEl as unknown as { swiper?: { slidePrev: () => void; slideNext: () => void } }
  )?.swiper;

  const move = (ev: MouseEvent) => {
    const rect = wrapper.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const isLeft = x < rect.width / 2;
    // Hide native cursor while inside
    wrapper.style.cursor = 'none';
    left.style.visibility = isLeft ? 'visible' : 'hidden';
    right.style.visibility = isLeft ? 'hidden' : 'visible';

    const active = isLeft ? left : right;
    active.style.left = `${x}px`;
    active.style.top = `${y}px`;
  };

  const hide = () => {
    wrapper.style.cursor = '';
    left.style.visibility = 'hidden';
    right.style.visibility = 'hidden';
  };

  wrapper.addEventListener('mousemove', move);
  wrapper.addEventListener('mouseleave', hide);

  // Click → navigate BG swiper if available
  wrapper.addEventListener('click', (ev) => {
    if (!bgSwiper) return;
    const rect = wrapper.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const isLeft = x < rect.width / 2;
    if (isLeft) {
      bgSwiper.slidePrev();
    } else {
      bgSwiper.slideNext();
    }
  });
}
