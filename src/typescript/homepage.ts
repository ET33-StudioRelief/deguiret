// Mark only the first wide row (3n) to reveal the title block
export function galleryTextBlock(
  wrapSelector = '.watches_gallery',
  itemWrapSelector = '.watches_gallery_item-wrap'
): void {
  const root = document.querySelector<HTMLElement>(wrapSelector);
  if (!root) return;
  const wraps = Array.from(root.querySelectorAll<HTMLElement>(itemWrapSelector));
  if (wraps.length === 0) return;
  // Clear previous marks
  wraps.forEach((w) => w.classList.remove('is-feature-line'));
  // First wide row is the first .nth-child(3n) → index 2, if exists
  if (wraps.length >= 3) {
    wraps[2].classList.add('is-feature-line');
  }
}

// Toggle between Gallery and Grid views, update label and heights
// ANCIENNE VERSION - COMMENTÉE POUR TEST
// export function setupWatchesViewToggle(
//   galleryBtn = '#show-gallery-watches',
//   gridBtn = '#show-grid-watches',
//   labelSelector = '#view-type-data-text',
//   galleryWrapper = '.watches_gallery_wrapper',
//   gridWrapper = '.watches_grid_wrapper'
// ): void {
//   const galleryEl = document.querySelector<HTMLElement>(galleryBtn);
//   const gridEl = document.querySelector<HTMLElement>(gridBtn);
//   const label = document.querySelector<HTMLElement>(labelSelector);
//   const galleryWrap = document.querySelector<HTMLElement>(galleryWrapper);
//   const gridWrap = document.querySelector<HTMLElement>(gridWrapper);
//   if (!galleryEl || !gridEl || !label || !galleryWrap || !gridWrap) return;

//   const setHeights = (showGallery: boolean) => {
//     const animate = (el: HTMLElement, expand: boolean, done?: () => void) => {
//       const currentHeight = el.offsetHeight; // current rendered height
//       const targetHeight = expand ? el.scrollHeight : 0;
//       // Prepare
//       el.style.overflow = 'hidden';
//       el.style.transition = 'height 360ms ease, opacity 240ms ease';
//       // Set starting height
//       el.style.height = currentHeight + 'px';
//       el.style.opacity = expand ? '0' : '1';
//       // In next frame, go to target
//       requestAnimationFrame(() => {
//         el.style.height = targetHeight + 'px';
//         el.style.opacity = expand ? '1' : '0';
//       });
//       // Cleanup
//       const onEnd = () => {
//         el.removeEventListener('transitionend', onEnd);
//         if (expand) {
//           el.style.height = 'auto';
//           el.style.overflow = '';
//         } else {
//           el.style.height = '0px';
//           el.style.overflow = 'hidden';
//         }
//         if (done) done();
//       };
//       el.addEventListener('transitionend', onEnd);
//     };

//     if (showGallery) {
//       // Séquence: fermer Grid puis ouvrir Gallery pour éviter les à-coups de reflow
//       animate(gridWrap, false, () => {
//         // Assure une frame entre les deux pour laisser le layout se stabiliser
//         requestAnimationFrame(() =>
//           animate(galleryWrap, true, () => {
//             // Notifie que la vue a changé (utilisé pour relancer les entrances)
//             window.dispatchEvent(new CustomEvent('watches:view-changed'));
//           })
//         );
//       });
//     } else {
//       // Ouverture Grid peut rester simultanée, elle est déjà smooth
//       animate(galleryWrap, false);
//       animate(gridWrap, true, () => {
//         // Notifie que la vue a changé (utilisé pour relancer les entrances)
//         window.dispatchEvent(new CustomEvent('watches:view-changed'));
//       });
//     }
//   };

//   const applyLabel = (fromEl: HTMLElement) => {
//     const txt = fromEl.getAttribute('data-text') || '';
//     if (txt) label.textContent = txt.toUpperCase();
//   };

//   /**
//    * Scroll to watches_content when view changes
//    */
//   // COMMENTÉ POUR TEST
//   // const scrollToWatchesContent = () => {
//   //   const target = document.querySelector<HTMLElement>('.watches_content');
//   //   if (!target) return;

