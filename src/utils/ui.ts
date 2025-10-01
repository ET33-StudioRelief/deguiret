/**Scroll top button */
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
/**<p> = svg*/
export function svgComponent() {
  document.querySelectorAll('[svg="component"]').forEach((element) => {
    const svgCode = element.textContent;
    if (svgCode !== null) {
      element.innerHTML = svgCode;
    }
  });
}

/**Custom cursor for sliders - supports multiple wrappers*/
export function sliderCustomCursor(wrapperSelector: string, swiperSelector: string): void {
  const wrappers = Array.from(document.querySelectorAll<HTMLElement>(wrapperSelector));
  if (wrappers.length === 0) return;

  wrappers.forEach((wrapper) => {
    if (wrapper.dataset.cursorInited === 'true') return;
    wrapper.dataset.cursorInited = 'true';

    // Create arrows inside the wrapper (no global ids, per-wrapper only)
    const create = (rotateDeg: number): HTMLElement => {
      const el = document.createElement('div');
      el.className = 'cc--slider-arrow';
      el.innerHTML =
        '<div class="w-embed"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="14" viewBox="0 0 17 14" fill="none"><path d="M10 1L16 7M10 13L16 7M16 7L-2.62268e-07 7" stroke="#16151D"></path></svg></div>';
      wrapper.appendChild(el);
      Object.assign(el.style, {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: '1.25rem',
        height: '1.25rem',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '0',
        visibility: 'hidden',
        zIndex: '20',
      } as CSSStyleDeclaration);
      const svg = el.querySelector('svg') as SVGElement | null;
      if (svg) {
        (svg.style as CSSStyleDeclaration).display = 'block';
        svg.style.transform = `rotate(${rotateDeg}deg)`;
        (svg.style as CSSStyleDeclaration).transformOrigin = '50% 50%';
      }
      return el;
    };

    const left = create(180);
    const right = create(0);

    // Ensure wrapper is a positioning context and not clipping
    if (getComputedStyle(wrapper).position === 'static') wrapper.style.position = 'relative';
    if (getComputedStyle(wrapper).overflow !== 'visible') wrapper.style.overflow = 'visible';

    const getSwiper = () => {
      type SwiperControls = { slidePrev: () => void; slideNext: () => void };
      type SwiperHost = { swiper?: SwiperControls } | null;
      // 1) inside wrapper
      const inside = (wrapper.querySelector(swiperSelector) as unknown as SwiperHost)?.swiper;
      if (inside) return inside;
      // 2) wrapper itself
      const self = (wrapper.matches(swiperSelector) ? wrapper : null) as unknown as SwiperHost;
      if (self?.swiper) return self.swiper;
      // 3) nearest parent
      const nearest = (wrapper.closest(swiperSelector) as unknown as SwiperHost)?.swiper;
      if (nearest) return nearest;
      // 4) sibling in same parent
      const sibling = (
        wrapper.parentElement?.querySelector(swiperSelector) as unknown as SwiperHost
      )?.swiper;
      if (sibling) return sibling;
      return null;
    };

    wrapper.addEventListener('mousemove', (ev) => {
      const rect = wrapper.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const isLeft = x < rect.width / 2;
      wrapper.style.cursor = 'none';
      left.style.visibility = isLeft ? 'visible' : 'hidden';
      right.style.visibility = isLeft ? 'hidden' : 'visible';
      const active = isLeft ? left : right;
      active.style.left = `${x}px`;
      active.style.top = `${y}px`;
    });

    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.cursor = '';
      left.style.visibility = 'hidden';
      right.style.visibility = 'hidden';
    });

    wrapper.addEventListener('click', (ev) => {
      const swiper = getSwiper();
      if (!swiper) return;
      const rect = wrapper.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      if (x < rect.width / 2) {
        swiper.slidePrev();
      } else {
        swiper.slideNext();
      }
    });
  });
}

/**
 * FAQ accordion: click on .faq_question toggles .faq_answer height (smooth animation).
 * Assumes each .faq_question has a sibling or child .faq_answer with height:0 by default.
 */
export function faqDropdown(questionSelector = '.faq_question'): void {
  const questions = Array.from(document.querySelectorAll<HTMLElement>(questionSelector));
  if (questions.length === 0) return;

  questions.forEach((q) => {
    const answer =
      q.querySelector<HTMLElement>('.faq_answer') ||
      (q.nextElementSibling?.classList.contains('faq_answer')
        ? (q.nextElementSibling as HTMLElement)
        : null);
    if (!answer) return;

    q.addEventListener('click', () => {
      const isOpen = q.classList.contains('is-open');
      if (isOpen) {
        q.classList.remove('is-open');
        answer.style.height = answer.scrollHeight + 'px';
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        answer.offsetHeight;
        answer.style.height = '0px';
      } else {
        q.classList.add('is-open');
        answer.style.height = answer.scrollHeight + 'px';
        const onEnd = (ev: TransitionEvent) => {
          if (ev.propertyName === 'height') {
            answer.style.height = 'auto';
            answer.removeEventListener('transitionend', onEnd);
          }
        };
        answer.addEventListener('transitionend', onEnd);
      }
    });
  });
}
