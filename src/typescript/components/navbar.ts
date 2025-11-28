// Navbar hover images swapper

export function setupNavbarHoverImages(
  linksSelector = '.navbar_link[data-image-url]',
  imageWrapperSelector = '.navbar_img-wrapper.is-desktop'
): void {
  const wrapper = document.querySelector<HTMLElement>(imageWrapperSelector);
  if (!wrapper) return;

  const mql = window.matchMedia('(min-width: 992px)');
  const initialBG = getComputedStyle(wrapper).backgroundImage;

  // Crossfade overlay method (base + overlay)
  if (getComputedStyle(wrapper).position === 'static') wrapper.style.position = 'relative';
  if (getComputedStyle(wrapper).overflow !== 'hidden') wrapper.style.overflow = 'hidden';

  const makeLayer = (): HTMLDivElement => {
    const d = document.createElement('div');
    d.style.position = 'absolute';
    d.style.inset = '0';
    d.style.backgroundSize = 'cover';
    d.style.backgroundPosition = 'center';
    d.style.transition = 'opacity 260ms ease';
    d.style.opacity = '0';
    wrapper.appendChild(d);
    return d;
  };
  const baseLayer = makeLayer();
  const overlay = makeLayer();
  baseLayer.style.opacity = '1';
  baseLayer.style.backgroundImage = initialBG && initialBG !== 'none' ? initialBG : '';
  overlay.style.opacity = '0';
  let currentUrl: string | null = initialBG && initialBG !== 'none' ? initialBG : null;

  const setBG = (url: string | null) => {
    const targetImg = url ? `url("${url}")` : initialBG || '';
    if (currentUrl === targetImg) return; // rien à faire
    // Prépare l'overlay et crossfade
    overlay.style.transition = 'opacity 350ms ease';
    overlay.style.backgroundImage = targetImg;
    overlay.style.opacity = '1';
    const onEnd = () => {
      overlay.removeEventListener('transitionend', onEnd);
      baseLayer.style.backgroundImage = targetImg;
      overlay.style.opacity = '0';
      currentUrl = targetImg;
    };
    overlay.addEventListener('transitionend', onEnd);
  };

  // Preload
  document.querySelectorAll<HTMLElement>(linksSelector).forEach((a) => {
    const u = a.getAttribute('data-image-url');
    if (u) {
      const img = new Image();
      img.src = u;
    }
  });

  const onEnter = (e: Event) => {
    if (!mql.matches) return;
    const el = e.currentTarget as HTMLElement;
    const url = el.getAttribute('data-image-url');
    if (url) setBG(url);
  };
  const onLeave = () => {
    if (!mql.matches) return;
    setBG(null);
  };

  document.querySelectorAll<HTMLElement>(linksSelector).forEach((a) => {
    a.addEventListener('mouseenter', onEnter);
    a.addEventListener('focusin', onEnter);
    a.addEventListener('mouseleave', onLeave);
    a.addEventListener('focusout', onLeave);
  });

  mql.addEventListener?.('change', () => {
    // reset to initial image
    setBG(null);
  });
}

// Add variant background on mobile for specific page
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
//NAVBAR AUTO CONTRAST - LOGO DARK/LIGHT
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

// Enable menu opening by clicking on navbar_menu-txt
export function setupNavbarMenuTextClick(): void {
  const menuText = document.querySelector<HTMLElement>('.navbar_menu-txt');
  const menuButton = document.querySelector<HTMLElement>('.navbar_menu-button, .w-nav-button');

  if (!menuText || !menuButton) return;

  menuText.addEventListener('click', () => {
    // Déclencher un clic sur le bouton menu pour ouvrir/fermer le menu
    menuButton.click();
  });

  // Optionnel: ajouter un style cursor pointer pour indiquer que c'est cliquable
  menuText.style.cursor = 'pointer';
}

// Navbar background when not overlapping a hero section
export function setupNavbarBackgroundNonHero(
  navbarSelector = '.navbar_component',
  sectionSelector = 'section',
  keyword = 'hero'
): void {
  const navbar = document.querySelector<HTMLElement>(navbarSelector);
  if (!navbar) return;

  // Skip if Webflow variant is applied (let designer control)
  if (navbar.className.split(' ').some((c) => c.startsWith('w-variant-'))) return;

  let ticking = false;
  const evaluate = () => {
    ticking = false;
    const rect = navbar.getBoundingClientRect();
    const sampleX = Math.max(0, Math.min(window.innerWidth - 1, window.innerWidth / 2));
    const sampleY = Math.max(0, Math.min(window.innerHeight - 1, rect.top + rect.height / 2));
    const els = document.elementsFromPoint(sampleX, sampleY) as HTMLElement[];
    const isOverHero = els.some((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.matches(sectionSelector) || el.closest(sectionSelector)) {
        const target = (
          el.matches(sectionSelector) ? el : el.closest(sectionSelector)
        ) as HTMLElement;
        const txt = `${target.id} ${target.className}`.toLowerCase();
        return txt.includes(keyword.toLowerCase());
      }
      return false;
    });

    if (isOverHero) {
      navbar.style.backgroundColor = 'transparent';
    } else {
      navbar.style.backgroundColor = 'var(--_brand---background--primary)';
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(evaluate);
    }
  };
  const onResize = onScroll;

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  evaluate();
}

// Navbar hide/show on scroll down/up
/*export function initNavbarScroll(): void {
  const navbar = document.querySelector<HTMLElement>('.navbar_component');

  if (!navbar) {
    return;
  }

  // Ajouter une transition smooth pour le transform
  navbar.style.transition = 'transform 0.5s ease-in-out';

  let lastScrollY = window.scrollY;
  let isScrolling = false;

  const handleScroll = () => {
    if (isScrolling) {
      return;
    }

    isScrolling = true;
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

      if (scrollDirection === 'down' && currentScrollY > 0) {
        // Scroll down : déplacer la navbar vers le haut de 5rem
        navbar.style.transform = 'translateY(-5rem)';
      } else {
        // Scroll up : remettre la navbar à sa position initiale
        navbar.style.transform = 'translateY(0)';
      }

      lastScrollY = currentScrollY;
      isScrolling = false;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}*/
