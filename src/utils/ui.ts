export function setupScrollTop(buttonId = 'scroll-top', thresholdPx = 200): void {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  const toggle = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y > thresholdPx) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
export function svgComponent() {
  document.querySelectorAll('[svg="component"]').forEach((element) => {
    const svgCode = element.textContent;
    if (svgCode !== null) {
      element.innerHTML = svgCode;
    }
  });
}
