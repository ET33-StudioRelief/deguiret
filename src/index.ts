import './index.css';

import { setupTeamInteractions } from './team';
import { setupStepTimeline } from './timeline';
import { swiperStep } from './utils/swiper';
import { setupScrollTop, svgComponent } from './utils/ui';

window.Webflow ||= [];
window.Webflow.push(() => {
  if (window.location?.pathname.includes('/who-we-are')) {
    setupTeamInteractions({ openFirst: true });
  }
  if (window.location?.pathname.includes('/how-we-make-it')) {
    swiperStep();
    setupStepTimeline({
      containerSelector: '.step_content',
      timelineSelector: '.step_timeline',
      offsetTopPx: 80,
      offsetBottomPx: 80,
      minHeightPx: 0,
      maxHeightPx: 20000,
      easingPower: 1.8,
    });
  }

  // Scroll-to-top button
  setupScrollTop('scroll-top', 200);
  svgComponent();
});
