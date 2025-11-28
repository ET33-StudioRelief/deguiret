import Swiper from 'swiper';
import { Autoplay, Controller, Pagination } from 'swiper/modules';

export function swiperStep() {
  // Guard: init seulement s'il existe au moins un wrapper de slider step
  const wrappers = Array.from(document.querySelectorAll<HTMLElement>('.step_slider-wrapper'));
  if (wrappers.length === 0) return;

  wrappers.forEach((wrapper) => {
    const swiperEl = wrapper.querySelector<HTMLElement>('.swiper.is-step');
    if (!swiperEl) return;
    if (swiperEl.dataset.swiperInitialized === 'true') return;

    // Pagination et navigation strictement dans le wrapper courant
    const paginationEl = wrapper.querySelector<HTMLElement>('.swiper-pagination.is-step');

    new Swiper(swiperEl, {
      modules: [Pagination, Autoplay],
      direction: 'horizontal',
      slidesPerView: 1,
      speed: 800,
      effect: 'slide',
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      loop: true,
      allowTouchMove: true,
      pagination: paginationEl
        ? {
            el: paginationEl,
            clickable: true,
            bulletClass: 'swiper-bullet',
            bulletActiveClass: 'is-active',
            renderBullet: (_: number, className: string) => `<span class="${className}"></span>`,
          }
        : false,
    });

    swiperEl.dataset.swiperInitialized = 'true';
  });
}

export function swiperCustomPieces(): void {
  document.querySelectorAll<HTMLElement>('.hero-slider_content').forEach((wrapper) => {
    const bg = wrapper.querySelector('.swiper.is-custom-pieces-bg') as HTMLElement | null;
    const front = wrapper.querySelector('.swiper.is-custom-pieces-front') as HTMLElement | null;
    if (!bg || !front) return;

    const bgSwiper = new Swiper(bg, {
      modules: [Controller],
      slidesPerView: 1,
      speed: 700,
      effect: 'slide',
      loop: true,
      allowTouchMove: true,
    });

    const frontSwiper = new Swiper(front, {
      modules: [Controller],
      slidesPerView: 1,
      speed: 700,
      effect: 'slide',
      fadeEffect: { crossFade: true },
      loop: true,
      allowTouchMove: false, // navigation pilotée par le BG (ou par boutons communs)
    });

    // Sync bidirectionnelle, mais c'est le BG qui pilote principalement
    // BG -> FRONT
    bgSwiper.controller.control = frontSwiper;
    bgSwiper.on('slideChange', () => {
      frontSwiper.slideToLoop(bgSwiper.realIndex, 0, false);
    });
    // FRONT -> BG (au cas où on déclenche via API/boutons sur le front)
    frontSwiper.controller.control = bgSwiper;
    frontSwiper.on('slideChange', () => {
      bgSwiper.slideToLoop(frontSwiper.realIndex, 0, false);
    });

    // Navigation sous 992px si des boutons existent (custom pieces)
    const mql = window.matchMedia('(max-width: 991px)');
    const navigationWrap = wrapper.querySelector(
      '.swiper-navigation.is-mobile.is-hero-custom-pieces'
    ) as HTMLElement | null;
    const prevBtn = navigationWrap?.querySelector('.swiper-button-prev') as HTMLElement | null;
    const nextBtn = navigationWrap?.querySelector('.swiper-button-next') as HTMLElement | null;
    const updateNav = () => {
      if (!navigationWrap) return;
      navigationWrap.style.display = mql.matches ? 'flex' : 'none';
    };
    if (navigationWrap && prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => bgSwiper.slidePrev());
      nextBtn.addEventListener('click', () => bgSwiper.slideNext());
      updateNav();
      mql.addEventListener('change', updateNav);
    }
  });
}

