type StepId = string;

function hideAllSteps(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>('.project-custom_step').forEach((el) => {
    el.style.display = 'none';
  });
}

function showStep(container: HTMLElement, stepId: StepId): void {
  hideAllSteps(container);
  const target = container.querySelector<HTMLElement>(
    `.project-custom_step[data-process="${stepId}"]`
  );
  if (target) {
    target.style.display = '';
  }

  // Toggle active styles on progress bar (step + its lines)
  const steps = Array.from(
    container.querySelectorAll<HTMLElement>('.project-custom_progress-step')
  );
  const activeIndex = steps.findIndex((el) => (el.getAttribute('data-process') || '') === stepId);
  steps.forEach((el, idx) => {
    const fill = activeIndex >= 0 ? idx <= activeIndex : false;
    el.classList.toggle('is-black', fill);
    el.querySelectorAll<HTMLElement>('.project-custom_progress-line').forEach((line) => {
      // Preserve base background (tertiary). Animate an overlay via background-size.
      line.style.backgroundImage = 'linear-gradient(currentColor, currentColor)';
      line.style.backgroundRepeat = 'no-repeat';
      line.style.backgroundPosition = 'left center';
      line.style.transition = 'background-size 420ms cubic-bezier(0.22, 1, 0.36, 1)';
      line.style.backgroundSize = fill ? '100% 100%' : '0% 100%';
      // Color comes from currentColor; toggle .is-black to switch color via CSS
      line.classList.toggle('is-black', fill);
    });
  });
}

export function setupCustomPiecesProgress(rootSelector = '.project-custom_content'): void {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return;

  // Init: show step1 if exists; else first step
  const defaultStep = 'step1';
  const hasDefault = !!root.querySelector(`.project-custom_step[data-process="${defaultStep}"]`);
  if (hasDefault) {
    showStep(root, defaultStep);
  } else {
    const first = root.querySelector<HTMLElement>('.project-custom_step[data-process]');
    if (first) showStep(root, first.getAttribute('data-process') || '');
  }

  // Click handlers on progress steps
  root
    .querySelectorAll<HTMLElement>('.project-custom_progress-step[data-process]')
    .forEach((step) => {
      step.addEventListener('click', () => {
        const id = step.getAttribute('data-process') || '';
        if (!id) return;
        showStep(root, id);
      });
    });
}
