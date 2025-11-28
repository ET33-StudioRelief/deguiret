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
  initNavbarScroll,
  /*setupNavbarAutoContrast,*/
  setupNavbarBackgroundNonHero,
  setupNavbarHoverImages,
  setupNavbarMenuTextClick,
  setupNavbarVariantOnMobile,
} from './typescript/components/navbar';
import { ctaParallax, setupLayout2ColMoveUp } from './typescript/components/section';
import { setupCustomPiecesProgress } from './typescript/customPieces';
import {
  galleryTextBlock,
  setupEmptyBannerByResults,
  setupWatchesFilterScrollToTop,
  setupWatchesFloat,
  setupWatchesGalleryTextClickBlock,
  setupWatchesGridMobile,
  setupWatchesRowsInView,
  setupWatchesSortToggle,
  setupWatchesViewToggle,
} from './typescript/homepage';
import { setupStoryTestNav } from './typescript/story';
import { setupTeamInteractions } from './typescript/team';
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
  /*setupNavbarAutoContrast('.navbar_light-wrapper');*/
  setupNavbarMenuTextClick();
  initNavbarScroll();
  setupDarkMode();
  faqDropdown('.faq_question');
  setupScrollTop('scroll-top', 200);
  svgComponent();
  ctaParallax();
  setupLayout2ColMoveUp();
  setupButtonHoverCursor();
  if (window.location?.pathname.includes('/')) {
    galleryTextBlock();
    setupWatchesViewToggle();
    setupEmptyBannerByResults('#watches_sort-empty', '[fs-list-element="list"]');
    setupWatchesSortToggle();
    setupWatchesRowsInView();
    setupWatchesFloat('.watches_gallery_item-wrap');
    setupWatchesGridMobile();
    setupWatchesGalleryTextClickBlock();
    setupWatchesFilterScrollToTop();
    setupNavbarBackgroundNonHero();
  }
  //Who we are
  if (window.location?.pathname.includes('/who-we-are')) {
    setupTeamInteractions();
    setupNavbarBackgroundNonHero();
    setupNavbarVariantOnMobile('/who-we-are', '.navbar_component');
  }
  //How we make it
  if (window.location?.pathname.includes('/the-making')) {
    swiperStep();
    sliderCustomCursor('.step_slider-wrapper', '.swiper.is-step');
  }
  //Custom pieces
  if (window.location?.pathname.includes('/custom-pieces')) {
    swiperCustomPieces();
    sliderCustomCursor('.hero-slider_content', '.swiper.is-custom-pieces-bg');
    setupCustomPiecesProgress('.project-custom_content');
    swiperTestimonial();
    sliderCustomCursor('.testimonial_left-col', '.swiper.is-testimonial');
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
