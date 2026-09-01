/**
 * Site-wide configuration.
 *
 * Navigation, contact details and metadata defaults live here rather than
 * being scattered through components — changing a phone number should mean
 * editing one file, not grepping the JSX.
 */
export const siteConfig = {
  name: "SIRC",
  shortDescription: "Industrial measurement, testing, inspection & calibration",
  description:
    "Industrial measurement instruments with accredited testing, inspection and calibration services for industry in Bangladesh.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_BD",
  currency: "BDT",
} as const;

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

/**
 * Primary navigation.
 *
 * Every entry must resolve — a menu is a promise, and one that lies is worse
 * than a shorter menu.
 */
export const mainNav: NavItem[] = [
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Corporate", href: "/corporate" },
  { label: "Brands", href: "/brands" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/** Secondary links for the slim utility bar above the masthead. */
export const utilityNav: NavItem[] = [
  { label: "About us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact us", href: "/contact" },
];

/**
 * Footer columns — balanced height across all sections (5-6 items per column).
 */
export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Shop & Catalog",
    items: [
      { label: "All Products", href: "/products" },
      { label: "Partner Brands", href: "/brands" },
      { label: "Special Offers", href: "/products?highlight=sale" },
      { label: "New Arrivals", href: "/products?highlight=new" },
      { label: "In Stock Now", href: "/products?stock=IN_STOCK" },
      { label: "Search Catalogue", href: "/search" },
    ],
  },
  {
    title: "Laboratory & Services",
    items: [
      { label: "All Services", href: "/services" },
      { label: "Calibration Facilities", href: "/services/electrical-calibration" },
      { label: "Industries Served", href: "/industries" },
      { label: "Corporate Supply", href: "/corporate" },
      { label: "Request a Quotation", href: "/rfq" },
      { label: "Knowledge Base", href: "/blog" },
    ],
  },
  {
    title: "Company & Support",
    items: [
      { label: "About SIRC", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Return & Refund Policy", href: "/returns" },
      { label: "Image Credits", href: "/credits" },
    ],
  },
];

/**
 * ⚠️ Placeholder until the business supplies the real details.
 *
 * `whatsapp` must be in full international format with no spaces, plus or
 * leading zeros — that is what wa.me expects, and a number in any other shape
 * silently opens an empty chat rather than failing visibly.
 */
export const contactInfo = {
  phone: "+880 0000 000000",
  whatsapp: "8800000000000",
  email: "info@sirc.com.bd",
  address: "Dhaka, Bangladesh",
  hours: "Sun–Thu, 9:00–18:00",
} as const;

export const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { label: "X", href: "https://x.com", icon: "twitter" },
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
] as const;
