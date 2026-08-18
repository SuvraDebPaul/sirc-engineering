/** Data access barrel — import from `@/lib/api`. */
export { ApiError, cacheTags, fetchJson, type FetchOptions } from "./client";
export { getBrandById, getBrandCounts, getBrands, getProductsByBrand } from "./brands";
export {
  getFeatures,
  getHeroSlides,
  getLatestPosts,
  getPromotion,
  getPromotions,
  getServices,
  getIndustries,
  getIndustryBySlug,
  getIndustryProducts,
  getIndustryServices,
  getPostDetail,
  getPosts,
  getRelatedPosts,
  getServiceBySlug,
  getServiceDetail,
  getTestimonials,
} from "./content";
export {
  getCategories,
  getCategoryBySlug,
  getCategoryCounts,
  getProductsByCategory,
} from "./categories";
export {
  getFeaturedProducts,
  getProductBySlug,
  getProductDetail,
  getProducts,
  getRelatedProducts,
} from "./products";
