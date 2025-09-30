import './index.css';

import { setupCustomPiecesProgress } from './customPieces';
import { setupTeamInteractions } from './team';
import { setupStepTimeline } from './timeline';
import { swiperCustomPieces, swiperStep, swiperTestimonial } from './utils/swiper';
import { setupHeroCustomCursor, setupScrollTop, svgComponent } from './utils/ui';

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
  if (window.location?.pathname.includes('/custom-pieces')) {
    swiperCustomPieces();
    setupHeroCustomCursor('.hero-slider_content');
    setupCustomPiecesProgress('.project-custom_content');
    swiperTestimonial();
  }

  // Scroll-to-top button
  setupScrollTop('scroll-top', 200);
  svgComponent();
});
