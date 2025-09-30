import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
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
