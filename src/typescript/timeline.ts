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

    const baseTop = logo.offsetTop || 0; // position initiale du logo

    ScrollTrigger.create({
      trigger: slides,
      start: 'top 80%', // démarre plus tard
      end: 'bottom 20%',
      scrub: true,
      invalidateOnRefresh: true,
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
  });
}
