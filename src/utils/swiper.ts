import Swiper from 'swiper';
import { Autoplay, Controller, Pagination, Thumbs } from 'swiper/modules';

export function swiperStep() {
  // Guard: init only when the target slider exists on the page
  const elements = Array.from(document.querySelectorAll<HTMLElement>('.swiper.is-step'));
  if (elements.length === 0) {
    return;
  }
  // Create one Swiper instance per matching element, avoid double init
  elements.forEach((el) => {
    if (el.dataset.swiperInitialized === 'true') return;
    // Find pagination inside, otherwise as sibling under same parent
    const inner = el.querySelector('.swiper-pagination.is-step') as HTMLElement | null;
    const sibling =
      !inner && el.parentElement
        ? (el.parentElement.querySelector('.swiper-pagination.is-step') as HTMLElement | null)
        : null;
    const paginationEl = inner || sibling;

    new Swiper(el, {
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
    el.dataset.swiperInitialized = 'true';
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

// Product slider with thumbnail pagination (two synced sliders)
export function swiperProduct(): void {
  const containers = Array.from(document.querySelectorAll<HTMLElement>('.product-slider_content'));
  if (containers.length === 0) return;

  containers.forEach((container) => {
    const main = container.querySelector<HTMLElement>('.swiper.is-product');
    const thumbs = container.querySelector<HTMLElement>('.swiper.is-product-thumbs');
    if (!main || !thumbs) return;
    if (main.dataset.swiperInitialized === 'true') return;

    // Init thumbs first
    const thumbsSwiper = new Swiper(thumbs, {
      direction: 'horizontal',
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
    });

    // Init main slider with thumbs module
    new Swiper(main, {
      modules: [Thumbs],
      direction: 'horizontal',
      slidesPerView: 1,
      speed: 500,
      effect: 'slide',
      loop: true,
      allowTouchMove: true,
      thumbs: {
        swiper: thumbsSwiper,
      },
    });

    main.dataset.swiperInitialized = 'true';
  });
}

// Collection slider: 5 slides in viewport, 80px spacing, loop
export function swiperCollection(): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('.swiper.is-collection'));
  if (elements.length === 0) return;

  elements.forEach((el) => {
    if (el.dataset.swiperInitialized === 'true') return;
    new Swiper(el, {
      slidesPerView: 5,
      spaceBetween: 80,
      loop: true,
      speed: 600,
      allowTouchMove: true,
      watchOverflow: true,
      watchSlidesProgress: true,
      // Responsive defaults (optional)
      breakpoints: {
        0: { slidesPerView: 1.2, spaceBetween: 16 },
        480: { slidesPerView: 2, spaceBetween: 24 },
        768: { spaceBetween: 40 },
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
  });
}

function updateCollectionScale(root: HTMLElement): void {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('.swiper-slide'));
  if (slides.length === 0) return;
  const isWide = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

  // En-dessous de 768px: on neutralise totalement les styles inline + classes
  if (!isWide) {
    slides.forEach((slide) => {
      slide.classList.remove('is-center');
      const card = (slide.querySelector('.collection-slider_card') as HTMLElement) || slide;
      card.style.transform = '';
      card.style.transformOrigin = '';
    });
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
}
