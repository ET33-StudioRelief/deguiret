// Navbar hover images swapper

type ImageKey = 'default' | '1' | '2' | '3' | '4' | '5' | '6';

const NAVBAR_IMAGES: Record<ImageKey, string> = {
  default:
    'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cbee531d1296f9363f_navbar-default.png',
  '1': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4ccf62a312241bc9770_navbar-our-story.png',
  '2': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cb79d1daf24cbb64eb_navbar-who-we-are.png',
  '3': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cb854af244b1149371_navbar-how-we-make-it.png',
  '4': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cbda0c0b9224e02e8a_navbar-custom-pieces.png',
  '5': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cb8d31fecd33a07d78_navbar-contact.png',
  '6': 'https://cdn.prod.website-files.com/68d15c3cc19b305efc7db1cc/68e4c4cb8d31fecd33a07d78_navbar-contact.png',
};

function getImageUrlFromDataset(el: HTMLElement | null): string {
  if (!el) return NAVBAR_IMAGES.default;
  const keyRaw = el.getAttribute('data-image')?.trim();
  if (!keyRaw) return NAVBAR_IMAGES.default;
  const key = (keyRaw as ImageKey) in NAVBAR_IMAGES ? (keyRaw as ImageKey) : 'default';
  return NAVBAR_IMAGES[key];
}

function setNavbarImage(wrapper: HTMLElement, url: string): void {
  wrapper.style.backgroundImage = `url("${url}")`;
  wrapper.style.backgroundSize = 'cover';
}

export function setupNavbarHoverImages(
  linksSelector = '.navbar_link[data-image]',
  imageWrapperSelector = '.navbar_img-wrapper'
): void {
  // Debug init
  // eslint-disable-next-line no-console
  console.log('[navbarImages] init', { linksSelector, imageWrapperSelector });
  const wrapper = document.querySelector<HTMLElement>(imageWrapperSelector);
  if (!wrapper) {
    // eslint-disable-next-line no-console
    console.log('[navbarImages] wrapper not found');
    return;
  }

  // Preload images (optional but helps avoid flicker)
  Object.values(NAVBAR_IMAGES).forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  // Set default on init
  setNavbarImage(wrapper, NAVBAR_IMAGES.default);
  // eslint-disable-next-line no-console
  console.log('[navbarImages] default applied');

  const handleEnter = (target: HTMLElement) => {
    setNavbarImage(wrapper, getImageUrlFromDataset(target));
    // eslint-disable-next-line no-console
    console.log('[navbarImages] enter', target.getAttribute('data-image'));
  };
  const handleLeave = () => {
    setNavbarImage(wrapper, NAVBAR_IMAGES.default);
    // eslint-disable-next-line no-console
    console.log('[navbarImages] leave -> default');
  };

  // Event delegation to be robust to dynamic DOM (Webflow menus)
  const onMouseOver = (e: Event) => {
    const el = (e.target as HTMLElement)?.closest(linksSelector) as HTMLElement | null;
    if (el) handleEnter(el);
  };
  const onMouseOut = (e: Event) => {
    const el = (e.target as HTMLElement)?.closest(linksSelector) as HTMLElement | null;
    if (el) handleLeave();
  };
  const onFocusIn = (e: Event) => {
    const el = (e.target as HTMLElement)?.closest(linksSelector) as HTMLElement | null;
    if (el) handleEnter(el);
  };
  const onFocusOut = (e: Event) => {
    const el = (e.target as HTMLElement)?.closest(linksSelector) as HTMLElement | null;
    if (el) handleLeave();
  };

  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);
  // eslint-disable-next-line no-console
  console.log('[navbarImages] listeners attached (delegated)');
}

// Set navbar variant on specific page and viewport
export function setupNavbarVariantOnMobile(
  pagePath = '/who-we-are',
  selector = '.navbar_component',
  maxWidthPx = 768
): void {
  if (!window.location?.pathname.includes(pagePath)) return;
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;

  const mql = window.matchMedia(`(max-width: ${maxWidthPx - 1}px)`);
  const apply = () => {
    if (mql.matches) {
      // N'applique que la combo class runtime
      el.classList.add('is-background');
    } else {
      el.classList.remove('is-background');
    }
  };
  apply();
  mql.addEventListener?.('change', apply);
}
