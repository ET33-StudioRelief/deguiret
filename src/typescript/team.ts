export type TeamInteractionsOptions = {
  openFirst?: boolean;
};

export function setupTeamInteractions(options?: TeamInteractionsOptions): void {
  const teamItems = Array.from(document.querySelectorAll<HTMLElement>('.team_item'));
  if (teamItems.length === 0) return;

  // Centrage précis avec compensation de la navbar sticky
  const centerAccurate = (el: HTMLElement, behavior: ScrollBehavior = 'smooth') => {
    const rect = el.getBoundingClientRect();
    const navbar = document.querySelector<HTMLElement>('.navbar_component');
    const headerH = navbar ? navbar.clientHeight : 0;
    const viewport = window.innerHeight || 0;
    const target = window.scrollY + rect.top + rect.height / 2 - viewport / 2 + headerH / 2;
    window.scrollTo({ top: Math.max(0, Math.round(target)), behavior });
  };

  const getContentElements = (container: HTMLElement): HTMLElement[] => {
    return Array.from(
      container.querySelectorAll<HTMLElement>('.team_hide-content, .team_right-col')
    );
  };

  const openItem = (item: HTMLElement) => {
    item.classList.add('is-open');
    // Centrer immédiatement avec compensation de navbar, puis affiner après un court délai
    centerAccurate(item, 'smooth');
    const contents = getContentElements(item);
    contents.forEach((el) => {
      // Mesure la hauteur naturelle
      const target = el.scrollHeight;
      el.style.maxHeight = target + 'px';
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.style.pointerEvents = 'auto';
      // Optionnel: après la transition, retirer la contrainte pour s'adapter aux changements de contenu
      const onEnd = (ev: TransitionEvent) => {
        if (ev.propertyName === 'max-height') {
          el.style.maxHeight = 'none';
          el.removeEventListener('transitionend', onEnd);
        }
      };
      el.addEventListener('transitionend', onEnd);
    });
    // Affinage: re-centre brièvement pendant l'animation pour compenser la variation de hauteur
    setTimeout(() => centerAccurate(item, 'auto'), 160);
  };

  const closeItem = (item: HTMLElement) => {
    item.classList.remove('is-open');
    const contents = getContentElements(item);
    contents.forEach((el) => {
      // Si max-height est 'none', on la re-fixe à sa hauteur actuelle pour permettre l'animation vers 0
      if (getComputedStyle(el).maxHeight === 'none') {
        el.style.maxHeight = el.scrollHeight + 'px';
        // Force reflow pour que le changement prenne effet avant de passer à 0
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        el.offsetHeight;
      }
      el.style.maxHeight = '0px';
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
    });
  };

  const closeAll = (except?: HTMLElement) => {
    teamItems.forEach((item) => {
      if (item !== except) {
        closeItem(item);
      }
    });
  };

  teamItems.forEach((item) => {
    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (isOpen) {
        // Si déjà ouvert, le replier sur clic
        closeItem(item);
      } else {
        // Sinon, fermer les autres et ouvrir celui-ci
        closeAll(item);
        openItem(item);
      }
    });
  });

  if (options?.openFirst && teamItems[0]) {
    openItem(teamItems[0]);
  }
}
