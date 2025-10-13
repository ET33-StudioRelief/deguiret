import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function setupTimeline(
  containerSelector = '.step_content',
  wrapperSelector = '.step_timeline-wrapper',
  fullLineSelector = '.step_timeline.is-full-height',
  logoSelector = '.step_timeline-logo-wrapper',
  slidesWrapSelector = '.step_slides-wrap'
): void {
  const containers = Array.from(document.querySelectorAll<HTMLElement>(containerSelector));
  if (containers.length === 0) return;

  containers.forEach((container) => {
    const wrapper = container.querySelector<HTMLElement>(wrapperSelector);
    const full = wrapper?.querySelector<HTMLElement>(fullLineSelector);
    const logo = wrapper?.querySelector<HTMLElement>(logoSelector);
    const slides = container.querySelector<HTMLElement>(slidesWrapSelector) || container;
    if (!wrapper || !full || !logo) return;

    let baseTop = logo.offsetTop || 0; // position initiale du logo

    const refreshBase = () => {
      // recalculer les métriques sensibles au viewport (mobile barre d'adresse)
      baseTop = logo.offsetTop || 0;
    };

    ScrollTrigger.create({
      trigger: slides,
      start: 'top 85%', // un peu plus tard sur mobile
      end: 'bottom 15%',
      scrub: true,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onRefreshInit: refreshBase,
      onRefresh: refreshBase,
      onUpdate: (self) => {
        const wrapH = wrapper.clientHeight;
        const logoH = logo.clientHeight || 0;
        const maxAbove = Math.max(0, wrapH - logoH); // max “au‑dessus du logo”
        const current = maxAbove * self.progress; // progression lissée par scrub

        // 1) split des couleurs: au‑dessus du logo
        const above = Math.max(0, Math.min(wrapH, current));
        full.style.setProperty('--above', `${above}px`);

        // 2) logo qui “suit” sans perdre sa baseline
        const y = Math.max(0, above - baseTop);
        logo.style.transform = `translateY(${y}px)`;
        logo.style.willChange = 'transform';
      },
    });

    // iOS/Android: changer d'orientation / barre d'adresse → refresh
    window.addEventListener('orientationchange', () => ScrollTrigger.refresh(), { passive: true });
    window.addEventListener('resize', () => ScrollTrigger.refresh());
    (window as Window & { visualViewport?: VisualViewport }).visualViewport?.addEventListener?.(
      'resize',
      () => ScrollTrigger.refresh()
    );
  });
}
