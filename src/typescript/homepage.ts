// Lightweight helper: emulate hover on touch/keyboard
export function setupHomepageGalleryHover(itemSelector = '.watches_gallery_item'): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>(itemSelector));
  if (items.length === 0) return;

  items.forEach((el) => {
    el.addEventListener('focusin', () => el.classList.add('is-hover'));
    el.addEventListener('focusout', () => el.classList.remove('is-hover'));
    // Optional: tap toggles the hover state for touch users
    el.addEventListener('touchstart', () => el.classList.add('is-hover'), { passive: true });
    el.addEventListener('touchend', () => el.classList.remove('is-hover'));
  });
}