//   //   const rect = target.getBoundingClientRect();
//   //   const navbar = document.querySelector<HTMLElement>('.navbar_component');
//   //   const navbarHeight = navbar ? navbar.offsetHeight : 0;
//   //   const targetPosition = window.scrollY + rect.top - navbarHeight - 20; // 20px de marge

//   //   window.scrollTo({
//   //     top: Math.max(0, targetPosition),
//   //     behavior: 'smooth',
//   //   });
//   // };

//   galleryEl.addEventListener('click', (e) => {
//     e.preventDefault();
//     // Scroll to watches_content before view change
//     // scrollToWatchesContent(); // COMMENTÉ POUR TEST
//     applyLabel(galleryEl);
//     // Délai pour laisser le scroll commencer avant le changement de hauteur
//     setTimeout(() => {
//       setHeights(true);
//     }, 150);
//     // Retire sur le bouton cliqué, ajoute sur l'autre
//     galleryEl.classList.remove('is-border-tertiary');
//     gridEl.classList.add('is-border-tertiary');
//   });

//   gridEl.addEventListener('click', (e) => {
//     e.preventDefault();
//     // Scroll to watches_content before view change
//     // scrollToWatchesContent(); // COMMENTÉ POUR TEST
//     applyLabel(gridEl);
//     // Délai pour laisser le scroll commencer avant le changement de hauteur
//     setTimeout(() => {
//       setHeights(false);
//     }, 150);
//     // Retire sur le bouton cliqué, ajoute sur l'autre
//     gridEl.classList.remove('is-border-tertiary');
//     galleryEl.classList.add('is-border-tertiary');
//   });

//   // Toggle en cliquant sur le label: bascule vers l'autre vue que celle actuellement affichée
//   label.addEventListener('click', (e) => {
//     e.preventDefault();
//     // Scroll to watches_content before view change
//     // scrollToWatchesContent(); // COMMENTÉ POUR TEST
//     // Détermine la vue active via les classes des boutons:
//     // le bouton actif est celui qui n'a PAS la classe 'is-border-tertiary'
//     const isGalleryActive = !galleryEl.classList.contains('is-border-tertiary');
//     // Délai pour laisser le scroll commencer avant le changement de hauteur
//     setTimeout(() => {
//       if (isGalleryActive) {
//         // Aller vers Grid
//         applyLabel(gridEl);
//         setHeights(false);
//         gridEl.classList.remove('is-border-tertiary');
//         galleryEl.classList.add('is-border-tertiary');
//       } else {
//         // Aller vers Gallery
//         applyLabel(galleryEl);
//         setHeights(true);
//         galleryEl.classList.remove('is-border-tertiary');
//         gridEl.classList.add('is-border-tertiary');
//       }
//     }, 150);
//   });
// }

