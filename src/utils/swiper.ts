import Swiper from 'swiper';
import { Autoplay, Controller, Pagination } from 'swiper/modules';

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
    bgSwiper.controller.control = frontSwiper;
    frontSwiper.controller.control = bgSwiper;
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
      loop: false,
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
