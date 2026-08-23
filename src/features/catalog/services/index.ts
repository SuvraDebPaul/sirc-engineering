/** Catalog data access and business logic — import from `@/features/catalog/services`. */
export { getBrandById, getBrandCounts, getBrands, getProductsByBrand } from "./brands";
export {
  getCategories,
  getCategoryBySlug,
  getCategoryCounts,
  getCategoryTree,
  getProductsByCategory,
  getSubcategories,
  type CategoryNode,
} from "./categories";
export {
  getFeaturedProducts,
  getProductBySlug,
  getProductDetail,
  getProducts,
  getQuoteOnlyProducts,
  getRelatedProducts,
} from "./products";
export { getTopSellingProducts, getTrendingProducts } from "./merchandising";