// NOUVELLE VERSION - SIMPLIFIÉE ET MOINS ÉNERGIVORE
export function setupWatchesViewToggle(): void {
  const galleryBtn = document.querySelector<HTMLElement>('#show-gallery-watches');
  const gridBtn = document.querySelector<HTMLElement>('#show-grid-watches');
  const label = document.querySelector<HTMLElement>('#view-type-data-text');
  const galleryWrap = document.querySelector<HTMLElement>('.watches_gallery_wrapper');
  const gridWrap = document.querySelector<HTMLElement>('.watches_grid_wrapper');

  if (!galleryBtn || !gridBtn || !galleryWrap || !gridWrap) return;

  // Fonction pour mettre à jour le texte du label
  const applyLabel = (fromEl: HTMLElement) => {
    if (!label) return;
    const txt = fromEl.getAttribute('data-text') || '';
    if (txt) label.textContent = txt.toUpperCase();
  };

  // Fonction pour scroller vers watches_content
  // COMMENTÉ POUR TEST
  // const scrollToWatchesContent = () => {
  //   const target = document.querySelector<HTMLElement>('.watches_content');
  //   if (!target) return;

  //   const rect = target.getBoundingClientRect();
  //   const navbar = document.querySelector<HTMLElement>('.navbar_component');
  //   const navbarHeight = navbar ? navbar.offsetHeight : 0;
  //   const targetPosition = window.scrollY + rect.top - navbarHeight - 20; // 20px de marge

  //   window.scrollTo({
  //     top: Math.max(0, targetPosition),
  //     behavior: 'smooth',
  //   });
  // };

  // Click sur Gallery : afficher gallery, masquer grid
  galleryBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Scroll to watches_content before view change
    // scrollToWatchesContent(); // COMMENTÉ POUR TEST
    // Disparition immédiate de grid
    gridWrap.classList.remove('is-fading-in');
    gridWrap.classList.add('is-fading-out');
    gridWrap.style.opacity = '0';
    gridWrap.style.zIndex = '-1';
    // Apparition avec délai de gallery
    galleryWrap.classList.remove('is-fading-out');
    galleryWrap.classList.add('is-fading-in');
    galleryWrap.style.opacity = '1';
    galleryWrap.style.zIndex = '1';
    applyLabel(galleryBtn);
    // Retire sur le bouton cliqué, ajoute sur l'autre
    galleryBtn.classList.remove('is-border-tertiary');
    gridBtn.classList.add('is-border-tertiary');
  });

  // Click sur Grid : afficher grid, masquer gallery
  gridBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Scroll to watches_content before view change
    // scrollToWatchesContent(); // COMMENTÉ POUR TEST
    // Disparition immédiate de gallery
    galleryWrap.classList.remove('is-fading-in');
    galleryWrap.classList.add('is-fading-out');
    galleryWrap.style.opacity = '0';
    galleryWrap.style.zIndex = '-1';
    // Apparition avec délai de grid
    gridWrap.classList.remove('is-fading-out');
    gridWrap.classList.add('is-fading-in');
    gridWrap.style.opacity = '1';
    gridWrap.style.zIndex = '1';
    applyLabel(gridBtn);
    // Retire sur le bouton cliqué, ajoute sur l'autre
    gridBtn.classList.remove('is-border-tertiary');
    galleryBtn.classList.add('is-border-tertiary');
  });
}

// Observe rows (gallery + grid) to fade-in on enter viewport
export function setupWatchesRowsInView(
  rowsSelector = '.watches_gallery_item-wrap, .watches_grid_card',
  rootMargin = '0px 0px -10% 0px'
): void {
  const rows = Array.from(document.querySelectorAll<HTMLElement>(rowsSelector));
  if (rows.length === 0) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.classList.add('is-inview');
          io.unobserve(el); //first appearance only (until next view change)
        }
      });
    },
    { root: null, rootMargin, threshold: 0.05 }
  );
  rows.forEach((el) => io.observe(el));

  // Restart entrances only when view changes (gallery/grid)
  const onViewChanged = () => {
    // Let the layout stabilize after height transitions
    setTimeout(() => {
      rows.forEach((el) => {
        el.classList.remove('is-inview');
        io.unobserve(el);
        io.observe(el);
      });
    }, 50);
  };
  window.addEventListener('watches:view-changed', onViewChanged);
}

// Floating effect for watches gallery items
export function setupWatchesFloat(selector = '.watches_gallery_item-wrap', amp = -50): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (els.length === 0) return;

  // Floating calculation based on position in the window
  const updateAll = () => {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;
    els.forEach((el) => {
      // Reset when element is hidden by Finsweet ([hidden])
      if (el.hasAttribute('hidden') || el.offsetParent === null) {
        el.style.transform = '';
        return;
      }
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const translate = ((viewportCenter - center) / viewportHeight) * amp;
      el.style.transform = `translateY(${translate}px)`;
    });
  };

  const scheduleUpdate = () => requestAnimationFrame(updateAll);

  // Scroll/resize → recalcul
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);

  // Observe attributes changes (hidden/style) and structure
  const observer = new MutationObserver(() => scheduleUpdate());
  els.forEach((el) => {
    observer.observe(el, { attributes: true, attributeFilter: ['hidden', 'style'] });
  });

  // Observe the parent container for additions/deletions/reordering
  const parent = els[0].parentElement;
  if (parent) {
    const treeObserver = new MutationObserver(() => scheduleUpdate());
    treeObserver.observe(parent, { childList: true, subtree: false });
  }

  // Recalcul when internal page events occur
  window.addEventListener('watches:view-changed', scheduleUpdate);

  // Hook Finsweet (if present): recalcul after application/update of filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes = (window as any).fsAttributes || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes.push(['cmsfilter', () => scheduleUpdate()]);

  // Initial
  updateAll();
}

