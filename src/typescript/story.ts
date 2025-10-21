export function setupStoryTestNav(): void {
  const dots = [...document.querySelectorAll<HTMLElement>('.story_sticky-nav_dot[data-story]')];
  // Dans ton HTML, les étapes sont des .story_step (et non plusieurs .section_story)
  const sections = [...document.querySelectorAll<HTMLElement>('.story_step[data-story]')];
  const allStorySections = [...document.querySelectorAll<HTMLElement>('.story_step')];
  const progressLineWrap = document.querySelector<HTMLElement>('.our-story_progress-line-wrap');
  const progressContainer = document.querySelector<HTMLElement>('.our-story_progress-date');
  const bgImgEl = document.querySelector<HTMLElement>('.story_bg-img');

  if (dots.length === 0 || sections.length === 0) return;

  const progressPast =
    progressLineWrap?.querySelector<HTMLElement>('.our-story_progress-line:not(.is-futur)') || null;
  const progressFuture =
    progressLineWrap?.querySelector<HTMLElement>('.our-story_progress-line.is-futur') || null;
  const progressTxt =
    progressLineWrap?.querySelector<HTMLElement>('#our-story_progress-txt') || null;

  const getMeta = (step: HTMLElement) => {
    const id =
      step.getAttribute('data-story') ||
      step.querySelector<HTMLElement>('[data-step]')?.getAttribute('data-step') ||
      '';
    const date =
      step.getAttribute('data-date') ||
      step.querySelector<HTMLElement>('[data-date]')?.getAttribute('data-date') ||
      '';
    const bg =
      step.getAttribute('data-background') ||
      step.querySelector<HTMLElement>('[data-background]')?.getAttribute('data-background') ||
      '';
    return { id, date, bg };
  };

  // Crossfade pour le background de .story_bg-img
  let baseLayer: HTMLDivElement | null = null;
  let overlay: HTMLDivElement | null = null;
  let currentUrl: string | null = null;

  const ensureLayers = () => {
    if (!bgImgEl) return;
    const cs = getComputedStyle(bgImgEl);
    if (cs.position === 'static') bgImgEl.style.position = 'relative';
    if (cs.overflow !== 'hidden') bgImgEl.style.overflow = 'hidden';
    if (!baseLayer) {
      baseLayer = document.createElement('div');
      baseLayer.style.position = 'absolute';
      baseLayer.style.inset = '0';
      baseLayer.style.backgroundSize = 'cover';
      baseLayer.style.backgroundPosition = 'center';
      baseLayer.style.opacity = '1';
      bgImgEl.appendChild(baseLayer);
    }
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.backgroundSize = 'cover';
      overlay.style.backgroundPosition = 'center';
      overlay.style.transition = 'opacity 300ms ease';
      overlay.style.opacity = '0';
      bgImgEl.appendChild(overlay);
    }
  };

  const initBackground = (url: string | null) => {
    if (!bgImgEl) return;
    ensureLayers();
    currentUrl = url || null;
    if (baseLayer) baseLayer.style.backgroundImage = url ? `url("${url}")` : '';
  };

  const setBackground = (url: string | null) => {
    if (!bgImgEl) return;
    ensureLayers();
    const targetImg = url ? `url("${url}")` : '';
    if (currentUrl === targetImg) return;
    if (!overlay || !baseLayer) return;
    overlay.style.backgroundImage = targetImg;
    overlay.style.opacity = '1';
    const onEnd = () => {
      overlay?.removeEventListener('transitionend', onEnd);
      baseLayer!.style.backgroundImage = targetImg;
      if (overlay) overlay.style.opacity = '0';
      currentUrl = targetImg;
    };
    overlay.addEventListener('transitionend', onEnd);
  };

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

    const meta = closestSection ? getMeta(closestSection) : { id: '', date: '', bg: '' };
    const activeStory = meta.id;
    const activeDate = meta.date;

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

    // Met à jour le background de .story_bg-img en fonction du step visible
    if (bgImgEl) {
      // Première initialisation si nécessaire
      if (currentUrl === null) initBackground(meta.bg || '');
      if (meta.bg) setBackground(meta.bg);
    }

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const dotStory = dot.dataset.story || '';
      const isActive = dotStory === activeStory;

      // Trouver l'index de la section correspondante
      const sectionIndex = sections.findIndex((s) => getMeta(s).id === dotStory);
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
    '.story_step[data-story="step15"]'
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
