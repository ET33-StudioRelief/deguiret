import './index.css';

import { setupNavbarHoverImages } from './typescript/component';
import { setupCustomPiecesProgress } from './typescript/customPieces';
import {
  galleryTextBlock,
  setupWatchesRowsInView,
  setupWatchesSortToggle,
  setupWatchesViewToggle,
} from './typescript/homepage';
import {
  setupProductAccordion,
  setupProductFeaturesTable,
  setupProductPrevNext,
} from './typescript/product';
import { setupStoryNav } from './typescript/story';
import { setupTeamInteractions } from './typescript/team';
import { setupTimeline } from './typescript/timeline';
import { setupDarkMode } from './utils/darkMode';
import {
  swiperCollection,
  swiperCustomPieces,
  swiperProduct,
  swiperStep,
  swiperTestimonial,
} from './utils/swiper';
import { faqDropdown, setupScrollTop, sliderCustomCursor, svgComponent } from './utils/ui';

window.Webflow ||= [];
window.Webflow.push(() => {
  if (window.location?.pathname.includes('/who-we-are')) {
    setupTeamInteractions({ openFirst: true });
  }
  if (window.location?.pathname.includes('/how-we-make-it')) {
    swiperStep();
    sliderCustomCursor('.step_slider-wrapper', '.swiper.is-step');
    setupTimeline();
  }
  if (window.location?.pathname.includes('/custom-pieces')) {
    swiperCustomPieces();
    sliderCustomCursor('.hero-slider_content', '.swiper.is-custom-pieces-bg');
    setupCustomPiecesProgress('.project-custom_content');
    swiperTestimonial();
    sliderCustomCursor('.section_testimonial', '.swiper.is-testimonial');
  }
  if (window.location?.pathname.includes('/our-story')) {
    setupStoryNav();
  }
  // Shared on homepage/other pages where the gallery appears
  galleryTextBlock();
  setupWatchesViewToggle();
  setupWatchesSortToggle();
  setupWatchesRowsInView();
  setupNavbarHoverImages();
  if (window.location?.pathname.includes('/watches')) {
    swiperProduct();
    sliderCustomCursor('.product-slider_content', '.swiper.is-product');
    swiperCollection();
    sliderCustomCursor('.collection-slider_content', '.swiper.is-front-collection');
    setupProductAccordion();
    setupProductFeaturesTable();
    setupProductPrevNext('#show-prev-product', '#show-next-product', '.w-dyn-items .w-dyn-item a');
  }
  // Dark mode toggle
  setupDarkMode();
  // FAQ accordion
  faqDropdown('.faq_question');
  // Scroll-to-top button
  setupScrollTop('scroll-top', 200);
  svgComponent();
});