// Sort order toggle for watches collection (oldest/newest)
/**
 * Setup sort toggle for watches gallery and grid
 * Allows toggling between oldest (A-Z) and newest (Z-A) order
 * @param oldestBtn - Selector for the "oldest" button
 * @param newestBtn - Selector for the "newest" button
 * @param labelSelector - Selector for the label that displays current sort order
 * @param gallerySelector - Selector for the gallery container
 * @param gridSelector - Selector for the grid container
 */
export function setupWatchesSortToggle(
  oldestBtn = '#show-oldest-watches',
  newestBtn = '#show-newest-watches',
  labelSelector = '#order-filter-tag',
  gallerySelector = '.watches_gallery',
  gridSelector = '.watches_grid'
): void {
  const oldestEl = document.querySelector<HTMLElement>(oldestBtn);
  const newestEl = document.querySelector<HTMLElement>(newestBtn);
  const label = document.querySelector<HTMLElement>(labelSelector);
  const gallery = document.querySelector<HTMLElement>(gallerySelector);
  const grid = document.querySelector<HTMLElement>(gridSelector);

  if (!oldestEl || !newestEl) return;

  /**
   * Assigns original index to each child element based on its initial position
   * Stores the index in data-originalIndex to allow restoration of initial order
   */
  const assignOriginalIndex = (container: HTMLElement | null) => {
    if (!container) return;
    Array.from(container.children).forEach((child, index) => {
      const el = child as HTMLElement;
      if (!el.dataset.originalIndex) {
        el.dataset.originalIndex = String(index);
      }
    });
  };

  /**
   * Checks if an element is hidden (via hidden attribute, display:none, or aria-hidden)
   */
  const isHiddenItem = (el: HTMLElement) => {
    if (el.hasAttribute('hidden')) return true;
    const style = el.getAttribute('style') || '';
    if (style.includes('display:none') || style.includes('display: none')) return true;
    if (el.getAttribute('aria-hidden') === 'true') return true;
    return false;
  };

  /**
   * Reorders container children based on their original index
   * @param container - Container element to reorder
   * @param ascending - true for ascending order (A-Z), false for descending (Z-A)
   * @param forceAssign - Force reassignment of original indexes
   */
  const reorderByOriginalIndex = (
    container: HTMLElement | null,
    ascending: boolean,
    forceAssign = false
  ) => {
    if (!container) return;
    if (forceAssign) assignOriginalIndex(container);
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;
    const sortFn = (a: HTMLElement, b: HTMLElement) => {
      const aIdx = Number(a.dataset.originalIndex || 0);
      const bIdx = Number(b.dataset.originalIndex || 0);
      return ascending ? aIdx - bIdx : bIdx - aIdx;
    };
    // Separate visible and hidden items, sort each group, then append visible first
    const visible = children.filter((el) => !isHiddenItem(el)).sort(sortFn);
    const hidden = children.filter((el) => isHiddenItem(el)).sort(sortFn);
    [...visible, ...hidden].forEach((el) => container.appendChild(el));
  };

  // Initialize: store original indexes for both gallery and grid
  assignOriginalIndex(gallery);
  assignOriginalIndex(grid);

  /**
   * Restores initial order (oldest first, A-Z)
   */
  const restoreInitialOrder = (container: HTMLElement | null) => {
    reorderByOriginalIndex(container, true);
  };

  /**
   * Reverses order (newest first, Z-A)
   */
  const reverseOrder = (container: HTMLElement | null) => {
    reorderByOriginalIndex(container, false);
  };

  /**
   * Resets transforms applied by setupWatchesFloat to avoid layout shifts after reordering
   */
  const resetGalleryFloatTransforms = () => {
    const floats = Array.from(document.querySelectorAll<HTMLElement>('.watches_gallery_item-wrap'));
    floats.forEach((el) => {
      el.style.transform = '';
    });
  };

  /**
   * Updates the label text with the current sort order
   */
  const updateLabel = (fromEl: HTMLElement) => {
    if (!label) return;
    const txt = fromEl.getAttribute('data-text') || '';
    label.textContent = txt;
  };

  /**
   * Scroll to watches_content when sort order changes
   */
  const scrollToWatchesContent = () => {
    const target = document.querySelector<HTMLElement>('.watches_content');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const navbar = document.querySelector<HTMLElement>('.navbar_component');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const targetPosition = window.scrollY + rect.top - navbarHeight - 20; // 20px de marge

    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth',
    });
  };

  // Click on "oldest" button → restore initial order (A-Z)
  oldestEl.addEventListener('click', (e) => {
    e.preventDefault();
    restoreInitialOrder(gallery);
    restoreInitialOrder(grid);
    updateLabel(oldestEl);
    // Toggle border classes (inverse)
    oldestEl.classList.remove('is-border-tertiary');
    newestEl.classList.add('is-border-tertiary');
    // Avoid layout shifts from float transforms after reordering
    resetGalleryFloatTransforms();
    // Re-mark feature line after reorder
    galleryTextBlock();
    // Trigger view-changed to re-observe items for animation
    window.dispatchEvent(new CustomEvent('watches:view-changed'));
    // Scroll to watches_content
    setTimeout(scrollToWatchesContent, 100);
  });

  // Click on "newest" button → reverse initial order (Z-A)
  newestEl.addEventListener('click', (e) => {
    e.preventDefault();
    reverseOrder(gallery);
    reverseOrder(grid);
    updateLabel(newestEl);
    // Toggle border classes (inverse)
    newestEl.classList.remove('is-border-tertiary');
    oldestEl.classList.add('is-border-tertiary');
    // Avoid layout shifts from float transforms after reordering
    resetGalleryFloatTransforms();
    // Re-mark feature line after reorder
    galleryTextBlock();
    // Trigger view-changed to re-observe items for animation
    window.dispatchEvent(new CustomEvent('watches:view-changed'));
    // Scroll to watches_content
    setTimeout(scrollToWatchesContent, 100);
  });

  // Click on label → toggle to the other sort order
  if (label) {
    label.addEventListener('click', (e) => {
      e.preventDefault();
      // Active button is the one WITHOUT 'is-border-tertiary' class
      const isOldestActive = !oldestEl.classList.contains('is-border-tertiary');
      if (isOldestActive) {
        // Switch to NEWEST (Z-A)
        reverseOrder(gallery);
        reverseOrder(grid);
        updateLabel(newestEl);
        newestEl.classList.remove('is-border-tertiary');
        oldestEl.classList.add('is-border-tertiary');
      } else {
        // Switch back to OLDEST (A-Z)
        restoreInitialOrder(gallery);
        restoreInitialOrder(grid);
        updateLabel(oldestEl);
        oldestEl.classList.remove('is-border-tertiary');
        newestEl.classList.add('is-border-tertiary');
      }
      // Avoid layout shifts from float transforms after reordering
      resetGalleryFloatTransforms();
      // Update feature line and restart entrance animations
      galleryTextBlock();
      window.dispatchEvent(new CustomEvent('watches:view-changed'));
      // Scroll to watches_content
      setTimeout(scrollToWatchesContent, 100);
    });
  }
}