export function swiperTestimonial(): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('.swiper.is-testimonial'));
  if (elements.length === 0) return;

  elements.forEach((el) => {
    if (el.dataset.swiperInitialized === 'true') return;

    const inner = el.querySelector('.swiper-pagination.is-testimonial') as HTMLElement | null;
    const sibling =
      !inner && el.parentElement
        ? (el.parentElement.querySelector(
            '.swiper-pagination.is-testimonial'
          ) as HTMLElement | null)
        : null;
    const paginationEl = inner || sibling;

    new Swiper(el, {
      modules: [Pagination],
      direction: 'horizontal',
      slidesPerView: 1,
      speed: 500,
      effect: 'slide',
      loop: true,
      allowTouchMove: true,
      pagination: paginationEl
        ? {
            el: paginationEl,
            clickable: true,
            bulletClass: 'swiper-bullet',
            bulletActiveClass: 'is-active',
            renderBullet: (_: number, className: string) => `<span class="${className}"></span>`,
          }
        : false,
    });

    el.dataset.swiperInitialized = 'true';
  });
}

// Product slider with pagination
export function swiperProduct(): void {
  const containers = Array.from(document.querySelectorAll<HTMLElement>('.product-slider_content'));
  if (containers.length === 0) return;

  containers.forEach((container) => {
    const main = container.querySelector<HTMLElement>('.swiper.is-product');
    if (!main) return;
    if (main.dataset.swiperInitialized === 'true') return;

    // Pagination dans le container
    const paginationEl = container.querySelector<HTMLElement>('.swiper-pagination.is-product');

    // Init main slider with pagination module
    const mainInstance = new Swiper(main, {
      modules: [Pagination],
      direction: 'horizontal',
      slidesPerView: 1,
      speed: 500,
      effect: 'slide',
      loop: true,
      allowTouchMove: true,
      pagination: paginationEl
        ? {
            el: paginationEl,
            clickable: true,
            bulletClass: 'swiper-bullet',
            bulletActiveClass: 'is-active',
            renderBullet: (_: number, className: string) => `<span class="${className}"></span>`,
          }
        : false,
    });

    main.dataset.swiperInitialized = 'true';

    // Navigation sous 992px si des boutons existent (product)
    const mql = window.matchMedia('(max-width: 991px)');
    const navigationWrap = container.querySelector(
      '.swiper-navigation.is-mobile.is-product'
    ) as HTMLElement | null;
    const prevBtn = navigationWrap?.querySelector('.swiper-button-prev') as HTMLElement | null;
    const nextBtn = navigationWrap?.querySelector('.swiper-button-next') as HTMLElement | null;
    const updateNav = () => {
      if (!navigationWrap) return;
      navigationWrap.style.display = mql.matches ? 'flex' : 'none';
    };
    if (navigationWrap && prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => mainInstance.slidePrev());
      nextBtn.addEventListener('click', () => mainInstance.slideNext());
      updateNav();
      mql.addEventListener('change', updateNav);
    }
  });
}

// Collection slider: 5 slides in viewport, 80px spacing, loop
export function swiperCollection(): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('.swiper.is-collection'));
  if (elements.length === 0) return;

  elements.forEach((el) => {
    if (el.dataset.swiperInitialized === 'true') return;
    const instance = new Swiper(el, {
      slidesPerView: 5,
      spaceBetween: 80,
      loop: true,
      speed: 600,
      allowTouchMove: true,
      watchOverflow: true,
      watchSlidesProgress: true,
      // Responsive defaults (optional)
      breakpoints: {
        0: { slidesPerView: 1, spaceBetween: 16 },
        480: { slidesPerView: 1, spaceBetween: 24 },
        768: { slidesPerView: 3, spaceBetween: 40 },
        992: { slidesPerView: 3, spaceBetween: 60 },
        1200: { slidesPerView: 5, spaceBetween: 80 },
      },
      on: {
        // Mise à jour continue de l'échelle (effet lissé)
        afterInit() {
          updateCollectionScale(el);
        },
        setTranslate() {
          updateCollectionScale(el);
        },
        slideChange() {
          updateCollectionScale(el);
        },
        resize() {
          updateCollectionScale(el);
        },
      },
    });
    el.dataset.swiperInitialized = 'true';

    // Navigation sous 992px si des boutons existent (collection)
    const mql = window.matchMedia('(max-width: 991px)');
    const container =
      (el.closest('.collection-slider_content') as HTMLElement | null) || el.parentElement;
    const navigationWrap = container
      ? (container.querySelector(
          '.swiper-navigation.is-mobile.is-collection'
        ) as HTMLElement | null)
      : null;
    const prevBtn = navigationWrap?.querySelector('.swiper-button-prev') as HTMLElement | null;
    const nextBtn = navigationWrap?.querySelector('.swiper-button-next') as HTMLElement | null;
    const updateNav = () => {
      if (!navigationWrap) return;
      navigationWrap.style.display = mql.matches ? 'flex' : 'none';
    };
    if (navigationWrap && prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => instance.slidePrev());
      nextBtn.addEventListener('click', () => instance.slideNext());
      updateNav();
      mql.addEventListener('change', updateNav);
    }
  });
}

