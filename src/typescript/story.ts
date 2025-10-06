export function setupStoryNav(): void {
  const dots = [...document.querySelectorAll<HTMLElement>('.story_sticky-nav_dot[data-story]')];
  const sections = [...document.querySelectorAll<HTMLElement>('.section_story[data-story]')];
  if (dots.length === 0 || sections.length === 0) return;

  const updateActive = () => {
    const viewportCenter = window.innerHeight / 2;
    let closestSection: HTMLElement | null = null;
    let minDistance = Infinity;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestSection = section;
      }
    }

    const activeStory = closestSection?.dataset.story || '';

    for (const dot of dots) {
      const dotStory = dot.dataset.story || '';
      const isActive = dotStory === activeStory;
      dot.classList.toggle('is-active', isActive);
      const activeEl = dot.querySelector<HTMLElement>('.story_sticky-nav_active');
      if (activeEl) {
        activeEl.style.opacity = isActive ? '1' : '0';
      }
    }
  };

  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();
}
