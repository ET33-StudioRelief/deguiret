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
export function sliderCustomCursor(
  wrapperSelector: string,
  swiperSelector: string,
  excludeSelector?: string
): void {
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
      // Désactiver le curseur custom si on survole un élément exclu
      if (excludeSelector && (ev.target as HTMLElement)?.closest(excludeSelector)) {
        wrapper.style.cursor = '';
        left.style.visibility = 'hidden';
        right.style.visibility = 'hidden';
        return;
      }
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
      if (excludeSelector && (ev.target as HTMLElement)?.closest(excludeSelector)) {
        return; // ne pas déclencher la nav du slider si exclu
      }
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
 * Cursor custom au survol des boutons: remplace le curseur par un rond flouté.
 * Utilise un overlay fixe pour conserver les variables CSS (couleur).
 */
export function setupButtonHoverCursor(buttonSelector = '.button', sizePx = 24): void {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>(buttonSelector));
  if (buttons.length === 0) return;

  // Création unique de l'overlay curseur
  const cursor = document.createElement('div');
  cursor.setAttribute('aria-hidden', 'true');
  cursor.style.position = 'fixed';
  cursor.style.left = '0px';
  cursor.style.top = '0px';
  cursor.style.width = `${sizePx}px`;
  cursor.style.height = `${sizePx}px`;
  cursor.style.pointerEvents = 'none';
  cursor.style.transform = 'translate(-50%, -50%)';
  cursor.style.zIndex = '9999';
  cursor.style.display = 'none';
  // SVG inline pour blur + clip, garde la couleur via CSS variables
  cursor.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none">
  <foreignObject x="0" y="0" width="24" height="24">
    <div xmlns="http://www.w3.org/1999/xhtml" style="backdrop-filter:blur(0.5px);clip-path:url(#bgblur_0_2760_4819_clip_path);height:100%;width:100%"></div>
  </foreignObject>
  <g filter="url(#filter0_f_2760_4819)" data-figma-bg-blur-radius="1">
    <circle cx="12" cy="12" r="10" fill="var(--_brand---background--button-hover)" fill-opacity="0.75"/>
  </g>
  <defs>
    <filter id="filter0_f_2760_4819" x="0" y="0" width="24" height="24" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_2760_4819"/>
    </filter>
    <clipPath id="bgblur_0_2760_4819_clip_path" transform="translate(0 0)">
      <circle cx="12" cy="12" r="10"/>
    </clipPath>
  </defs>
</svg>`;
  document.body.appendChild(cursor);

  let ticking = false;
  let visible = false;

  const setPos = (ev: MouseEvent) => {
    const x = ev.clientX;
    const y = ev.clientY;
    (cursor.style as CSSStyleDeclaration).left = `${x}px`;
    (cursor.style as CSSStyleDeclaration).top = `${y}px`;
  };

  const onMove = (ev: MouseEvent) => {
    if (!visible) return;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setPos(ev);
      });
    }
  };

  const show = (ev: MouseEvent) => {
    visible = true;
    buttons.forEach((b) => {
      b.style.cursor = 'none';
    });
    cursor.style.display = 'block';
    setPos(ev);
    window.addEventListener('mousemove', onMove, { passive: true });
  };
  const hide = () => {
    visible = false;
    buttons.forEach((b) => {
      b.style.cursor = '';
    });
    cursor.style.display = 'none';
    window.removeEventListener('mousemove', onMove as EventListener);
  };

  buttons.forEach((btn) => {
    btn.addEventListener('mouseenter', show as EventListener);
    btn.addEventListener('mouseleave', hide);
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