function updateCollectionScale(root: HTMLElement): void {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('.swiper-slide'));
  if (slides.length === 0) return;
  const { swiper } = root as unknown as { swiper?: Swiper };
  const isWide = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  const effectiveSlidesPerView =
    typeof swiper?.params?.slidesPerView === 'number'
      ? swiper.params.slidesPerView
      : (swiper?.slidesPerViewDynamic?.() ?? slides.length);
  const restrictClick = isWide && effectiveSlidesPerView > 1;

  // Helper: active uniquement le lien de la slide centrée
  const updateAnchorClickability = () => {
    slides.forEach((slide) => {
      const link = slide.querySelector<HTMLAnchorElement>('.collection-slider_card a');
      if (!link) return;
      if (!restrictClick || slide.classList.contains('is-center')) {
        link.style.pointerEvents = '';
        link.removeAttribute('aria-disabled');
        link.removeAttribute('tabindex');
      } else {
        link.style.pointerEvents = 'none';
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('tabindex', '-1');
      }
    });
  };

  // Mode mobile ou slider 1 colonne: toutes les slides restent cliquables
  if (!restrictClick) {
    slides.forEach((slide) => {
      slide.classList.remove('is-center');
      const card = (slide.querySelector('.collection-slider_card') as HTMLElement) || slide;
      card.style.transform = '';
      card.style.transformOrigin = '';
    });
    const centerSmall =
      (root.querySelector('.swiper-slide-active') as HTMLElement | null) || slides[0];
    if (centerSmall) centerSmall.classList.add('is-center');
    updateAnchorClickability();
    return;
  }
  // Centre d'ancrage = centre du slide visible du milieu (plus robuste que le centre du conteneur)
  const visibles = Array.from(
    root.querySelectorAll<HTMLElement>('.swiper-slide.swiper-slide-visible')
  );
  const anchor = visibles[Math.floor(visibles.length / 2)] || slides[0];
  const anchorRect = anchor.getBoundingClientRect();
  const anchorCenter = anchorRect.left + anchorRect.width / 2;
  // Marque la slide centrale
  slides.forEach((s) => s.classList.remove('is-center'));
  anchor.classList.add('is-center');

  // largeur moyenne (approx) pour normaliser la distance en nombre de slides)
  const avgWidth =
    slides.map((s) => s.offsetWidth).reduce((a, b) => a + b, 0) / (slides.length || 1) || 1;

  slides.forEach((slide) => {
    const card = (slide.querySelector('.collection-slider_card') as HTMLElement) || slide;
    const rect = slide.getBoundingClientRect();
    const slideCenter = rect.left + rect.width / 2;
    const dSlides = Math.abs(anchorCenter - slideCenter) / avgWidth; // 0 au centre, ~1 pour voisin, ~2 pour suivant
    const scale = Math.max(0.4, 1 - 0.3 * dSlides);
    card.style.transformOrigin = 'center center';
    card.style.transform = `scale(${scale})`;
  });

  // Appliquer la cliquabilité uniquement sur la slide centrale (>=768px)
  updateAnchorClickability();
}
