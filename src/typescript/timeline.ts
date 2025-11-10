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
  slidesWrapSelector = '.step_slides-wrap'
): void {
  const containers = Array.from(document.querySelectorAll<HTMLElement>(containerSelector));
  if (containers.length === 0) return;

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
    logo.style.willChange = 'transform';

    ScrollTrigger.create({
      trigger: slides,
      start: 'top 85%', // un peu plus tard sur mobile
      end: 'bottom 15%',
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onRefresh: measure,
      onUpdate: (self) => {
        const current = maxAbove * self.progress; // progression lissée par scrub

        // 1) split des couleurs: au‑dessus du logo
        const above = Math.max(0, Math.min(wrapH, current));
        full.style.setProperty('--above', `${above}px`);

        // 2) logo qui “suit” sans perdre sa baseline
        const y = Math.max(0, above - baseTop);
        logo.style.transform = `translateY(${y}px)`;
      },
    });
  });
}
