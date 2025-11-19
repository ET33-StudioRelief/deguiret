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
export function setupWatchesViewToggle(
  galleryBtn = '#show-gallery-watches',
  gridBtn = '#show-grid-watches',
  labelSelector = '#view-type-data-text',
  galleryWrapper = '.watches_gallery_wrapper',
  gridWrapper = '.watches_grid_wrapper'
): void {
  const galleryEl = document.querySelector<HTMLElement>(galleryBtn);
  const gridEl = document.querySelector<HTMLElement>(gridBtn);
  const label = document.querySelector<HTMLElement>(labelSelector);
  const galleryWrap = document.querySelector<HTMLElement>(galleryWrapper);
  const gridWrap = document.querySelector<HTMLElement>(gridWrapper);
  if (!galleryEl || !gridEl || !label || !galleryWrap || !gridWrap) return;

  const setHeights = (showGallery: boolean) => {
    const animate = (el: HTMLElement, expand: boolean, done?: () => void) => {
      const currentHeight = el.offsetHeight; // current rendered height
      const targetHeight = expand ? el.scrollHeight : 0;
      // Prepare
      el.style.overflow = 'hidden';
      el.style.transition = 'height 360ms ease, opacity 240ms ease';
      // Set starting height
      el.style.height = currentHeight + 'px';
      el.style.opacity = expand ? '0' : '1';
      // In next frame, go to target
      requestAnimationFrame(() => {
        el.style.height = targetHeight + 'px';
        el.style.opacity = expand ? '1' : '0';
      });
      // Cleanup
      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd);
        if (expand) {
          el.style.height = 'auto';
          el.style.overflow = '';
        } else {
          el.style.height = '0px';
          el.style.overflow = 'hidden';
        }
        if (done) done();
      };
      el.addEventListener('transitionend', onEnd);
    };

    if (showGallery) {
      // Séquence: fermer Grid puis ouvrir Gallery pour éviter les à-coups de reflow
      animate(gridWrap, false, () => {
        // Assure une frame entre les deux pour laisser le layout se stabiliser
        requestAnimationFrame(() =>
          animate(galleryWrap, true, () => {
            // Notifie que la vue a changé (utilisé pour relancer les entrances)
            window.dispatchEvent(new CustomEvent('watches:view-changed'));
          })
        );
      });
    } else {
      // Ouverture Grid peut rester simultanée, elle est déjà smooth
      animate(galleryWrap, false);
      animate(gridWrap, true, () => {
        // Notifie que la vue a changé (utilisé pour relancer les entrances)
        window.dispatchEvent(new CustomEvent('watches:view-changed'));
      });
    }
  };

  const applyLabel = (fromEl: HTMLElement) => {
    const txt = fromEl.getAttribute('data-text') || '';
    if (txt) label.textContent = txt.toUpperCase();
  };

  galleryEl.addEventListener('click', (e) => {
    e.preventDefault();
    applyLabel(galleryEl);
    setHeights(true);
    // Retire sur le bouton cliqué, ajoute sur l'autre
    galleryEl.classList.remove('is-border-tertiary');
    gridEl.classList.add('is-border-tertiary');
  });

  gridEl.addEventListener('click', (e) => {
    e.preventDefault();
    applyLabel(gridEl);
    setHeights(false);
    // Retire sur le bouton cliqué, ajoute sur l'autre
    gridEl.classList.remove('is-border-tertiary');
    galleryEl.classList.add('is-border-tertiary');
  });

  // Toggle en cliquant sur le label: bascule vers l'autre vue que celle actuellement affichée
  label.addEventListener('click', (e) => {
    e.preventDefault();
    // Détermine la vue active via les classes des boutons:
    // le bouton actif est celui qui n'a PAS la classe 'is-border-tertiary'
    const isGalleryActive = !galleryEl.classList.contains('is-border-tertiary');
    if (isGalleryActive) {
      // Aller vers Grid
      applyLabel(gridEl);
      setHeights(false);
      gridEl.classList.remove('is-border-tertiary');
      galleryEl.classList.add('is-border-tertiary');
    } else {
      // Aller vers Gallery
      applyLabel(galleryEl);
      setHeights(true);
      galleryEl.classList.remove('is-border-tertiary');
      gridEl.classList.add('is-border-tertiary');
    }
  });
}

