export function setupStoryNav(): void {
  const dots = [...document.querySelectorAll<HTMLElement>('.story_sticky-nav_dot[data-story]')];
  const sections = [...document.querySelectorAll<HTMLElement>('.section_story[data-story]')];
  const progressLineWrap = document.querySelector<HTMLElement>('.our-story_progress-line-wrap');

  if (dots.length === 0 || sections.length === 0) return;

  // Créer l'élément texte s'il n'existe pas
  let progressText = progressLineWrap?.querySelector<HTMLElement>('.our-story_progress-date-text');
  if (progressLineWrap && !progressText) {
    progressText = document.createElement('div');
    progressText.className = 'our-story_progress-date-text';
    progressLineWrap.appendChild(progressText);
  }

  const updateActive = () => {
    const viewportCenter = window.innerHeight / 2;
    let closestSection: HTMLElement | null = null;
    let minDistance = Infinity;
    let closestIndex = -1;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestSection = section;
        closestIndex = i;
      }
    }

    const activeStory = closestSection?.dataset.story || '';
    const activeDate = closestSection?.dataset.date || '';

    // Calculate progress percentage (0% to 100%)
    const totalSteps = sections.length;
    const progressPercent = totalSteps > 1 ? (closestIndex / (totalSteps - 1)) * 100 : 0;

    // Inject CSS variable for split line (::before/::after)
    if (progressLineWrap) {
      progressLineWrap.style.setProperty('--progress', `${progressPercent}%`);
    }

    // Update progress text and position
    if (progressText && progressLineWrap) {
      progressText.textContent = activeDate;
      // Calculate translateX based on progress (text follows line)
      const wrapWidth = progressLineWrap.clientWidth;
      const padding = 32; // 2rem = 32px padding
      const maxTranslate = wrapWidth - padding * 2;
      const translateX = (progressPercent / 100) * maxTranslate;
      progressText.style.transform = `translateX(${translateX}px)`;

      // Mesure la largeur du texte pour couper correctement la ligne des deux côtés
      const textRect = progressText.getBoundingClientRect();
      const textHalf = textRect.width / 2;
      progressLineWrap.style.setProperty('--textW', textHalf + 'px');
    }

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const dotStory = dot.dataset.story || '';
      const isActive = dotStory === activeStory;

      // Trouver l'index de la section correspondante
      const sectionIndex = sections.findIndex((s) => s.dataset.story === dotStory);
      const isPassed = sectionIndex >= 0 && sectionIndex < closestIndex;

      dot.classList.toggle('is-active', isActive);
      dot.classList.toggle('is-passed', isPassed && !isActive);

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
