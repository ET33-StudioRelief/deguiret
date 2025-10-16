export function setupStoryNav(): void {
  const dots = [...document.querySelectorAll<HTMLElement>('.story_sticky-nav_dot[data-story]')];
  const sections = [...document.querySelectorAll<HTMLElement>('.section_story[data-story]')];
  const allStorySections = [...document.querySelectorAll<HTMLElement>('.section_story')];
  const progressLineWrap = document.querySelector<HTMLElement>('.our-story_progress-line-wrap');
  const progressContainer = document.querySelector<HTMLElement>('.our-story_progress-date');

  if (dots.length === 0 || sections.length === 0) return;

  const progressPast =
    progressLineWrap?.querySelector<HTMLElement>('.our-story_progress-line:not(.is-futur)') || null;
  const progressFuture =
    progressLineWrap?.querySelector<HTMLElement>('.our-story_progress-line.is-futur') || null;
  const progressTxt =
    progressLineWrap?.querySelector<HTMLElement>('#our-story_progress-txt') || null;

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

    // Largeur des barres passé/futur et variable CSS de progression
    if (progressLineWrap) {
      progressLineWrap.style.setProperty('--progress', `${progressPercent}%`);
      if (progressPast) {
        progressPast.style.width = `${progressPercent}%`;
        progressPast.style.left = '0%';
      }
      if (progressFuture) {
        progressFuture.style.left = `${progressPercent}%`;
        progressFuture.style.width = `${Math.max(0, 100 - progressPercent)}%`;
      }
    }

    // Update progress label uniquement sur #our-story_progress-txt
    if (progressLineWrap && progressTxt) {
      progressTxt.textContent = activeDate;
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

  // Fade in/out des dessins sur chaque section générique
  if (allStorySections.length && 'IntersectionObserver' in window) {
    const ioSections = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sec = entry.target as HTMLElement;
          sec.classList.toggle('is-inview', entry.isIntersecting);
        }
      },
      // Déclenche plus tard dans le viewport (60% visible)
      { root: null, threshold: 0.6, rootMargin: '0px 0px -1% 0px' }
    );
    for (const sec of allStorySections) ioSections.observe(sec);
  }

  // 1) Masquer uniquement our-story_progress-date quand step15 entre dans le viewport
  const progressHideTarget = document.querySelector<HTMLElement>(
    '.section_story[data-story="step15"]'
  );
  if (progressContainer && progressHideTarget && 'IntersectionObserver' in window) {
    const ioProgress = new IntersectionObserver(
      ([entry]) => {
        progressContainer.classList.toggle('is-hidden', entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: '0px' }
    );
    ioProgress.observe(progressHideTarget);
  }

  // 2) Masquer uniquement story_sticky-nav quand la section CTA entre dans le viewport
  const stickyNav = document.querySelector<HTMLElement>('.story_sticky-nav');
  const stickyHideTarget = document.querySelector<HTMLElement>('.section_cta');
  if (stickyNav && stickyHideTarget && 'IntersectionObserver' in window) {
    const ioSticky = new IntersectionObserver(
      ([entry]) => {
        stickyNav.classList.toggle('is-hidden', entry.isIntersecting);
      },
      // Petit décalage pour que la disparition arrive un peu après l'entrée
      { root: null, threshold: 0.15, rootMargin: '0px 0px -7% 0px' }
    );
    ioSticky.observe(stickyHideTarget);
  }
}
