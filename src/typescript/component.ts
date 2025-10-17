// Navbar hover images swapper

type ImageKey = 'default' | '1' | '2' | '3' | '4' | '5' | '6';

const NAVBAR_IMAGES: Record<ImageKey, string> = {
  default:
    'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cbee531d1296f9363f_navbar-default.png',
  '1': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4ccf62a312241bc9770_navbar-our-story.png',
  '2': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cb79d1daf24cbb64eb_navbar-who-we-are.png',
  '3': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cb854af244b1149371_navbar-how-we-make-it.png',
  '4': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cbda0c0b9224e02e8a_navbar-custom-pieces.png',
  '5': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cb8d31fecd33a07d78_navbar-contact.png',
  '6': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cb8d31fecd33a07d78_navbar-contact.png',
};

function getImageUrlFromDataset(el: HTMLElement | null): string {
  if (!el) return NAVBAR_IMAGES.default;
  const keyRaw = el.getAttribute('data-image')?.trim();
  if (!keyRaw) return NAVBAR_IMAGES.default;
  const key = (keyRaw as ImageKey) in NAVBAR_IMAGES ? (keyRaw as ImageKey) : 'default';
  return NAVBAR_IMAGES[key];
}

function setNavbarImage(wrapper: HTMLElement, url: string): void {
  wrapper.style.backgroundImage = `url("${url}")`;
  wrapper.style.backgroundSize = 'cover';
}

export function setupNavbarHoverImages(
  linksSelector = '.navbar_link[data-image]',
  imageWrapperSelector = '.navbar_img-wrapper.is-desktop'
): void {
  // Debug init
  // eslint-disable-next-line no-console
  console.log('[navbarImages] init', { linksSelector, imageWrapperSelector });
  const wrapper = document.querySelector<HTMLElement>(imageWrapperSelector);
  if (!wrapper) {
    // eslint-disable-next-line no-console
    console.log('[navbarImages] wrapper not found');
    return;
  }

  // Preload images (optional but helps avoid flicker)
  Object.values(NAVBAR_IMAGES).forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  // Set default on init
  setNavbarImage(wrapper, NAVBAR_IMAGES.default);
  // eslint-disable-next-line no-console
  console.log('[navbarImages] default applied');

  const mqlDesktop = window.matchMedia('(min-width: 992px)');

  const handleEnter = (target: HTMLElement) => {
    if (!mqlDesktop.matches) return;
    setNavbarImage(wrapper, getImageUrlFromDataset(target));
    // eslint-disable-next-line no-console
    console.log('[navbarImages] enter', target.getAttribute('data-image'));
  };
  const handleLeave = () => {
    if (!mqlDesktop.matches) return;
    setNavbarImage(wrapper, NAVBAR_IMAGES.default);
    // eslint-disable-next-line no-console
    console.log('[navbarImages] leave -> default');
  };

  // Event delegation to be robust to dynamic DOM (Webflow menus)
  const onMouseOver = (e: Event) => {
    const el = (e.target as HTMLElement)?.closest(linksSelector) as HTMLElement | null;
    if (el) handleEnter(el);
  };
  const onMouseOut = (e: Event) => {
    const el = (e.target as HTMLElement)?.closest(linksSelector) as HTMLElement | null;
    if (el) handleLeave();
  };
  const onFocusIn = (e: Event) => {
    const el = (e.target as HTMLElement)?.closest(linksSelector) as HTMLElement | null;
    if (el) handleEnter(el);
  };
  const onFocusOut = (e: Event) => {
    const el = (e.target as HTMLElement)?.closest(linksSelector) as HTMLElement | null;
    if (el) handleLeave();
  };

  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);
  // eslint-disable-next-line no-console
  console.log('[navbarImages] listeners attached (delegated)');

  // Reset to default when going below desktop breakpoint
  mqlDesktop.addEventListener?.('change', () => {
    if (!mqlDesktop.matches) setNavbarImage(wrapper, NAVBAR_IMAGES.default);
  });
}

// Set navbar variant on specific page and viewport
export function setupNavbarVariantOnMobile(
  pagePath = '/who-we-are',
  selector = '.navbar_component',
  maxWidthPx = 768
): void {
  if (!window.location?.pathname.includes(pagePath)) return;
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;

  const mql = window.matchMedia(`(max-width: ${maxWidthPx - 1}px)`);
  const apply = () => {
    if (mql.matches) {
      // N'applique que la combo class runtime
      el.classList.add('is-background');
    } else {
      el.classList.remove('is-background');
    }
  };
  apply();
  mql.addEventListener?.('change', apply);
}

export function setupNavbarAutoContrast(
  navbarSelector = '.navbar_light-wrapper',
  contrastSelector = '[data-contrast="dark"]',
  navbarContrastClass = 'is-contrast'
): void {
  const navbar = document.querySelector<HTMLElement>(navbarSelector);
  if (!navbar) return;

  // Ne rien faire si la navbar est une variante Webflow
  const navbarComponent = document.querySelector('.navbar_component');
  if (
    navbarComponent &&
    navbarComponent.className.split(' ').some((c) => c.startsWith('w-variant-'))
  ) {
    return;
  }

  let ticking = false;
  const evaluate = () => {
    ticking = false;
    const rect = navbar.getBoundingClientRect();
    const sampleX = Math.max(0, Math.min(window.innerWidth - 1, window.innerWidth / 2));
    const sampleY = Math.max(0, Math.min(window.innerHeight - 1, rect.top + rect.height / 2));

    const els = document.elementsFromPoint(sampleX, sampleY) as HTMLElement[];
    const hit = els.some(
      (el) => el !== navbar && (el.matches(contrastSelector) || !!el.closest(contrastSelector))
    );
    navbar.classList.toggle(navbarContrastClass, hit);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(evaluate);
    }
  };
  const onResize = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(evaluate);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  evaluate();
}

// Move up at scroll the text column in a 2 column layout section
export function setupLayout2ColMoveUp(
  sectionSelector = '.section_layout2col',
  textSelector = '.layout2col_txt-col',
  maxShiftPx = 200,
  baseOffsetPx = 200
): void {
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
