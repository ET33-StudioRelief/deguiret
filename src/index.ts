import './index.css';

import { setupDarkMode } from './typescript/components/darkMode';
import {
  faqDropdown,
  setupButtonHoverCursor,
  setupScrollTop,
  sliderCustomCursor,
  svgComponent,
} from './typescript/components/global';
import {
  setupNavbarAutoContrast,
  setupNavbarBackgroundNonHero,
  setupNavbarHoverImages,
  setupNavbarVariantOnMobile,
} from './typescript/components/navbar';
import { ctaParallax, setupLayout2ColMoveUp } from './typescript/components/section';
import { setupCustomPiecesProgress } from './typescript/customPieces';
import {
  galleryTextBlock,
  setupCollectionSelectionClass,
  setupWatchesFloat,
  setupWatchesGridMobile,
  setupWatchesRowsInView,
  setupWatchesSortToggle,
  setupWatchesViewToggle,
} from './typescript/homepage';
import { setupStoryTestNav } from './typescript/story';
import { setupTeamInteractions } from './typescript/team';
import { setupTimeline } from './typescript/timeline';
import {
  setupProductAccordion,
  setupProductFeaturesTable,
  setupProductPrevNext,
} from './typescript/watches';
import {
  swiperCollection,
  swiperCustomPieces,
  swiperProduct,
  swiperStep,
  swiperTestimonial,
} from './utils/swiper';

window.Webflow ||= [];
window.Webflow.push(() => {
  setupNavbarHoverImages();
  // Automatic contrast navbar
  setupNavbarAutoContrast('.navbar_light-wrapper');
  setupDarkMode();
  faqDropdown('.faq_question');
  setupScrollTop('scroll-top', 200);
  svgComponent();
  ctaParallax();
  setupLayout2ColMoveUp();
  setupButtonHoverCursor();
  //Homepage
  if (window.location?.pathname.includes('/')) {
    galleryTextBlock();
    setupWatchesViewToggle();
    setupWatchesSortToggle();
    setupWatchesRowsInView();
    setupWatchesFloat('.watches_gallery_item-wrap');
    setupWatchesGridMobile();
    setupCollectionSelectionClass('.filters-collection', 'Filters-Collection');
    setupNavbarBackgroundNonHero();
  }
  //Who we are
  if (window.location?.pathname.includes('/who-we-are')) {
    setupTeamInteractions({ openFirst: true });
    setupNavbarBackgroundNonHero();
    setupNavbarVariantOnMobile('/who-we-are', '.navbar_component');
  }
  //How we make it
  if (window.location?.pathname.includes('/how-we-make-it')) {
    swiperStep();
    sliderCustomCursor('.step_slider-wrapper', '.swiper.is-step');
    setupTimeline();
  }
  //Custom pieces
  if (window.location?.pathname.includes('/custom-pieces')) {
    setupTimeline();
    swiperCustomPieces();
    sliderCustomCursor('.hero-slider_content', '.swiper.is-custom-pieces-bg');
    setupCustomPiecesProgress('.project-custom_content');
    swiperTestimonial();
    sliderCustomCursor('.section_testimonial', '.swiper.is-testimonial');
  }
  //Our story
  if (window.location?.pathname.includes('/our-story')) {
    setupStoryTestNav();
  }
  //CMS Page: Watches
  if (window.location?.pathname.includes('/watches')) {
    swiperProduct();
    sliderCustomCursor('.product-slider_content', '.swiper.is-product');
    sliderCustomCursor(
      '.collection-slider_content',
      '.swiper.is-collection',
      '.swiper.is-collection .swiper-slide.is-center .collection-slider_card'
    );
    swiperCollection();
    setupProductAccordion();
    setupProductFeaturesTable();
    setupProductPrevNext('#show-prev-product', '#show-next-product', '.w-dyn-items .w-dyn-item a');
  }
});