// Mobile behaviour for grid cards: first tap opens text, second tap follows link
export function setupWatchesGridMobile(
  cardSelector = '.watches_grid_card',
  textSelector = '.watches_grid_text-wrap',
  minWidthDesktop = 992
): void {
  const mql = window.matchMedia(`(min-width: ${minWidthDesktop}px)`);
  if (mql.matches) return; // desktop: hover CSS déjà géré

  const cards = Array.from(document.querySelectorAll<HTMLAnchorElement>(cardSelector));
  if (cards.length === 0) return;

  cards.forEach((card) => {
    card.addEventListener('click', (ev) => {
      const isOpen = card.classList.contains('is-open');
      if (!isOpen) {
        ev.preventDefault();
        // Ferme les autres cartes déjà ouvertes
        cards.forEach((other) => {
          if (other === card) return;
          other.classList.remove('is-open');
          const otherTxt = other.querySelector<HTMLElement>(textSelector);
          if (otherTxt) otherTxt.style.display = 'none';
        });
        card.classList.add('is-open');
        const txt = card.querySelector<HTMLElement>(textSelector);
        if (txt) txt.style.display = '';
      } // sinon: déjà ouverte → laisser le navigateur suivre le lien
    });
  });
}

// Block clicks on text wrap inside gallery item links (desktop only)
export function setupWatchesGalleryTextClickBlock(
  itemSelector = '.watches_gallery_item',
  textSelector = '.watches_gallery_txt-wrap',
  minWidthDesktop = 993
): void {
  const mql = window.matchMedia(`(min-width: ${minWidthDesktop}px)`);
  // Block only if strictly greater than 992px
  if (!mql.matches) return; // mobile: no blocking

  const items = Array.from(document.querySelectorAll<HTMLAnchorElement>(itemSelector));
  if (items.length === 0) return;

  items.forEach((item) => {
    const textWrap = item.querySelector<HTMLElement>(textSelector);
    if (!textWrap) return;

    textWrap.addEventListener('click', (ev) => {
      // Check width at click time (not only at initialization)
      const currentWidth = window.innerWidth;
      if (currentWidth < minWidthDesktop) {
        // Below threshold: let the click bubble up to the parent link
        return;
      }
      // Above threshold: block the click
      ev.preventDefault();
      ev.stopPropagation();
    });
  });
}

