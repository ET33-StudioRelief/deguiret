export type StepTimelineOptions = {
  containerSelector?: string; // e.g. '.step_content'
  timelineSelector?: string; // e.g. '.step_timeline'
  offsetTopPx?: number; // top margin before filling starts
  offsetBottomPx?: number; // bottom margin before reaching the end
  minHeightPx?: number; // minimum visible height
  maxHeightPx?: number; // safety clamp
  easingPower?: number; // >1 slows early growth, keeps 1->1 mapping
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function setupStepTimeline(options?: StepTimelineOptions): void {
  // 1) Resolve options with sensible defaults
  const containerSelector = options?.containerSelector ?? '.step_content';
  const timelineSelector = options?.timelineSelector ?? '.step_timeline';
  const offsetTop = options?.offsetTopPx ?? 0;
  const offsetBottom = options?.offsetBottomPx ?? 0;
  const minHeight = options?.minHeightPx ?? 0;
  const maxHeight = options?.maxHeightPx ?? 100000;
  const easingPower = options?.easingPower ?? 1; // 1 = linear

  // 2) Grab containers and precompute each base height (without timeline growth)
  const containers = Array.from(document.querySelectorAll<HTMLElement>(containerSelector));
  if (containers.length === 0) return;

  const states = containers
    .map((container) => {
      const timeline = container.querySelector<HTMLElement>(timelineSelector);
      if (!timeline) return null;
      const prev = timeline.style.height;
      timeline.style.height = '0px';
      const baseHeight = container.scrollHeight; // intrinsic content height
      timeline.style.height = prev;
      return { container, timeline, baseHeight };
    })
    .filter((s): s is { container: HTMLElement; timeline: HTMLElement; baseHeight: number } => !!s);

  // 3) On scroll/resize, compute progress and set timeline height
  const onScroll = () => {
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    states.forEach(({ container, timeline, baseHeight }) => {
      const rect = container.getBoundingClientRect();

      // Visible segment of the container inside the viewport
      const visibleTop = clamp(-rect.top + offsetTop, 0, rect.height);
      const visibleBottom = clamp(viewportH - rect.top - offsetBottom, 0, rect.height);
      const visible = Math.max(
        0,
        Math.min(visibleBottom, rect.height) - Math.max(0, -rect.top + offsetTop)
      );

      // Progress ratio 0→1 with respect to the base height (not current layout)
      const progress = clamp((visibleTop + visible) / (baseHeight || 1), 0, 1);
      // Apply easing so the line reveals slower/faster while still reaching 100% at end
      const eased = Math.pow(progress, easingPower);

      // Target height clamped so it never increases the container height
      const hardMax = Math.min(maxHeight, baseHeight);
      const target = clamp(eased * baseHeight, minHeight, hardMax);
      timeline.style.height = `${Math.round(target)}px`;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}
