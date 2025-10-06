type AccordionOptions = {
  containerSelector?: string;
  itemSelector?: string;
  headerSelector?: string;
  contentSelector?: string;
  activeClass?: string;
};

export function setupProductAccordion(options: AccordionOptions = {}): void {
  const {
    containerSelector = '.product-step_content',
    itemSelector = '.product-step_accordion',
    headerSelector = '.product-step_column',
    contentSelector = '.product-step_column-content',
    activeClass = 'active',
  } = options;

  const containers = Array.from(document.querySelectorAll<HTMLElement>(containerSelector));
  if (containers.length === 0) return;

  containers.forEach((scope) => {
    const items = Array.from(scope.querySelectorAll<HTMLElement>(itemSelector));
    if (items.length === 0) return;

    // Initialize: ensure only one active (keep the first if multiple)
    const actives = items.filter((el) => el.classList.contains(activeClass));
    if (actives.length > 1) {
      actives.slice(1).forEach((el) => el.classList.remove(activeClass));
    }

    // Helper to sync display of right-embed wrappers with a small delay when hiding
    const syncRightEmbedDisplay = (activeItem: HTMLElement | null) => {
      items.forEach((it) => {
        const rightEmbed = it.querySelector<HTMLElement>('.product-step_right-embed-wrapper');
        if (!rightEmbed) return;
        if (it === activeItem) {
          // Show immediately for the active item to let the accordion feel responsive
          rightEmbed.style.display = 'block';
        } else {
          // Hide slightly later to let width transition complete smoothly
          window.setTimeout(() => {
            rightEmbed.style.display = 'none';
          }, 200);
        }
      });
    };

    // Initial sync
    syncRightEmbedDisplay(actives[0] || null);

    items.forEach((item) => {
      const header = item.querySelector<HTMLElement>(headerSelector);
      if (!header) return;

      header.addEventListener('click', () => {
        // If already active, do nothing (or toggle off if desired)
        if (item.classList.contains(activeClass)) return;

        // Deactivate others in the same scope
        items.forEach((it) => {
          if (it !== item) it.classList.remove(activeClass);
        });

        // Activate clicked
        item.classList.add(activeClass);

        // Toggle optional content visibility via aria for accessibility
        const content = item.querySelector<HTMLElement>(contentSelector);
        if (content) {
          content.setAttribute('aria-hidden', 'false');
        }
        items.forEach((it) => {
          if (it === item) return;
          const c = it.querySelector<HTMLElement>(contentSelector);
          if (c) c.setAttribute('aria-hidden', 'true');
        });

        // Sync right-embed wrappers display with delay for smoother accordion effect
        syncRightEmbedDisplay(item);
      });
    });
  });
}

