import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

let refreshTimeoutId: number | null = null;
let listenersAttached = false;

const scheduleTimelineRefresh = () => {
  if (refreshTimeoutId !== null) window.clearTimeout(refreshTimeoutId);
  refreshTimeoutId = window.setTimeout(() => {
    refreshTimeoutId = null;
    ScrollTrigger.refresh();
  }, 120);
};

export function setupTimeline(
  containerSelector = '.step_content',
  wrapperSelector = '.step_timeline-wrapper',
  fullLineSelector = '.step_timeline.is-full-height',
  logoSelector = '.step_timeline-logo-wrapper',
  slidesWrapSelector = '.step_slides-wrap',
  minWidthDesktop = 992
): void {
  const containers = Array.from(document.querySelectorAll<HTMLElement>(containerSelector));
  if (containers.length === 0) return;

  const isMobile = window.innerWidth < minWidthDesktop;

  // Éviter les rafraîchissements multiples pendant le scroll mobile (UI qui se replie)
  if (!listenersAttached) {
    listenersAttached = true;
    window.addEventListener('orientationchange', scheduleTimelineRefresh, { passive: true });
    window.addEventListener('resize', scheduleTimelineRefresh);
    (window as Window & { visualViewport?: VisualViewport }).visualViewport?.addEventListener?.(
      'resize',
      scheduleTimelineRefresh
    );
  }

  containers.forEach((container) => {
    const wrapper = container.querySelector<HTMLElement>(wrapperSelector);
    const full = wrapper?.querySelector<HTMLElement>(fullLineSelector);
    const logo = wrapper?.querySelector<HTMLElement>(logoSelector);
    const slides = container.querySelector<HTMLElement>(slidesWrapSelector) || container;
    if (!wrapper || !full || !logo) return;

    let baseTop = 0;
    let wrapH = 0;
    let logoH = 0;
    let maxAbove = 0;

    const measure = () => {
      wrapH = wrapper.clientHeight;
      logoH = logo.clientHeight || 0;
      baseTop = logo.offsetTop || 0;
      maxAbove = Math.max(0, wrapH - logoH);
    };

    measure();
    // Optimisations pour la fluidité
    logo.style.willChange = 'transform';
    logo.style.backfaceVisibility = 'hidden';
    logo.style.transformStyle = 'preserve-3d';

    // Sur mobile : utiliser un système custom optimisé avec requestAnimationFrame
    // Sur desktop : utiliser ScrollTrigger
    if (isMobile) {
      let ticking = false;
      let inView = false;

      const update = () => {
        ticking = false;
        if (!inView) return;

        const slidesRect = slides.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportTop = window.scrollY;
        const slidesTop = viewportTop + slidesRect.top;
        const slidesHeight = slidesRect.height;

        // Zone d'animation : de 85% du viewport au-dessus du top jusqu'à 15% du viewport au-dessus du bottom
        const startOffset = viewportHeight * 0.85;
        const endOffset = viewportHeight * 0.15;
        const scrollStart = slidesTop - startOffset;
        const scrollEnd = slidesTop + slidesHeight - endOffset;
        const scrollRange = scrollEnd - scrollStart;

        const currentScroll = viewportTop + viewportHeight * 0.5; // Centre du viewport
        const progress = Math.max(0, Math.min(1, (currentScroll - scrollStart) / scrollRange));

        const current = maxAbove * progress;
        const above = Math.max(0, Math.min(wrapH, current));
        full.style.setProperty('--above', `${above}px`);

        const y = Math.max(0, above - baseTop);
        // Utiliser directement transform pour éviter la surcharge de GSAP sur mobile
        logo.style.transform = `translate3d(0, ${y}px, 0)`;
      };

      const schedule = () => {
        if (!inView) return;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      };

      // IntersectionObserver pour détecter quand la section est visible
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            if (inView) {
              measure(); // Remesurer quand on entre dans le viewport
              schedule();
            }
          },
          { root: null, threshold: 0, rootMargin: '0px' }
        );
        io.observe(slides);
      } else {
        inView = true;
      }

      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', () => {
        measure();
        schedule();
      });
      update();
    } else {
      // Desktop : utiliser ScrollTrigger
      ScrollTrigger.create({
        trigger: slides,
        start: 'top 85%',
        end: 'bottom 15%',
        scrub: true,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        onRefresh: measure,
        onUpdate: (self) => {
          const current = maxAbove * self.progress;

          // 1) split des couleurs: au‑dessus du logo
          const above = Math.max(0, Math.min(wrapH, current));
          full.style.setProperty('--above', `${above}px`);

          // 2) logo qui "suit" sans perdre sa baseline
          const y = Math.max(0, above - baseTop);
          gsap.set(logo, { y: y, force3D: true });
        },
      });
    }
  });
}
