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

/** Footer columns. Same rule as `mainNav`: nothing here may 404. */
export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Shop",
    items: [
      { label: "All products", href: "/products" },
      { label: "Search catalogue", href: "/search" },
      { label: "Special offers", href: "/products?highlight=sale" },
      { label: "New arrivals", href: "/products?highlight=new" },
      { label: "In stock now", href: "/products?stock=IN_STOCK" },
      { label: "Brands", href: "/brands" },
    ],
  },
  {
    title: "Categories",
    items: [
      { label: "Calibration", href: "/category/calibration" },
      { label: "Electrical Tools", href: "/category/electrical-tools" },
      { label: "Temperature", href: "/category/temperature" },
      { label: "Energy", href: "/category/energy" },
      { label: "Fault Testing", href: "/category/fault-testing" },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "All services", href: "/services" },
      { label: "Industries", href: "/industries" },
      { label: "Request a quotation", href: "/rfq" },
      { label: "About us", href: "/about" },
      { label: "Contact us", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Image credits", href: "/credits" },
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
