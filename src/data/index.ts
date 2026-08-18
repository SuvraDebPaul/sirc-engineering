/**
 * Demo data barrel.
 *
 * **Only route handlers should import from here.** Pages and components go
 * through `src/lib/api/*`, which fetches over HTTP. That indirection is what
 * lets the data source change without touching a single component.
 */
export { BRANDS } from "./brands";
export { IMAGE_CREDITS } from "./image-credits";
export {
  FEATURES,
  HERO_SLIDES,
  POSTS,
  PROMOTIONS,
  SERVICES,
  TESTIMONIALS,
} from "./content";
export { CATEGORIES } from "./categories";
export { PRODUCTS } from "./products";
export { PRODUCT_DETAILS } from "./product-details";
export { SERVICE_DETAILS, type ServiceDetail } from "./service-details";
export { POST_BODIES } from "./post-bodies";
export { INDUSTRIES, type Industry } from "./industries";
