//Layout 2 column
export function setupLayout2ColMoveUp(
  sectionSelector = '.section_layout2col',
  textSelector = '.layout2col_txt-col',
  maxShiftPx = 200,
  baseOffsetPx = 200
): void {
  // Actif uniquement au-dessus de 992px
  const mqlDesktop = window.matchMedia('(min-width: 992px)');
  if (!mqlDesktop.matches) return;

  const sections = Array.from(document.querySelectorAll<HTMLElement>(sectionSelector));
  if (sections.length === 0) return;

  const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

  sections.forEach((section) => {
    const textCol = section.querySelector<HTMLElement>(textSelector);
    if (!textCol) return;

    let inView = false;
    let ticking = false;

    textCol.style.willChange = 'transform';

    const update = (): void => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
      // Démarre plus bas (baseOffsetPx) puis monte jusqu'à -maxShiftPx
      const translateY = Math.round(baseOffsetPx - progress * (maxShiftPx + baseOffsetPx));
      textCol.style.transform = `translateY(${translateY}px)`;
    };

    const schedule = (): void => {
      if (!inView) return;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) schedule();
        },
        { threshold: 0 }
      );
      io.observe(section);
    } else {
      inView = true;
    }

    window.addEventListener('scroll', schedule, { passive: true } as AddEventListenerOptions);
    window.addEventListener('resize', schedule);
    update();
  });
}
//CTA
export function ctaParallax(
  sectionSelector = '.section_cta',
  imgSelector = '.cta_img-bg',
  amplitudePx = 100
): void {
  const section = document.querySelector<HTMLElement>(sectionSelector);
  const bgImg =
    section?.querySelector<HTMLElement>(imgSelector) ||
    document.querySelector<HTMLElement>(imgSelector);
  if (!section || !bgImg) return;

  let inView = false;
  let ticking = false;

  const clamp = (value: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, value));

  const update = (): void => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
    const shift = -Math.round(progress * amplitudePx);
    bgImg.style.transform = `translateY(${shift}px)`;
  };

  const schedule = (): void => {
    if (!inView) return;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) schedule();
      },
      { threshold: 0 }
    );
    io.observe(section);
  } else {
    inView = true;
  }

  window.addEventListener('scroll', schedule, { passive: true } as AddEventListenerOptions);
  window.addEventListener('resize', schedule);
  update();
}