// Observe rows (gallery + grid) to fade-in on enter viewport
export function setupWatchesRowsInView(
  rowsSelector = '.watches_gallery_item-wrap, .watches_grid_card',
  rootMargin = '0px 0px -10% 0px', // déclenche un peu avant
  minWidthDesktop = 992
): void {
  const mql = window.matchMedia(`(min-width: ${minWidthDesktop}px)`);
  if (!mql.matches) return; // desktop only

  const rows = Array.from(document.querySelectorAll<HTMLElement>(rowsSelector));
  if (rows.length === 0) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.classList.add('is-inview');
          io.unobserve(el); // première apparition uniquement (jusqu'au prochain switch de vue)
        }
      });
    },
    { root: null, rootMargin, threshold: 0.05 }
  );
  rows.forEach((el) => io.observe(el));

  // Redémarre les entrées uniquement lors d’un changement de vue (gallery/grid)
  const onViewChanged = () => {
    // Laisse le layout se stabiliser après les transitions de hauteur
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

export function setupWatchesFloat(selector = '.watches_gallery_item-wrap', amp = -50): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (els.length === 0) return;

  // Calcul flottant en fonction de la position dans la fenêtre
  const updateAll = () => {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;
    els.forEach((el) => {
      // Réinitialise quand l'élément est caché par Finsweet ([hidden])
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

  // MutationObserver: surveille les changements d'attributs (hidden/style) et la structure
  const observer = new MutationObserver(() => scheduleUpdate());
  els.forEach((el) => {
    observer.observe(el, { attributes: true, attributeFilter: ['hidden', 'style'] });
  });

  // Surveille aussi le conteneur parent pour les ajouts/suppressions/réordonnancements
  const parent = els[0].parentElement;
  if (parent) {
    const treeObserver = new MutationObserver(() => scheduleUpdate());
    treeObserver.observe(parent, { childList: true, subtree: false });
  }

  // Recalcul lors des événements internes de la page
  window.addEventListener('watches:view-changed', scheduleUpdate);

  // Hook Finsweet (si présent): recalcul après application/maj des filtres
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes = (window as any).fsAttributes || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes.push(['cmsfilter', () => scheduleUpdate()]);

  // Initial
  updateAll();
}

// Sort order toggle for watches collection (oldest/newest)
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

  const assignOriginalIndex = (container: HTMLElement | null) => {
    if (!container) return;
    Array.from(container.children).forEach((child, index) => {
      const el = child as HTMLElement;
      if (!el.dataset.originalIndex) {
        el.dataset.originalIndex = String(index);
      }
    });
  };

  const isHiddenItem = (el: HTMLElement) => {
    if (el.hasAttribute('hidden')) return true;
    const style = el.getAttribute('style') || '';
    if (style.includes('display:none') || style.includes('display: none')) return true;
    if (el.getAttribute('aria-hidden') === 'true') return true;
    return false;
  };

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
    const visible = children.filter((el) => !isHiddenItem(el)).sort(sortFn);
    const hidden = children.filter((el) => isHiddenItem(el)).sort(sortFn);
    [...visible, ...hidden].forEach((el) => container.appendChild(el));
  };

  assignOriginalIndex(gallery);
  assignOriginalIndex(grid);

  // Helper: restore initial order
  const restoreInitialOrder = (container: HTMLElement | null) => {
    reorderByOriginalIndex(container, true);
  };

  // Helper: reverse order
  const reverseOrder = (container: HTMLElement | null) => {
    reorderByOriginalIndex(container, false);
  };

  // Helper: reset des transforms appliqués par setupWatchesFloat pour éviter les décalages au tri
  const resetGalleryFloatTransforms = () => {
    const floats = Array.from(document.querySelectorAll<HTMLElement>('.watches_gallery_item-wrap'));
    floats.forEach((el) => {
      el.style.transform = '';
    });
  };

  // Helper: update label if present
  const updateLabel = (fromEl: HTMLElement) => {
    if (!label) return;
    const txt = fromEl.getAttribute('data-text') || '';
    label.textContent = txt;
  };

  // Click on "oldest" → restaure l'ordre initial (A-Z)
  oldestEl.addEventListener('click', (e) => {
    e.preventDefault();
    restoreInitialOrder(gallery);
    restoreInitialOrder(grid);
    updateLabel(oldestEl);
    // Toggle border classes (inverse)
    oldestEl.classList.remove('is-border-tertiary');
    newestEl.classList.add('is-border-tertiary');
    // Évite les décalages liés au flottement après réordonnancement
    resetGalleryFloatTransforms();
    // Re-mark feature line after reorder
    galleryTextBlock();
    // Trigger view-changed to re-observe items for animation
    window.dispatchEvent(new CustomEvent('watches:view-changed'));
  });

  // Click on "newest" → inverse l'ordre initial (Z-A)
  newestEl.addEventListener('click', (e) => {
    e.preventDefault();
    reverseOrder(gallery);
    reverseOrder(grid);
    updateLabel(newestEl);
    // Toggle border classes (inverse)
    newestEl.classList.remove('is-border-tertiary');
    oldestEl.classList.add('is-border-tertiary');
    // Évite les décalages liés au flottement après réordonnancement
    resetGalleryFloatTransforms();
    // Re-mark feature line after reorder
    galleryTextBlock();
    // Trigger view-changed to re-observe items for animation
    window.dispatchEvent(new CustomEvent('watches:view-changed'));
  });

  // Toggle en cliquant sur le label d'ordre: bascule vers l'autre tri actif
  if (label) {
    label.addEventListener('click', (e) => {
      e.preventDefault();
      // Le bouton actif est celui qui n'a PAS la classe 'is-border-tertiary'
      const isOldestActive = !oldestEl.classList.contains('is-border-tertiary');
      if (isOldestActive) {
        // Passer à NEWEST (Z-A)
        reverseOrder(gallery);
        reverseOrder(grid);
        updateLabel(newestEl);
        newestEl.classList.remove('is-border-tertiary');
        oldestEl.classList.add('is-border-tertiary');
      } else {
        // Revenir à OLDEST (A-Z)
        restoreInitialOrder(gallery);
        restoreInitialOrder(grid);
        updateLabel(oldestEl);
        oldestEl.classList.remove('is-border-tertiary');
        newestEl.classList.add('is-border-tertiary');
      }
      // Évite les décalages liés au flottement après réordonnancement
      resetGalleryFloatTransforms();
      // Met à jour la ligne "feature" et relance les animations d'entrée
      galleryTextBlock();
      window.dispatchEvent(new CustomEvent('watches:view-changed'));
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
  minWidthDesktop = 992
): void {
  const mql = window.matchMedia(`(min-width: ${minWidthDesktop}px)`);
  if (!mql.matches) return; // mobile: pas de blocage

  const items = Array.from(document.querySelectorAll<HTMLAnchorElement>(itemSelector));
  if (items.length === 0) return;

  items.forEach((item) => {
    const textWrap = item.querySelector<HTMLElement>(textSelector);
    if (!textWrap) return;

    textWrap.addEventListener('click', (ev) => {
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

// Synchronise un paragraphe unique avec la description de la collection sélectionnée
export function setupCollectionDescriptionSync(
  outputSelector = '#collection-description',
  // Liste cachée servant de source (items CMS) – on prend p:first-of-type comme description
  sourceListSelector = '.watches_paragraph-wrap .w-dyn-list [fs-list-element="list"]',
  // Radios du filtre collection
  radiosSelector = 'form[fs-list-element="filters"] input[fs-list-field="collection"]',
  // Texte affiché si aucune collection (All) est sélectionnée
  emptyText: string | null = null
): void {
  const output = document.querySelector<HTMLElement>(outputSelector);
  if (!output) return;

  const srcList = document.querySelector<HTMLElement>(sourceListSelector);
  if (!srcList) return;

  const items = Array.from(
    srcList.querySelectorAll<HTMLElement>('[fs-list-element="item"], .w-dyn-item')
  );
  if (items.length === 0) return;

  // Construit la map { collectionValue → descriptionText }
  const valueToText = new Map<string, string>();
  items.forEach((it) => {
    const valueEl = it.querySelector<HTMLElement>('[fs-list-field="collection"]');
    if (!valueEl) return;
    const key = (valueEl.textContent || '').trim();
    if (!key) return;
    const p = it.querySelector<HTMLParagraphElement>('p');
    const desc = (p?.textContent || '').trim();
    if (desc) valueToText.set(key, desc);
  });

  const readSelectedValue = (): string | null => {
    const radios = Array.from(document.querySelectorAll<HTMLInputElement>(radiosSelector));
    const checked = radios.find((r) => r.checked);
    if (!checked) return null;
    const v = (checked.getAttribute('fs-list-value') || checked.value || '').trim();
    return v || null; // null si All (valeur vide)
  };

  const applyOutput = () => {
    const selected = readSelectedValue();
    if (!selected) {
      if (emptyText === null) {
        // Par défaut: vide
        output.textContent = '';
      } else {
        output.textContent = emptyText;
      }
      return;
    }
    const txt = valueToText.get(selected) || '';
    output.textContent = txt;
  };

  // Écoute changements utilisateur
  document.addEventListener('change', (e) => {
    const t = e.target as HTMLElement | null;
    if (t && t.matches && t.matches('input[fs-list-field="collection"]')) applyOutput();
  });

  // Après application des filtres Finsweet (sécurité)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes = (window as any).fsAttributes || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).fsAttributes.push(['cmsfilter', () => requestAnimationFrame(applyOutput)]);

  // Initial
  applyOutput();
}
