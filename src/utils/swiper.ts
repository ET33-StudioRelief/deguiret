import Swiper from 'swiper';
import { Autoplay, Controller, EffectFade, Pagination, Thumbs } from 'swiper/modules';

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
      speed: 500,
      effect: 'slide',
      autoplay: {
        delay: 800,
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

    // Sync dans les deux sens
    // Le front pilote le background (synchro unidirectionnelle)
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

// Collection slider (fond + avant-plan synchronisés)
export function swiperCollection(): void {
  const wrappers = Array.from(document.querySelectorAll<HTMLElement>('.collection-slider_content'));
  if (wrappers.length === 0) return;

  wrappers.forEach((wrap) => {
    const bgEl = wrap.querySelector<HTMLElement>('.swiper.is-bg-collection');
    const frontEl = wrap.querySelector<HTMLElement>('.swiper.is-front-collection');
    if (!bgEl || !frontEl) return;
    if (wrap.dataset.collectionInited === 'true') return;

    const bgSwiper = new Swiper(bgEl, {
      modules: [Controller, EffectFade],
      slidesPerView: 1,
      loop: true,
      speed: 700,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      allowTouchMove: false,
    });

    let lastSyncedRealIndex = -1;

    const frontSwiper = new Swiper(frontEl, {
      modules: [Controller],
      loop: true,
      centeredSlides: true,
      slidesPerView: 5,
      spaceBetween: 120,
      speed: 700,
      watchSlidesProgress: true,
      loopAdditionalSlides: 4,
      on: {
        setTranslate(s: Swiper) {
          type SlideWithProgress = HTMLElement & {
            progress?: number;
            swiperSlideProgress?: number;
          };
          let nearestRealIndex = s.realIndex;
          let nearestDistance = Number.POSITIVE_INFINITY;

          s.slides.forEach((slideEl) => {
            const slide = slideEl as SlideWithProgress;
            const rawProgress = slide.progress ?? slide.swiperSlideProgress ?? 0;
            const p = Math.min(Math.abs(rawProgress), 2);
            const direction = rawProgress === 0 ? 0 : rawProgress > 0 ? 1 : -1;

            // Quantification par niveaux (0 = centre, 1 = adjacents, 2 = extrêmes)
            const rank = Math.min(2, Math.round(p));
            const scaleSteps = [1, 0.78, 0.58];
            const opacitySteps = [1, 0.6, 0.35];
            const rotSteps = [0, 14, 22]; // deg

            const scale = scaleSteps[rank];
            const opacity = opacitySteps[rank];
            // Courbe plus circulaire (cosinus), très prononcée aux extrémités
            const yMax = 120;
            const zMax = 400;
            const t = Math.max(-1, Math.min(1, rawProgress));
            const circular = 1 - Math.cos(Math.abs(t) * Math.PI * 0.5); // 0→1
            const translateY = -yMax * Math.pow(circular, 1.1);
            const translateZ = -zMax * Math.pow(circular, 1);
            const rotateY = rotSteps[rank] * direction;

            slide.style.transform = `translateZ(${translateZ}px) translateY(${translateY}px) rotateY(${rotateY}deg) scale(${scale})`;
            slide.style.opacity = `${opacity}`;
            slide.style.zIndex = String(1000 - Math.round(p * 100));

            const dist = Math.abs(rawProgress);
            if (dist < nearestDistance) {
              nearestDistance = dist;
              const attr = (slide as HTMLElement).getAttribute('data-swiper-slide-index');
              nearestRealIndex = attr ? Number(attr) : s.realIndex;
            }
          });

          if (nearestRealIndex !== lastSyncedRealIndex) {
            bgSwiper.slideToLoop(nearestRealIndex, 0, false);
            lastSyncedRealIndex = nearestRealIndex;
          }
        },
      },
    });

    // Front -> BG (unidirectionnel) pour que le BG colle à la slide centrée
    frontSwiper.controller.control = bgSwiper;
    frontSwiper.on('slideChange', () => {
      bgSwiper.slideToLoop(frontSwiper.realIndex, 0, false);
      lastSyncedRealIndex = frontSwiper.realIndex;
    });

    wrap.dataset.collectionInited = 'true';
  });
}
