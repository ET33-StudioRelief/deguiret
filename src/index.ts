import './index.css';

import {
  ctaParallax,
  setupLayout2ColMoveUp,
  setupNavbarAutoContrast,
  setupNavbarHoverImages,
  setupNavbarVariantOnMobile,
} from './typescript/component';
import { setupCustomPiecesProgress } from './typescript/customPieces';
import {
  galleryTextBlock,
  setupWatchesFloat,
  setupWatchesGridMobile,
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
import { applyStoredThemeEarly, setupDarkMode } from './utils/darkMode';
import {
  swiperCollection,
  swiperCustomPieces,
  swiperProduct,
  swiperStep,
  swiperTestimonial,
} from './utils/swiper';
import {
  faqDropdown,
  setupButtonHoverCursor,
  setupScrollTop,
  sliderCustomCursor,
  svgComponent,
} from './utils/ui';

// Appliquer le thème stocké AVANT Webflow pour éviter le flash
applyStoredThemeEarly();

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
  galleryTextBlock();
  setupWatchesViewToggle();
  setupWatchesSortToggle();
  setupWatchesRowsInView();
  setupWatchesFloat('.watches_gallery_item-wrap');
  // Mobile grid card behaviour: first tap reveals text
  setupWatchesGridMobile();
  setupNavbarHoverImages();

  // Navbar variant (background) on mobile for Who we are
  setupNavbarVariantOnMobile('/who-we-are', '.navbar_component');
  // Auto-contraste de la navbar selon le fond sous elle
  setupNavbarAutoContrast('.navbar_light-wrapper');
  if (window.location?.pathname.includes('/watches')) {
    swiperProduct();
    sliderCustomCursor('.product-slider_content', '.swiper.is-product');
    sliderCustomCursor(
      '.collection-slider_content',
      '.swiper.is-collection',
      '.collection-slider_card'
    );
    swiperCollection();
    setupProductAccordion();
    setupProductFeaturesTable();
    setupProductPrevNext('#show-prev-product', '#show-next-product', '.w-dyn-items .w-dyn-item a');
  }
  setupDarkMode();
  faqDropdown('.faq_question');
  setupScrollTop('scroll-top', 200);
  svgComponent();
  ctaParallax();
  setupLayout2ColMoveUp();
  setupButtonHoverCursor();
});