// Show empty banner if no results are found (simplified)
export function setupEmptyBannerByResults(
  bannerSelector = '#watches_sort-empty',
  listsRootSelector = '[fs-list-element="list"]'
): void {
  const banner = document.querySelector<HTMLElement>(bannerSelector);
  if (!banner) return;

  const update = () => {
    const visibleItem = document.querySelector(
      `${listsRootSelector} .w-dyn-items .w-dyn-item:not([hidden])`
    );
    banner.style.opacity = visibleItem ? '0' : '1';
  };

  // Single global observer to react to DOM/attributes changes
  const mo = new MutationObserver(() => requestAnimationFrame(update));
  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden', 'style', 'class'],
  });

  // Hooks: Finsweet + view change + resize
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes = (window as any).fsAttributes || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes.push(['cmsfilter', () => requestAnimationFrame(update)]);
  window.addEventListener('watches:view-changed', () => requestAnimationFrame(update));
  window.addEventListener('resize', () => requestAnimationFrame(update));

  update();
}

// Close Webflow dropdowns when a filter is selected
function closeAllDropdowns(): void {
  // Trouver tous les dropdowns ouverts
  const openDropdowns = document.querySelectorAll<HTMLElement>('.w-dropdown.w--open');
  openDropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector<HTMLElement>('.w-dropdown-toggle');
    const list = dropdown.querySelector<HTMLElement>('.w-dropdown-list');

    if (toggle) {
      toggle.classList.remove('w--open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    if (list) {
      list.classList.remove('w--open');
    }
    dropdown.classList.remove('w--open');
  });

  // Aussi chercher les toggles et lists directement (au cas où le parent n'a pas w--open)
  const openToggles = document.querySelectorAll<HTMLElement>('.w-dropdown-toggle.w--open');
  const openLists = document.querySelectorAll<HTMLElement>('.w-dropdown-list.w--open');

  openToggles.forEach((toggle) => {
    toggle.classList.remove('w--open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  openLists.forEach((list) => {
    list.classList.remove('w--open');
  });
}

// Scroll to TOP when a filter is selected
export function setupWatchesFilterScrollToTop(
  targetSelector = '.watches_content',
  filterSelector = 'form[fs-list-element="filters"] input[type="radio"]'
): void {
  const target = document.querySelector<HTMLElement>(targetSelector);
  if (!target) return;

  const scrollToFilter = () => {
    const rect = target.getBoundingClientRect();
    const navbar = document.querySelector<HTMLElement>('.navbar_component');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const targetPosition = window.scrollY + rect.top - navbarHeight - 20; // 20px de marge

    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth',
    });
  };

  // Écouter les changements sur les inputs radio des filtres
  document.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    if (target.matches && target.matches(filterSelector)) {
      // Fermer les dropdowns immédiatement
      closeAllDropdowns();
      // Petit délai pour laisser Finsweet appliquer les filtres
      setTimeout(scrollToFilter, 100);
    }
  });

  // Hook Finsweet pour capturer les changements de filtres
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes = (window as any).fsAttributes || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes.push([
    'cmsfilter',
    () => {
      // Fermer les dropdowns après application des filtres
      closeAllDropdowns();
      // Scroll après que les filtres soient appliqués
      setTimeout(scrollToFilter, 150);
    },
  ]);
}