// Prev/Next navigation based on DOM order of a Webflow Collection List
// - prevAnchorId: '#show-prev-product'
// - nextAnchorId: '#show-next-product'
// - itemLinkSelector: anchors inside CMS items (default: '.w-dyn-items .w-dyn-item a')
export function setupProductPrevNext(
  prevElSelector = '#show-prev-product',
  nextElSelector = '#show-next-product',
  itemLinkSelector = '.w-dyn-items .w-dyn-item a',
  sourceContainerSelector = '[data-prevnext-source]'
): void {
  const prevEl = document.querySelector<HTMLElement>(prevElSelector);
  const nextEl = document.querySelector<HTMLElement>(nextElSelector);
  if (!prevEl || !nextEl) return;

  // Get current product slug from URL (last non-empty segment)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const currentSlug = pathParts[pathParts.length - 1];
  if (!currentSlug) return;

  // Determine collection base path to constrain links (first segment)
  const baseSegment = '/' + (pathParts[0] || '').toLowerCase() + '/';

  // Pick source container if provided (hidden collection recommended)
  const sourceRoot =
    document.querySelector<HTMLElement>(sourceContainerSelector) || document.documentElement;

  // Collect links in DOM order, restricted to the same collection base
  const links = Array.from(sourceRoot.querySelectorAll<HTMLAnchorElement>(itemLinkSelector)).filter(
    (a) => {
      const raw = a.getAttribute('href') || '';
      if (!raw || raw === '#') return false;
      try {
        const url = new URL(raw, window.location.origin);
        return url.pathname.toLowerCase().startsWith(baseSegment);
      } catch {
        return false;
      }
    }
  );
  if (links.length === 0) return;

  // Normalize to slug (last non-empty path segment)
  const linkToSlug = (href: string): string | null => {
    try {
      const url = new URL(href, window.location.origin);
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] || null;
    } catch {
      return null;
    }
  };

  const slugs = links.map((a) => ({ a, slug: linkToSlug(a.href) })).filter((x) => !!x.slug) as {
    a: HTMLAnchorElement;
    slug: string;
  }[];
  if (slugs.length === 0) return;

  // Find current index in that ordered list
  const idx = slugs.findIndex((x) => x.slug === currentSlug);
  if (idx === -1) return;

  // Compute prev/next with wrap-around
  const prevIdx = (idx - 1 + slugs.length) % slugs.length;
  const nextIdx = (idx + 1) % slugs.length;

  const stripTrailingHash = (href: string | undefined): string | null => {
    if (!href) return null;
    try {
      const url = new URL(href, window.location.origin);
      // Supprime le hash éventuel ajouté par Webflow (# en fin d'URL)
      return url.origin + url.pathname + url.search; // sans url.hash
    } catch {
      // Fallback: simple regex
      return href.replace(/#$/, '') || null;
    }
  };

  const prevHref = stripTrailingHash(
    slugs[prevIdx]?.a?.getAttribute('href') || slugs[prevIdx]?.a?.href
  );
  const nextHref = stripTrailingHash(
    slugs[nextIdx]?.a?.getAttribute('href') || slugs[nextIdx]?.a?.href
  );

  if (prevHref) {
    prevEl.setAttribute('data-href', prevHref);
    prevEl.removeAttribute('aria-disabled');
    prevEl.style.pointerEvents = '';
    prevEl.style.opacity = '';
  } else {
    prevEl.removeAttribute('data-href');
    prevEl.setAttribute('aria-disabled', 'true');
    prevEl.style.pointerEvents = 'none';
    prevEl.style.opacity = '0.5';
  }

  if (nextHref) {
    nextEl.setAttribute('data-href', nextHref);
    nextEl.removeAttribute('aria-disabled');
    nextEl.style.pointerEvents = '';
    nextEl.style.opacity = '';
  } else {
    nextEl.removeAttribute('data-href');
    nextEl.setAttribute('aria-disabled', 'true');
    nextEl.style.pointerEvents = 'none';
    nextEl.style.opacity = '0.5';
  }

  // Click navigation for div buttons
  const handleClick = (ev: Event) => {
    const el = ev.currentTarget as HTMLElement | null;
    const href = el?.getAttribute('data-href') || '';
    if (!href) {
      ev.preventDefault();
      return;
    }
    window.location.assign(href);
  };
  prevEl.addEventListener('click', handleClick);
  nextEl.addEventListener('click', handleClick);
}

// Switcher table: affiche le bloc dont data-features correspond à l’onglet cliqué
export function setupProductFeaturesTable(): void {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.section_table'));
  if (sections.length === 0) return;

  sections.forEach((section) => {
    const rowItems = Array.from(
      section.querySelectorAll<HTMLElement>('.table_row .table_row-item')
    );
    // Nouveau: les contenus portent data-features sur .table_step-content
    const infoWrappers = Array.from(section.querySelectorAll<HTMLElement>('.table_step-content'));
    if (rowItems.length === 0 || infoWrappers.length === 0) return;

    const activate = (feature: string) => {
      rowItems.forEach((it) => it.classList.toggle('is-active', it.dataset.features === feature));
      infoWrappers.forEach((wrap) => {
        const match = wrap.dataset.features === feature;
        wrap.classList.toggle('is-active', match);
      });
    };

    const initial = rowItems[0]?.dataset.features || infoWrappers[0]?.dataset.features;
    if (initial) activate(initial);

    rowItems.forEach((item) => {
      item.addEventListener('click', () => {
        const feature = item.dataset.features;
        if (feature) activate(feature);
      });
    });
  });
}
