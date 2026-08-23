// Plan catalogue sourced from fonehouse.co.uk (snapshot: 2026-08-24).
// Prices are GBP. Monthly prices annotated with a rise schedule where Fonehouse
// disclosed one (typical: April 2027 and April 2028 increments).
//
// SCOPE NOTE: Fonehouse renders its full colour/storage/tariff matrix client-side.
// This snapshot is the union of every tariff their SSR emits — the featured deal
// per network on each model page, plus the SIM-only, SIM-free, refurbished and
// special-offer sections. That's ~130 real tariff rows.
//
// The remaining variants (every colour × every storage × every tariff tier)
// need a headless browser to render. See worker/README.md for the Playwright
// crawler that will replace this file and back it with Supabase.

export type Network =
  | "EE"
  | "O2"
  | "Vodafone"
  | "Three"
  | "Talkmobile"
  | "iD Mobile"
  | "Sky Mobile"
  | "Lebara"
  | "SMARTY"
  | "SIM Free"
  | "Unknown";

export type Brand = "Apple" | "Samsung" | "Google" | "Honor" | "Doro" | "Other";

export type PhoneDeal = {
  id: string;
  brand: Brand;
  model: string;
  storageGb: number;
  colour: string;
  network: Network;
  monthly: number;                 // £ / month at contract start
  upfront: number;                 // £ upfront
  contractMonths: number;
  dataGb: number | "unlimited";
  fiveG: boolean;
  minutes: "unlimited" | number;
  texts: "unlimited" | number;
  totalCost?: number;              // £ over the full term
  priceRises?: { from: string; monthly: number }[];
  url: string;                     // relative to https://www.fonehouse.co.uk
  tags?: DealTag[];
};

export type DealTag =
  | "featured"
  | "back-to-school"
  | "free-gift"
  | "upgrade"
  | "fonehouse-recommends"
  | "out-of-stock";

export type PhoneModel = {
  brand: Brand;
  model: string;
  fromMonthly: number;
  simFreeFrom?: number;
  storages: number[];
  colours: string[];
  url: string;
};

export type SimOnlyPlan = {
  id: string;
  network: Network;
  monthly: number;
  contractMonths: number;          // 1 = rolling / 30-day
  dataGb: number | "unlimited";
  fiveG: boolean;
  minutes: "unlimited" | number;
  texts: "unlimited" | number;
  upfront: number;
  cashback?: number;
  priceRises?: { from: string; monthly: number }[];
};

export type SimFreePhone = {
  id: string;
  brand: Brand;
  model: string;
  storageGb?: number;
  colours: string[];
  price: number;
  url: string;
};

export type RefurbPhone = {
  id: string;
  brand: Brand;
  model: string;
  storageGb: number;
  colour: string;
  grade: "Excellent" | "Good" | "Fair";
  simFreePrice: number;
  url: string;
};

const rises = (m27: number, m28: number) => [
  { from: "2027-04-01", monthly: m27 },
  { from: "2028-04-01", monthly: m28 },
];

// ---------------------------------------------------------------------------
//  Contract deals (per-network tariffs Fonehouse promotes for each handset)
// ---------------------------------------------------------------------------

export const phoneDeals: PhoneDeal[] = [
  // ---- iPhone 17 ---------------------------------------------------------
  { id: "iphone-17-256-black-three-100gb",  brand: "Apple", model: "iPhone 17", storageGb: 256, colour: "Black", network: "Three",     monthly: 42.00, upfront: 25,  contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1079, priceRises: rises(44.30, 46.60), url: "/mobile-phone-deals/iphone-17?product-variant=iphone-17-256gb-black" },
  { id: "iphone-17-256-black-three-400gb",  brand: "Apple", model: "iPhone 17", storageGb: 256, colour: "Black", network: "Three",     monthly: 44.00, upfront: 29,  contractMonths: 24, dataGb: 400,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1135, priceRises: rises(46.50, 49.00), url: "/mobile-phone-deals/iphone-17?product-variant=iphone-17-256gb-black" },
  { id: "iphone-17-256-black-voda",         brand: "Apple", model: "iPhone 17", storageGb: 256, colour: "Black", network: "Vodafone",  monthly: 31.95, upfront: 345, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1111.8, url: "/mobile-phone-deals/iphone-17?product-variant=iphone-17-256gb-black" },
  { id: "iphone-17-256-black-voda-btos",    brand: "Apple", model: "iPhone 17", storageGb: 256, colour: "Black", network: "Vodafone",  monthly: 42.00, upfront: 45,  contractMonths: 24, dataGb: 200,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1103, url: "/mobile-phone-deals/iphone-17?product-variant=iphone-17-256gb-black", tags: ["back-to-school"] },

  // ---- iPhone 17 Pro ----------------------------------------------------
  { id: "iphone-17pro-256-silver-three-100gb", brand: "Apple", model: "iPhone 17 Pro", storageGb: 256, colour: "Silver", network: "Three",    monthly: 54.00, upfront: 45,  contractMonths: 24, dataGb: 100,       fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1387, priceRises: rises(56.30, 58.60), url: "/mobile-phone-deals/iphone-17-pro?product-variant=iphone-17-pro-256gb-silver", tags: ["back-to-school", "fonehouse-recommends"] },
  { id: "iphone-17pro-256-silver-three-unl",   brand: "Apple", model: "iPhone 17 Pro", storageGb: 256, colour: "Silver", network: "Three",    monthly: 59.00, upfront: 49,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1515, priceRises: rises(61.50, 64.00), url: "/mobile-phone-deals/iphone-17-pro?product-variant=iphone-17-pro-256gb-silver" },
  { id: "iphone-17pro-256-silver-tm",          brand: "Apple", model: "iPhone 17 Pro", storageGb: 256, colour: "Silver", network: "Talkmobile", monthly: 31.95, upfront: 599, contractMonths: 24, dataGb: 100,     fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1365.80, url: "/mobile-phone-deals/iphone-17-pro?product-variant=iphone-17-pro-256gb-silver" },
  { id: "iphone-17pro-512-silver-three-100gb", brand: "Apple", model: "iPhone 17 Pro", storageGb: 512, colour: "Silver", network: "Three",    monthly: 54.00, upfront: 45,  contractMonths: 24, dataGb: 100,       fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1387, priceRises: rises(56.30, 58.60), url: "/mobile-phone-deals/iphone-17-pro?product-variant=iphone-17-pro-512gb-silver" },

  // ---- iPhone 17 Pro Max ------------------------------------------------
  { id: "iphone-17-pm-256-cosmic-three", brand: "Apple", model: "iPhone 17 Pro Max", storageGb: 256, colour: "Cosmic Orange", network: "Three",    monthly: 65.00, upfront: 45, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1651, priceRises: rises(67.30, 69.60), url: "/mobile-phone-deals/iphone-17-pro-max?product-variant=iphone-17-pro-max-256gb-cosmic-orange" },
  { id: "iphone-17-pm-256-cosmic-voda",  brand: "Apple", model: "iPhone 17 Pro Max", storageGb: 256, colour: "Cosmic Orange", network: "Vodafone", monthly: 64.00, upfront: 89, contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1675, priceRises: rises(66.50, 69.00), url: "/mobile-phone-deals/iphone-17-pro-max?product-variant=iphone-17-pro-max-256gb-cosmic-orange" },
  { id: "iphone-17-pm-256-silver-voda-btos", brand: "Apple", model: "iPhone 17 Pro Max", storageGb: 256, colour: "Silver", network: "Vodafone", monthly: 58.00, upfront: 129, contractMonths: 24, dataGb: 400,      fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1571, url: "/mobile-phone-deals/iphone-17-pro-max?product-variant=iphone-17-pro-max-256gb-silver", tags: ["back-to-school"] },

  // ---- iPhone 17e (three colours, three networks) -----------------------
  ...(["Black", "Soft Pink", "White"].flatMap<PhoneDeal>((c) => [
    { id: `iphone-17e-256-${c.toLowerCase().replace(" ","-")}-three`, brand: "Apple", model: "iPhone 17e", storageGb: 256, colour: c, network: "Three",     monthly: 33.00, upfront: 25,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 863, priceRises: rises(35.30, 37.60), url: `/mobile-phone-deals/iphone-17-e?product-variant=iphone-17-e-256gb-${c.toLowerCase().replace(" ","-")}` },
    { id: `iphone-17e-256-${c.toLowerCase().replace(" ","-")}-voda`,  brand: "Apple", model: "iPhone 17e", storageGb: 256, colour: c, network: "Vodafone",  monthly: 32.00, upfront: 19,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 837, priceRises: rises(34.50, 37.00), url: `/mobile-phone-deals/iphone-17-e?product-variant=iphone-17-e-256gb-${c.toLowerCase().replace(" ","-")}` },
    { id: `iphone-17e-256-${c.toLowerCase().replace(" ","-")}-tm`,    brand: "Apple", model: "iPhone 17e", storageGb: 256, colour: c, network: "Talkmobile", monthly: 31.95, upfront: 109, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 875.80, url: `/mobile-phone-deals/iphone-17-e?product-variant=iphone-17-e-256gb-${c.toLowerCase().replace(" ","-")}` },
  ])),

  // ---- iPhone Air --------------------------------------------------------
  { id: "iphone-air-256-black-three", brand: "Apple", model: "iPhone Air", storageGb: 256, colour: "Space Black", network: "Three",     monthly: 45.00, upfront: 19,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1145, priceRises: rises(47.30, 49.60), url: "/mobile-phone-deals/iphone-air?product-variant=iphone-air-256gb-space-black" },
  { id: "iphone-air-256-black-voda",  brand: "Apple", model: "iPhone Air", storageGb: 256, colour: "Space Black", network: "Vodafone",  monthly: 44.00, upfront: 19,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1125, priceRises: rises(46.50, 49.00), url: "/mobile-phone-deals/iphone-air?product-variant=iphone-air-256gb-space-black" },
  { id: "iphone-air-256-black-tm",    brand: "Apple", model: "iPhone Air", storageGb: 256, colour: "Space Black", network: "Talkmobile", monthly: 31.95, upfront: 199, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 965.80, url: "/mobile-phone-deals/iphone-air?product-variant=iphone-air-256gb-space-black" },

  // ---- iPhone 16 ---------------------------------------------------------
  { id: "iphone-16-128-black-three-unl", brand: "Apple", model: "iPhone 16", storageGb: 128, colour: "Black", network: "Three",     monthly: 36.00, upfront: 25,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 935, priceRises: rises(38.30, 40.60), url: "/mobile-phone-deals/iphone-16?product-variant=iphone-16-128gb-black" },
  { id: "iphone-16-128-black-three-100", brand: "Apple", model: "iPhone 16", storageGb: 128, colour: "Black", network: "Three",     monthly: 35.00, upfront: 45,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 931, priceRises: rises(37.30, 39.60), url: "/mobile-phone-deals/iphone-16?product-variant=iphone-16-128gb-black" },
  { id: "iphone-16-128-black-voda",      brand: "Apple", model: "iPhone 16", storageGb: 128, colour: "Black", network: "Vodafone",  monthly: 35.00, upfront: 39,  contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 929, priceRises: rises(37.50, 40.00), url: "/mobile-phone-deals/iphone-16?product-variant=iphone-16-128gb-black" },
  { id: "iphone-16-128-black-tm",        brand: "Apple", model: "iPhone 16", storageGb: 128, colour: "Black", network: "Talkmobile", monthly: 31.95, upfront: 179, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 945.80, url: "/mobile-phone-deals/iphone-16?product-variant=iphone-16-128gb-black" },

  // ---- iPhone 16e --------------------------------------------------------
  { id: "iphone-16e-128-black-three", brand: "Apple", model: "iPhone 16e", storageGb: 128, colour: "Black", network: "Three",    monthly: 26.00, upfront: 19,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 693,    priceRises: rises(28.50, 31.00), url: "/mobile-phone-deals/iphone-16e?product-variant=iphone-16e-128gb-black" },
  { id: "iphone-16e-128-black-voda",  brand: "Apple", model: "iPhone 16e", storageGb: 128, colour: "Black", network: "Vodafone", monthly: 25.95, upfront: 25,  contractMonths: 24, dataGb: 30,  fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 647.80, url: "/mobile-phone-deals/iphone-16e?product-variant=iphone-16e-128gb-black" },

  // ---- iPhone 15 ---------------------------------------------------------
  { id: "iphone-15-128-black-three",     brand: "Apple", model: "iPhone 15", storageGb: 128, colour: "Black", network: "Three",     monthly: 31.00, upfront: 19, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 809, priceRises: rises(33.30, 35.60), url: "/mobile-phone-deals/iphone-15?product-variant=iphone-15-128gb-black" },
  { id: "iphone-15-128-black-voda",      brand: "Apple", model: "iPhone 15", storageGb: 128, colour: "Black", network: "Vodafone",  monthly: 30.00, upfront: 19, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 789, priceRises: rises(32.50, 35.00), url: "/mobile-phone-deals/iphone-15?product-variant=iphone-15-128gb-black" },
  { id: "iphone-15-128-black-tm",        brand: "Apple", model: "iPhone 15", storageGb: 128, colour: "Black", network: "Talkmobile", monthly: 31.95, upfront: 95, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 861.80, url: "/mobile-phone-deals/iphone-15?product-variant=iphone-15-128gb-black" },
  { id: "iphone-15-128-blue-voda-btos",  brand: "Apple", model: "iPhone 15", storageGb: 128, colour: "Blue",  network: "Vodafone",  monthly: 30.00, upfront: 19, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 789, priceRises: rises(32.50, 35.00), url: "/mobile-phone-deals/iphone-15?product-variant=iphone-15-128gb-blue", tags: ["back-to-school"] },

  // ---- iPhone 13 5G ------------------------------------------------------
  { id: "iphone-13-5g-128-star-three-300", brand: "Apple", model: "iPhone 13 5G", storageGb: 128, colour: "Starlight", network: "Three", monthly: 27.00, upfront: 0,  contractMonths: 24, dataGb: 300, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 694, priceRises: rises(29.30, 31.60), url: "/mobile-phone-deals/iphone-13-5g?product-variant=iphone-13-5g-128gb-starlight", tags: ["back-to-school", "fonehouse-recommends"] },
  { id: "iphone-13-5g-128-star-three-100", brand: "Apple", model: "iPhone 13 5G", storageGb: 128, colour: "Starlight", network: "Three", monthly: 25.00, upfront: 19, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 669, priceRises: rises(27.50, 30.00), url: "/mobile-phone-deals/iphone-13-5g?product-variant=iphone-13-5g-128gb-starlight" },
  { id: "iphone-13-5g-128-star-three-15",  brand: "Apple", model: "iPhone 13 5G", storageGb: 128, colour: "Starlight", network: "Three", monthly: 23.95, upfront: 45, contractMonths: 24, dataGb: 15,  fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 619.80, url: "/mobile-phone-deals/iphone-13-5g?product-variant=iphone-13-5g-128gb-starlight" },

  // ---- Samsung Galaxy S26 Ultra -----------------------------------------
  { id: "s26-ultra-256-black-three-unl", brand: "Samsung", model: "Galaxy S26 Ultra", storageGb: 256, colour: "Black", network: "Three",     monthly: 46.00, upfront: 39,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1189, priceRises: rises(48.30, 50.60), url: "/mobile-phone-deals/samsung-galaxy-s26-ultra?product-variant=samsung-galaxy-s26-ultra-256gb-black" },
  { id: "s26-ultra-256-black-three-200", brand: "Samsung", model: "Galaxy S26 Ultra", storageGb: 256, colour: "Black", network: "Three",     monthly: 45.00, upfront: 39,  contractMonths: 24, dataGb: 200,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1169, priceRises: rises(47.50, 50.00), url: "/mobile-phone-deals/samsung-galaxy-s26-ultra?product-variant=samsung-galaxy-s26-ultra-256gb-black" },
  { id: "s26-ultra-256-black-three-100", brand: "Samsung", model: "Galaxy S26 Ultra", storageGb: 256, colour: "Black", network: "Three",     monthly: 31.95, upfront: 349, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1115.80, url: "/mobile-phone-deals/samsung-galaxy-s26-ultra?product-variant=samsung-galaxy-s26-ultra-256gb-black" },

  // ---- Samsung Galaxy S26 -----------------------------------------------
  { id: "s26-256-black-three",    brand: "Samsung", model: "Galaxy S26", storageGb: 256, colour: "Black", network: "Three",    monthly: 38.00, upfront: 29, contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 987, priceRises: rises(40.30, 42.60), url: "/mobile-phone-deals/samsung-galaxy-s26?product-variant=samsung-galaxy-s26-256gb-black" },
  { id: "s26-256-black-voda-btos", brand: "Samsung", model: "Galaxy S26", storageGb: 256, colour: "Black", network: "Vodafone", monthly: 36.00, upfront: 25, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 939, priceRises: rises(38.50, 41.00), url: "/mobile-phone-deals/samsung-galaxy-s26?product-variant=samsung-galaxy-s26-256gb-black", tags: ["back-to-school"] },

  // ---- Samsung Galaxy S26+ ----------------------------------------------
  { id: "s26plus-256-black-three", brand: "Samsung", model: "Galaxy S26+", storageGb: 256, colour: "Black", network: "Three",    monthly: 47.00, upfront: 35, contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1209, priceRises: rises(49.30, 51.60), url: "/mobile-phone-deals/samsung-galaxy-s26-plus?product-variant=samsung-galaxy-s26-plus-256gb-black" },
  { id: "s26plus-256-black-voda",  brand: "Samsung", model: "Galaxy S26+", storageGb: 256, colour: "Black", network: "Vodafone", monthly: 46.00, upfront: 25, contractMonths: 24, dataGb: 200,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1179, priceRises: rises(48.50, 51.00), url: "/mobile-phone-deals/samsung-galaxy-s26-plus?product-variant=samsung-galaxy-s26-plus-256gb-black" },

  // ---- Samsung Galaxy S25 -----------------------------------------------
  { id: "s25-128-icyblue-three-unl", brand: "Samsung", model: "Galaxy S25", storageGb: 128, colour: "Icy Blue", network: "Three", monthly: 33.00, upfront: 9,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 847, priceRises: rises(35.30, 37.60), url: "/mobile-phone-deals/samsung-galaxy-s25?product-variant=samsung-galaxy-s25-128gb-icy-blue" },
  { id: "s25-128-icyblue-three-100", brand: "Samsung", model: "Galaxy S25", storageGb: 128, colour: "Icy Blue", network: "Three", monthly: 28.00, upfront: 19, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 741, priceRises: rises(30.50, 33.00), url: "/mobile-phone-deals/samsung-galaxy-s25?product-variant=samsung-galaxy-s25-128gb-icy-blue" },
  { id: "s25-128-icyblue-three-tm",  brand: "Samsung", model: "Galaxy S25", storageGb: 128, colour: "Icy Blue", network: "Three", monthly: 25.95, upfront: 39, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 661.80, url: "/mobile-phone-deals/samsung-galaxy-s25?product-variant=samsung-galaxy-s25-128gb-icy-blue" },
  { id: "s25-128-silver-three-btos", brand: "Samsung", model: "Galaxy S25", storageGb: 128, colour: "Silver Shadow", network: "Three", monthly: 28.00, upfront: 19, contractMonths: 24, dataGb: 300, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 737, url: "/mobile-phone-deals/samsung-galaxy-s25?product-variant=samsung-galaxy-s25-128gb-silver-shadow", tags: ["back-to-school", "free-gift"] },

  // ---- Samsung Galaxy S25 FE --------------------------------------------
  { id: "s25fe-128-jet-three-300", brand: "Samsung", model: "Galaxy S25 FE", storageGb: 128, colour: "Jet Black", network: "Three", monthly: 28.00, upfront: 0, contractMonths: 24, dataGb: 300, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 718, priceRises: rises(30.30, 32.60), url: "/mobile-phone-deals/samsung-galaxy-s25-fe?product-variant=samsung-galaxy-s25-fe-128gb-jetblack", tags: ["free-gift"] },
  { id: "s25fe-128-jet-three-100", brand: "Samsung", model: "Galaxy S25 FE", storageGb: 128, colour: "Jet Black", network: "Three", monthly: 27.00, upfront: 0, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 698, priceRises: rises(29.50, 32.00), url: "/mobile-phone-deals/samsung-galaxy-s25-fe?product-variant=samsung-galaxy-s25-fe-128gb-jetblack" },
  { id: "s25fe-128-jet-three-30",  brand: "Samsung", model: "Galaxy S25 FE", storageGb: 128, colour: "Jet Black", network: "Three", monthly: 29.95, upfront: 9, contractMonths: 24, dataGb: 30,  fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 727.80, url: "/mobile-phone-deals/samsung-galaxy-s25-fe?product-variant=samsung-galaxy-s25-fe-128gb-jetblack" },

  // ---- Samsung Galaxy A17 5G --------------------------------------------
  { id: "a17-5g-128-black-three", brand: "Samsung", model: "Galaxy A17 5G", storageGb: 128, colour: "Black", network: "Three",     monthly: 12.00, upfront: 0, contractMonths: 24, dataGb: 300, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 334,    priceRises: rises(14.30, 16.60), url: "/mobile-phone-deals/samsung-galaxy-a17?product-variant=samsung-galaxy-a17-5g-128gb-black" },
  { id: "a17-5g-128-black-voda",  brand: "Samsung", model: "Galaxy A17 5G", storageGb: 128, colour: "Black", network: "Vodafone",  monthly: 14.00, upfront: 0, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 386,    priceRises: rises(16.50, 19.00), url: "/mobile-phone-deals/samsung-galaxy-a17?product-variant=samsung-galaxy-a17-5g-128gb-black", tags: ["back-to-school"] },
  { id: "a17-5g-128-black-tm",    brand: "Samsung", model: "Galaxy A17 5G", storageGb: 128, colour: "Black", network: "Talkmobile", monthly: 13.95, upfront: 0, contractMonths: 24, dataGb: 15,  fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 334.80, url: "/mobile-phone-deals/samsung-galaxy-a17?product-variant=samsung-galaxy-a17-5g-128gb-black" },

  // ---- Samsung Galaxy A17 4G --------------------------------------------
  { id: "a17-4g-128-black-voda",  brand: "Samsung", model: "Galaxy A17 4G", storageGb: 128, colour: "Black", network: "Vodafone",  monthly: 13.00, upfront: 0, contractMonths: 24, dataGb: 100, fiveG: false, minutes: "unlimited", texts: "unlimited", totalCost: 362,    priceRises: rises(15.50, 18.00), url: "/mobile-phone-deals/samsung-galaxy-a17-4g?product-variant=samsung-galaxy-a17-4g-128gb-black" },
  { id: "a17-4g-128-black-tm",    brand: "Samsung", model: "Galaxy A17 4G", storageGb: 128, colour: "Black", network: "Talkmobile", monthly: 13.95, upfront: 0, contractMonths: 24, dataGb: 15,  fiveG: false, minutes: "unlimited", texts: "unlimited", totalCost: 334.80, url: "/mobile-phone-deals/samsung-galaxy-a17-4g?product-variant=samsung-galaxy-a17-4g-128gb-black" },

  // ---- Samsung Galaxy A26 -----------------------------------------------
  { id: "a26-256-black-three", brand: "Samsung", model: "Galaxy A26", storageGb: 256, colour: "Black", network: "Three",    monthly: 17.00, upfront: 0, contractMonths: 24, dataGb: 400, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 458,    priceRises: rises(19.50, 22.00), url: "/mobile-phone-deals/samsung-galaxy-a26?product-variant=samsung-galaxy-a26-256gb-black" },
  { id: "a26-256-black-voda",  brand: "Samsung", model: "Galaxy A26", storageGb: 256, colour: "Black", network: "Vodafone", monthly: 17.95, upfront: 9, contractMonths: 24, dataGb: 15,  fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 439.80, url: "/mobile-phone-deals/samsung-galaxy-a26?product-variant=samsung-galaxy-a26-256gb-black" },

  // ---- Samsung Galaxy A27 -----------------------------------------------
  { id: "a27-128-black-three", brand: "Samsung", model: "Galaxy A27", storageGb: 128, colour: "Black", network: "Three",    monthly: 17.00, upfront: 0,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 454,    priceRises: rises(19.30, 21.60), url: "/mobile-phone-deals/samsung-galaxy-a-27?product-variant=samsung-galaxy-a-27-128gb-black" },
  { id: "a27-128-black-voda",  brand: "Samsung", model: "Galaxy A27", storageGb: 128, colour: "Black", network: "Vodafone", monthly: 17.00, upfront: 0,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 458,    priceRises: rises(19.50, 22.00), url: "/mobile-phone-deals/samsung-galaxy-a-27?product-variant=samsung-galaxy-a-27-128gb-black" },
  { id: "a27-128-black-tm",    brand: "Samsung", model: "Galaxy A27", storageGb: 128, colour: "Black", network: "Talkmobile", monthly: 14.95, upfront: 19, contractMonths: 24, dataGb: 30,  fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 377.80, url: "/mobile-phone-deals/samsung-galaxy-a-27?product-variant=samsung-galaxy-a-27-128gb-black" },

  // ---- Samsung Galaxy A37 -----------------------------------------------
  { id: "a37-256-char-three-0",  brand: "Samsung", model: "Galaxy A37", storageGb: 256, colour: "Awesome Charcoal", network: "Three", monthly: 26.00, upfront: 0,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 670, priceRises: rises(28.30, 30.60), url: "/mobile-phone-deals/samsung-galaxy-a37?product-variant=samsung-galaxy-a37-256gb-awesome-charcoal", tags: ["fonehouse-recommends"] },
  { id: "a37-256-char-three-19", brand: "Samsung", model: "Galaxy A37", storageGb: 256, colour: "Awesome Charcoal", network: "Three", monthly: 24.00, upfront: 19, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 645, priceRises: rises(26.50, 29.00), url: "/mobile-phone-deals/samsung-galaxy-a37?product-variant=samsung-galaxy-a37-256gb-awesome-charcoal" },

  // ---- Samsung Galaxy A57 -----------------------------------------------
  { id: "a57-256-navy-three", brand: "Samsung", model: "Galaxy A57", storageGb: 256, colour: "Awesome Navy", network: "Three",    monthly: 29.00, upfront: 0,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 742, priceRises: rises(31.30, 33.60), url: "/mobile-phone-deals/samsung-galaxy-a57?product-variant=samsung-galaxy-a57-256gb-awesome-navy" },
  { id: "a57-256-navy-voda",  brand: "Samsung", model: "Galaxy A57", storageGb: 256, colour: "Awesome Navy", network: "Vodafone", monthly: 25.00, upfront: 19, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 669, priceRises: rises(27.50, 30.00), url: "/mobile-phone-deals/samsung-galaxy-a57?product-variant=samsung-galaxy-a57-256gb-awesome-navy" },

  // ---- Samsung Galaxy Z Flip8 -------------------------------------------
  { id: "zflip8-256-pink-three", brand: "Samsung", model: "Galaxy Z Flip8", storageGb: 256, colour: "Pink", network: "Three",    monthly: 58.00, upfront: 49,  contractMonths: 24, dataGb: 100,         fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1487, priceRises: rises(60.30, 62.60), url: "/mobile-phone-deals/samsung-galaxy-z-flip-8?product-variant=samsung-galaxy-z-flip-8-256gb-pink" },
  { id: "zflip8-256-pink-voda",  brand: "Samsung", model: "Galaxy Z Flip8", storageGb: 256, colour: "Pink", network: "Vodafone", monthly: 61.00, upfront: 39,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1553, priceRises: rises(63.50, 66.00), url: "/mobile-phone-deals/samsung-galaxy-z-flip-8?product-variant=samsung-galaxy-z-flip-8-256gb-pink" },
  { id: "zflip8-256-pink-tm",    brand: "Samsung", model: "Galaxy Z Flip8", storageGb: 256, colour: "Pink", network: "Talkmobile", monthly: 31.95, upfront: 615, contractMonths: 24, dataGb: 100,       fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1381.80, url: "/mobile-phone-deals/samsung-galaxy-z-flip-8?product-variant=samsung-galaxy-z-flip-8-256gb-pink" },

  // ---- Samsung Galaxy Z Flip7 -------------------------------------------
  { id: "zflip7-256-jet-three", brand: "Samsung", model: "Galaxy Z Flip7", storageGb: 256, colour: "Jet Black", network: "Three",     monthly: 41.00, upfront: 39,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1069, priceRises: rises(43.30, 45.60), url: "/mobile-phone-deals/samsung-galaxy-z-flip7?product-variant=samsung-galaxy-z-flip7-256gb-jet-black" },
  { id: "zflip7-256-jet-voda",  brand: "Samsung", model: "Galaxy Z Flip7", storageGb: 256, colour: "Jet Black", network: "Vodafone",  monthly: 39.00, upfront: 39,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1025, priceRises: rises(41.50, 44.00), url: "/mobile-phone-deals/samsung-galaxy-z-flip7?product-variant=samsung-galaxy-z-flip7-256gb-jet-black" },
  { id: "zflip7-256-jet-tm",    brand: "Samsung", model: "Galaxy Z Flip7", storageGb: 256, colour: "Jet Black", network: "Talkmobile", monthly: 31.95, upfront: 129, contractMonths: 24, dataGb: 100,       fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 895.80, url: "/mobile-phone-deals/samsung-galaxy-z-flip7?product-variant=samsung-galaxy-z-flip7-256gb-jet-black" },

  // ---- Samsung Galaxy Z Flip7 FE ----------------------------------------
  { id: "zflip7fe-128-white-three", brand: "Samsung", model: "Galaxy Z Flip7 FE", storageGb: 128, colour: "White", network: "Three",     monthly: 32.00, upfront: 25, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 839, priceRises: rises(34.30, 36.60), url: "/mobile-phone-deals/samsung-galaxy-z-flip7-fe?product-variant=samsung-galaxy-z-flip7-fe-128gb-white" },
  { id: "zflip7fe-128-white-voda",  brand: "Samsung", model: "Galaxy Z Flip7 FE", storageGb: 128, colour: "White", network: "Vodafone",  monthly: 29.00, upfront: 19, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 765, priceRises: rises(31.50, 34.00), url: "/mobile-phone-deals/samsung-galaxy-z-flip7-fe?product-variant=samsung-galaxy-z-flip7-fe-128gb-white" },
  { id: "zflip7fe-128-white-tm",    brand: "Samsung", model: "Galaxy Z Flip7 FE", storageGb: 128, colour: "White", network: "Talkmobile", monthly: 27.95, upfront: 35, contractMonths: 24, dataGb: 15,  fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 705.80, url: "/mobile-phone-deals/samsung-galaxy-z-flip7-fe?product-variant=samsung-galaxy-z-flip7-fe-128gb-white" },

  // ---- Google Pixel 10 --------------------------------------------------
  { id: "pixel-10-128-obs-three", brand: "Google", model: "Pixel 10", storageGb: 128, colour: "Obsidian", network: "Three",     monthly: 26.00, upfront: 0,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 670, priceRises: rises(28.30, 30.60), url: "/mobile-phone-deals/google-pixel-10?product-variant=google-pixel-10-128gb-obsidian" },
  { id: "pixel-10-128-obs-voda",  brand: "Google", model: "Pixel 10", storageGb: 128, colour: "Obsidian", network: "Vodafone",  monthly: 25.00, upfront: 0,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 650, priceRises: rises(27.50, 30.00), url: "/mobile-phone-deals/google-pixel-10?product-variant=google-pixel-10-128gb-obsidian", tags: ["back-to-school", "fonehouse-recommends"] },
  { id: "pixel-10-128-obs-tm",    brand: "Google", model: "Pixel 10", storageGb: 128, colour: "Obsidian", network: "Talkmobile", monthly: 25.95, upfront: 15, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 637.80, url: "/mobile-phone-deals/google-pixel-10?product-variant=google-pixel-10-128gb-obsidian" },

  // ---- Google Pixel 10 Pro ----------------------------------------------
  { id: "pixel-10-pro-128-obs-three",     brand: "Google", model: "Pixel 10 Pro", storageGb: 128, colour: "Obsidian", network: "Three",     monthly: 31.00, upfront: 0,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 790, priceRises: rises(33.30, 35.60), url: "/mobile-phone-deals/google-pixel-10-pro?product-variant=google-pixel-10-pro-128gb-obsidian" },
  { id: "pixel-10-pro-128-obs-voda-30",   brand: "Google", model: "Pixel 10 Pro", storageGb: 128, colour: "Obsidian", network: "Vodafone",  monthly: 30.00, upfront: 19, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 789, priceRises: rises(32.50, 35.00), url: "/mobile-phone-deals/google-pixel-10-pro?product-variant=google-pixel-10-pro-128gb-obsidian", tags: ["back-to-school"] },
  { id: "pixel-10-pro-128-obs-voda-33",   brand: "Google", model: "Pixel 10 Pro", storageGb: 128, colour: "Obsidian", network: "Vodafone",  monthly: 33.00, upfront: 19, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 861, priceRises: rises(35.50, 38.00), url: "/mobile-phone-deals/google-pixel-10-pro?product-variant=google-pixel-10-pro-128gb-obsidian", tags: ["back-to-school"] },
  { id: "pixel-10-pro-128-obs-tm",        brand: "Google", model: "Pixel 10 Pro", storageGb: 128, colour: "Obsidian", network: "Talkmobile", monthly: 31.95, upfront: 45, contractMonths: 24, dataGb: 100,        fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 811.80, url: "/mobile-phone-deals/google-pixel-10-pro?product-variant=google-pixel-10-pro-128gb-obsidian" },

  // ---- Google Pixel 10 Pro XL -------------------------------------------
  { id: "pixel-10-pro-xl-256-obs-three-100", brand: "Google", model: "Pixel 10 Pro XL", storageGb: 256, colour: "Obsidian", network: "Three",    monthly: 37.00, upfront: 49, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 983, priceRises: rises(39.30, 41.60), url: "/mobile-phone-deals/google-pixel-10-pro-xl?product-variant=google-pixel-10-pro-xl-256gb-obsidian" },
  { id: "pixel-10-pro-xl-256-obs-three-unl", brand: "Google", model: "Pixel 10 Pro XL", storageGb: 256, colour: "Obsidian", network: "Three",    monthly: 37.00, upfront: 49, contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 987, priceRises: rises(39.50, 42.00), url: "/mobile-phone-deals/google-pixel-10-pro-xl?product-variant=google-pixel-10-pro-xl-256gb-obsidian" },
  { id: "pixel-10-pro-xl-256-obs-tm",        brand: "Google", model: "Pixel 10 Pro XL", storageGb: 256, colour: "Obsidian", network: "Talkmobile", monthly: 31.95, upfront: 99, contractMonths: 24, dataGb: 100,      fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 865.80, url: "/mobile-phone-deals/google-pixel-10-pro-xl?product-variant=google-pixel-10-pro-xl-256gb-obsidian" },

  // ---- Google Pixel 10a -------------------------------------------------
  { id: "pixel-10a-128-obs-three", brand: "Google", model: "Pixel 10a", storageGb: 128, colour: "Obsidian", network: "Three",     monthly: 24.00, upfront: 0,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 622,    priceRises: rises(26.30, 28.60), url: "/mobile-phone-deals/google-pixel-10a?product-variant=google-pixel-10a-128gb-obsidian" },
  { id: "pixel-10a-128-obs-voda",  brand: "Google", model: "Pixel 10a", storageGb: 128, colour: "Obsidian", network: "Vodafone",  monthly: 24.00, upfront: 0,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 626,    priceRises: rises(26.50, 29.00), url: "/mobile-phone-deals/google-pixel-10a?product-variant=google-pixel-10a-128gb-obsidian" },
  { id: "pixel-10a-128-obs-tm",    brand: "Google", model: "Pixel 10a", storageGb: 128, colour: "Obsidian", network: "Talkmobile", monthly: 31.95, upfront: 65, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 831.80, url: "/mobile-phone-deals/google-pixel-10a?product-variant=google-pixel-10a-128gb-obsidian" },

  // ---- Google Pixel 9a --------------------------------------------------
  { id: "pixel-9a-128-obs-three-100", brand: "Google", model: "Pixel 9a", storageGb: 128, colour: "Obsidian", network: "Three", monthly: 19.00, upfront: 0,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 502, priceRises: rises(21.30, 23.60), url: "/mobile-phone-deals/google-pixel-9a?product-variant=google-pixel-9a-128gb-obsidian" },
  { id: "pixel-9a-128-obs-three-400", brand: "Google", model: "Pixel 9a", storageGb: 128, colour: "Obsidian", network: "Three", monthly: 19.00, upfront: 0,  contractMonths: 24, dataGb: 400, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 506, priceRises: rises(21.50, 24.00), url: "/mobile-phone-deals/google-pixel-9a?product-variant=google-pixel-9a-128gb-obsidian" },
  { id: "pixel-9a-128-obs-three-30",  brand: "Google", model: "Pixel 9a", storageGb: 128, colour: "Obsidian", network: "Three", monthly: 16.95, upfront: 19, contractMonths: 24, dataGb: 30,  fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 425.80, url: "/mobile-phone-deals/google-pixel-9a?product-variant=google-pixel-9a-128gb-obsidian" },

  // ---- Google Pixel 11 --------------------------------------------------
  { id: "pixel-11-256-hib-three", brand: "Google", model: "Pixel 11", storageGb: 256, colour: "Hibiscus", network: "Three",    monthly: 48.00, upfront: 29,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1227,    priceRises: rises(50.30, 52.60), url: "/mobile-phone-deals/google-pixel-11?product-variant=google-pixel-11-256gb-hibiscus" },
  { id: "pixel-11-256-hib-voda",  brand: "Google", model: "Pixel 11", storageGb: 256, colour: "Hibiscus", network: "Vodafone", monthly: 47.00, upfront: 15,  contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1193,    priceRises: rises(49.50, 52.00), url: "/mobile-phone-deals/google-pixel-11?product-variant=google-pixel-11-256gb-hibiscus" },
  { id: "pixel-11-256-hib-tm",    brand: "Google", model: "Pixel 11", storageGb: 256, colour: "Hibiscus", network: "Talkmobile", monthly: 31.95, upfront: 339, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1105.80, url: "/mobile-phone-deals/google-pixel-11?product-variant=google-pixel-11-256gb-hibiscus" },

  // ---- Google Pixel 11 Pro ----------------------------------------------
  { id: "pixel-11-pro-256-olive-voda", brand: "Google", model: "Pixel 11 Pro", storageGb: 256, colour: "Olive", network: "Vodafone",  monthly: 59.00, upfront: 39,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1505,    priceRises: rises(61.50, 64.00), url: "/mobile-phone-deals/google-pixel-11-pro?product-variant=google-pixel-11-pro-256gb-olive", tags: ["out-of-stock"] },
  { id: "pixel-11-pro-256-olive-tm",   brand: "Google", model: "Pixel 11 Pro", storageGb: 256, colour: "Olive", network: "Talkmobile", monthly: 31.95, upfront: 539, contractMonths: 24, dataGb: 100,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1305.80, url: "/mobile-phone-deals/google-pixel-11-pro?product-variant=google-pixel-11-pro-256gb-olive", tags: ["out-of-stock"] },

  // ---- Google Pixel 11 Pro XL -------------------------------------------
  { id: "pixel-11-pro-xl-256-obs-three", brand: "Google", model: "Pixel 11 Pro XL", storageGb: 256, colour: "Obsidian", network: "Three",     monthly: 67.00, upfront: 89,  contractMonths: 24, dataGb: "unlimited", fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1743,    priceRises: rises(69.30, 71.60), url: "/mobile-phone-deals/google-pixel-11-pro-xl?product-variant=google-pixel-11-pro-xl-256gb-obsidian" },
  { id: "pixel-11-pro-xl-256-obs-voda",  brand: "Google", model: "Pixel 11 Pro XL", storageGb: 256, colour: "Obsidian", network: "Vodafone",  monthly: 68.00, upfront: 45,  contractMonths: 24, dataGb: 400,          fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1727,    priceRises: rises(70.50, 73.00), url: "/mobile-phone-deals/google-pixel-11-pro-xl?product-variant=google-pixel-11-pro-xl-256gb-obsidian" },
  { id: "pixel-11-pro-xl-256-obs-tm",    brand: "Google", model: "Pixel 11 Pro XL", storageGb: 256, colour: "Obsidian", network: "Talkmobile", monthly: 31.95, upfront: 729, contractMonths: 24, dataGb: 100,        fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 1495.80, url: "/mobile-phone-deals/google-pixel-11-pro-xl?product-variant=google-pixel-11-pro-xl-256gb-obsidian" },

  // ---- Honor 600 Pro (only surfaced via offers page) --------------------
  { id: "honor-600-pro-512-black-voda-btos", brand: "Honor", model: "Honor 600 Pro", storageGb: 512, colour: "Black", network: "Vodafone", monthly: 38.00, upfront: 25, contractMonths: 24, dataGb: 100, fiveG: true, minutes: "unlimited", texts: "unlimited", totalCost: 987, url: "/mobile-phone-deals/honor-600-pro?product-variant=honor-600-pro-512gb-black", tags: ["back-to-school"] },
];

// ---------------------------------------------------------------------------
//  Model catalogue (drill into `url` for the full variant grid)
// ---------------------------------------------------------------------------

export const phoneModels: PhoneModel[] = [
  // Apple
  { brand: "Apple", model: "iPhone 17",         fromMonthly: 38.00, simFreeFrom: 999,  storages: [256],       colours: ["Black","White","Mist Blue","Lavender","Sage"],   url: "/mobile-phone-deals/iphone-17" },
  { brand: "Apple", model: "iPhone 17 Pro",     fromMonthly: 52.00, simFreeFrom: 1099, storages: [256, 512],  colours: ["Silver","Cosmic Orange","Deep Blue"],           url: "/mobile-phone-deals/iphone-17-pro" },
  { brand: "Apple", model: "iPhone 17 Pro Max", fromMonthly: 57.00,                    storages: [256, 512, 1024, 2048], colours: ["Silver","Cosmic Orange","Deep Blue"], url: "/mobile-phone-deals/iphone-17-pro-max" },
  { brand: "Apple", model: "iPhone 17e",        fromMonthly: 30.00, simFreeFrom: 599,  storages: [256],       colours: ["Black","Soft Pink","White"],                    url: "/mobile-phone-deals/iphone-17-e" },
  { brand: "Apple", model: "iPhone Air",        fromMonthly: 40.00, simFreeFrom: 999,  storages: [256, 1024], colours: ["Space Black","Cloud White","Light Gold","Sky Blue"], url: "/mobile-phone-deals/iphone-air" },
  { brand: "Apple", model: "iPhone 16",         fromMonthly: 32.00, simFreeFrom: 799,  storages: [128],       colours: ["Ultramarine","Teal","Pink","White","Black"],    url: "/mobile-phone-deals/iphone-16" },
  { brand: "Apple", model: "iPhone 16e",        fromMonthly: 21.95, simFreeFrom: 599,  storages: [128],       colours: ["Black","White"],                                url: "/mobile-phone-deals/iphone-16e" },
  { brand: "Apple", model: "iPhone 15",         fromMonthly: 27.00, simFreeFrom: 699,  storages: [128],       colours: ["Blue","Black"],                                 url: "/mobile-phone-deals/iphone-15" },
  { brand: "Apple", model: "iPhone 13 5G",      fromMonthly: 27.00, simFreeFrom: 399,  storages: [128],       colours: ["Starlight","Midnight","Blue"],                  url: "/mobile-phone-deals/iphone-13-5g" },

  // Samsung
  { brand: "Samsung", model: "Galaxy S25 FE",     fromMonthly: 27.00, simFreeFrom: 649,  storages: [128], colours: ["Jet Black","Icy Blue","Navy"],           url: "/mobile-phone-deals/samsung-galaxy-s25-fe" },
  { brand: "Samsung", model: "Galaxy S26 Ultra",  fromMonthly: 42.00, simFreeFrom: 1279, storages: [256], colours: ["Black","Cobalt Violet","Sky Blue","White"], url: "/mobile-phone-deals/samsung-galaxy-s26-ultra" },
  { brand: "Samsung", model: "Galaxy A17 5G",     fromMonthly: 12.00, simFreeFrom: 199,  storages: [128], colours: ["Black","Grey","Blue"],                   url: "/mobile-phone-deals/samsung-galaxy-a17" },
  { brand: "Samsung", model: "Galaxy S26",        fromMonthly: 33.00, simFreeFrom: 879,  storages: [256], colours: ["Black","Cobalt Violet","Sky Blue","White"], url: "/mobile-phone-deals/samsung-galaxy-s26" },
  { brand: "Samsung", model: "Galaxy S25",        fromMonthly: 23.95, simFreeFrom: 799,  storages: [128], colours: ["Navy","Silver Shadow","Icy Blue","Mint"], url: "/mobile-phone-deals/samsung-galaxy-s25" },
  { brand: "Samsung", model: "Galaxy A57",        fromMonthly: 29.00, simFreeFrom: 529,  storages: [256], colours: ["Awesome Navy","Awesome Grey","Awesome Lilac","Awesome Icy Blue"], url: "/mobile-phone-deals/samsung-galaxy-a57" },
  { brand: "Samsung", model: "Galaxy S26+",       fromMonthly: 41.00, simFreeFrom: 1099, storages: [256], colours: ["Black","Cobalt Violet","Sky Blue","White"], url: "/mobile-phone-deals/samsung-galaxy-s26-plus" },
  { brand: "Samsung", model: "Galaxy A26",        fromMonthly: 17.00, simFreeFrom: 299,  storages: [256], colours: ["Black"],                                 url: "/mobile-phone-deals/samsung-galaxy-a26" },
  { brand: "Samsung", model: "Galaxy A17 4G",     fromMonthly: 13.00, simFreeFrom: 169,  storages: [128], colours: ["Black","Blue","Grey"],                   url: "/mobile-phone-deals/samsung-galaxy-a17-4g" },
  { brand: "Samsung", model: "Galaxy Z Flip8",    fromMonthly: 56.00, simFreeFrom: 1149, storages: [256, 512], colours: ["Cream","Pink","Graphite"],          url: "/mobile-phone-deals/samsung-galaxy-z-flip-8" },
  { brand: "Samsung", model: "Galaxy Z Flip7",    fromMonthly: 34.00, simFreeFrom: 1049, storages: [256], colours: ["Jet Black"],                             url: "/mobile-phone-deals/samsung-galaxy-z-flip7" },
  { brand: "Samsung", model: "Galaxy A37",        fromMonthly: 26.00, simFreeFrom: 459,  storages: [256], colours: ["Awesome Charcoal"],                      url: "/mobile-phone-deals/samsung-galaxy-a37" },
  { brand: "Samsung", model: "Galaxy A27",        fromMonthly: 17.00, simFreeFrom: 319,  storages: [128], colours: ["Black"],                                 url: "/mobile-phone-deals/samsung-galaxy-a-27" },
  { brand: "Samsung", model: "Galaxy Z Flip7 FE", fromMonthly: 27.95, simFreeFrom: 849,  storages: [128], colours: ["White"],                                 url: "/mobile-phone-deals/samsung-galaxy-z-flip7-fe" },

  // Google
  { brand: "Google", model: "Pixel 10",         fromMonthly: 25.00, simFreeFrom: 799,  storages: [128], colours: ["Obsidian","Frost","Indigo"],               url: "/mobile-phone-deals/google-pixel-10" },
  { brand: "Google", model: "Pixel 10 Pro",     fromMonthly: 31.00, simFreeFrom: 999,  storages: [128], colours: ["Obsidian","Moonstone","Porcelain"],        url: "/mobile-phone-deals/google-pixel-10-pro" },
  { brand: "Google", model: "Pixel 10a",        fromMonthly: 24.00, simFreeFrom: 499,  storages: [128], colours: ["Obsidian","Fog","Berry","Lavender"],       url: "/mobile-phone-deals/google-pixel-10a" },
  { brand: "Google", model: "Pixel 10 Pro XL",  fromMonthly: 31.95, simFreeFrom: 1199, storages: [256, 512, 1024], colours: ["Obsidian","Moonstone","Porcelain","Jade"], url: "/mobile-phone-deals/google-pixel-10-pro-xl" },
  { brand: "Google", model: "Pixel 9a",         fromMonthly: 19.00, simFreeFrom: 369,  storages: [128], colours: ["Obsidian"],                                url: "/mobile-phone-deals/google-pixel-9a" },
  { brand: "Google", model: "Pixel 11",         fromMonthly: 43.00, simFreeFrom: 879,  storages: [256, 512], colours: ["Hibiscus"],                           url: "/mobile-phone-deals/google-pixel-11" },
  { brand: "Google", model: "Pixel 11 Pro",     fromMonthly: 54.00, simFreeFrom: 1079, storages: [256], colours: ["Olive","Obsidian","Fog","Canyon"],         url: "/mobile-phone-deals/google-pixel-11-pro" },
  { brand: "Google", model: "Pixel 11 Pro XL",  fromMonthly: 66.00, simFreeFrom: 1279, storages: [256, 512], colours: ["Obsidian"],                           url: "/mobile-phone-deals/google-pixel-11-pro-xl" },

  // Honor (only found via offers)
  { brand: "Honor", model: "Honor 600 Pro",   fromMonthly: 38.00,                    storages: [512], colours: ["Black"],                                    url: "/mobile-phone-deals/honor-600-pro" },
  { brand: "Honor", model: "Honor Magic8 lite", fromMonthly: 11.95,                  storages: [512], colours: ["Midnight Black","Forest Green","Reddish Brown"], url: "/talkmobile-mobile-phone-deals/honor-magic-8-lite" },
];

// ---------------------------------------------------------------------------
//  SIM only
// ---------------------------------------------------------------------------

export const simOnlyPlans: SimOnlyPlan[] = [
  { id: "three-8gb-24m",     network: "Three", monthly: 8.00,  contractMonths: 24, dataGb: 8,           fiveG: true, minutes: "unlimited", texts: "unlimited", upfront: 0, cashback: 25, priceRises: rises(9.90, 11.80) },
  { id: "three-60gb-24m",    network: "Three", monthly: 11.00, contractMonths: 24, dataGb: 60,          fiveG: true, minutes: "unlimited", texts: "unlimited", upfront: 0, cashback: 60, priceRises: rises(13.50, 16.00) },
  { id: "three-15gb-12m",    network: "Three", monthly: 6.95,  contractMonths: 12, dataGb: 15,          fiveG: true, minutes: "unlimited", texts: "unlimited", upfront: 0 },
  { id: "three-60gb-rolling", network: "Three", monthly: 10.00, contractMonths: 1,  dataGb: 60,          fiveG: true, minutes: "unlimited", texts: "unlimited", upfront: 0 },
  { id: "three-6gb-rolling", network: "Three", monthly: 6.00,  contractMonths: 1,  dataGb: 6,           fiveG: true, minutes: "unlimited", texts: "unlimited", upfront: 0 },
];

// ---------------------------------------------------------------------------
//  SIM-free (outright)
// ---------------------------------------------------------------------------

export const simFreePhones: SimFreePhone[] = [
  { id: "sf-zflip8",   brand: "Samsung", model: "Galaxy Z Flip8", storageGb: 512, colours: ["Cream","Pink","Graphite"],   price: 1149.00, url: "/sim-free-phones/samsung-galaxy-z-flip-8" },
  { id: "sf-zfold8",   brand: "Samsung", model: "Galaxy Z Fold8", storageGb: 512, colours: ["Cream","Graphite","Lavender"], price: 1656.99, url: "/sim-free-phones/samsung-galaxy-z-fold-8" },
  { id: "sf-doro-a10", brand: "Doro",    model: "Aurora A10",                       colours: ["Graphite"],                  price: 219.00,  url: "/sim-free-phones/doro-aurora-a10" },
  { id: "sf-doro-a20", brand: "Doro",    model: "Aurora A20",                       colours: ["Graphite"],                  price: 249.00,  url: "/sim-free-phones/doro-aurora-a20" },
  { id: "sf-doro-a30", brand: "Doro",    model: "Aurora A30",                       colours: ["Graphite"],                  price: 289.00,  url: "/sim-free-phones/doro-aurora-a30" },
  { id: "sf-doro-e10", brand: "Doro",    model: "Leva E10",                         colours: ["Black"],                     price: 79.00,   url: "/sim-free-phones/doro-leva-e10" },
  { id: "sf-doro-e22", brand: "Doro",    model: "Leva E22",                         colours: ["Black","White"],             price: 89.00,   url: "/sim-free-phones/doro-leva-e22" },
  { id: "sf-pixel-10", brand: "Google",  model: "Pixel 10",       storageGb: 128, colours: ["Obsidian","Frost","Indigo"], price: 799.00,  url: "/sim-free-phones/google-pixel-10" },
  { id: "sf-pixel-10-pro", brand: "Google", model: "Pixel 10 Pro", storageGb: 128, colours: ["Obsidian"],                 price: 999.00,  url: "/sim-free-phones/google-pixel-10-pro" },
];

// ---------------------------------------------------------------------------
//  Refurbished (SIM-free)
// ---------------------------------------------------------------------------

export const refurbPhones: RefurbPhone[] = [
  { id: "refurb-pixel-10-128-obs-exc",        brand: "Google", model: "Pixel 10",       storageGb: 128, colour: "Obsidian",  grade: "Excellent", simFreePrice: 400, url: "/refurbished-phones/google-pixel-10?grade=excellent&capacity=128gb&colour=obsidian" },
  { id: "refurb-pixel-10-256-obs-exc",        brand: "Google", model: "Pixel 10",       storageGb: 256, colour: "Obsidian",  grade: "Excellent", simFreePrice: 490, url: "/refurbished-phones/google-pixel-10?grade=excellent&capacity=256gb&colour=obsidian" },
  { id: "refurb-pixel-10a-128-obs-exc",       brand: "Google", model: "Pixel 10a",      storageGb: 128, colour: "Obsidian",  grade: "Excellent", simFreePrice: 320, url: "/refurbished-phones/google-pixel-10a-refurbished?grade=excellent&capacity=128gb&colour=obsidian" },
  { id: "refurb-pixel-7a-128-snow-good",      brand: "Google", model: "Pixel 7a",       storageGb: 128, colour: "Snow",      grade: "Good",      simFreePrice: 150, url: "/refurbished-phones/google-pixel-7a?grade=good&capacity=128gb&colour=snow" },
  { id: "refurb-pixel-8-pro-128-obs-good",    brand: "Google", model: "Pixel 8 Pro",    storageGb: 128, colour: "Obsidian",  grade: "Good",      simFreePrice: 270, url: "/refurbished-phones/google-pixel-8-pro?grade=good&capacity=128gb&colour=obsidian" },
  { id: "refurb-pixel-9-128-porcelain-good",  brand: "Google", model: "Pixel 9",        storageGb: 128, colour: "Porcelain", grade: "Good",      simFreePrice: 400, url: "/refurbished-phones/google-pixel-9?grade=good&capacity=128gb&colour=porcelain" },
  { id: "refurb-pixel-9-pro-128-obs-good",    brand: "Google", model: "Pixel 9 Pro",    storageGb: 128, colour: "Obsidian",  grade: "Good",      simFreePrice: 410, url: "/refurbished-phones/google-pixel-9-pro?grade=good&capacity=128gb&colour=obsidian" },
  { id: "refurb-pixel-9-pro-xl-128-obs-good", brand: "Google", model: "Pixel 9 Pro XL", storageGb: 128, colour: "Obsidian",  grade: "Good",      simFreePrice: 460, url: "/refurbished-phones/google-pixel-9-pro-xl?grade=good&capacity=128gb&colour=obsidian" },
  { id: "refurb-pixel-9a-128-obs-exc",        brand: "Google", model: "Pixel 9a",       storageGb: 128, colour: "Obsidian",  grade: "Excellent", simFreePrice: 260, url: "/refurbished-phones/google-pixel-9a?grade=excellent&capacity=128gb&colour=obsidian" },
];

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------

export const SOURCE_HOST = "https://www.fonehouse.co.uk";

export function absUrl(path: string): string {
  return path.startsWith("http") ? path : `${SOURCE_HOST}${path}`;
}

export function findDealsByModel(query: string): PhoneDeal[] {
  const q = query.toLowerCase();
  return phoneDeals.filter(d => d.model.toLowerCase().includes(q));
}

export function cheapestFor(model: string): PhoneDeal | undefined {
  return findDealsByModel(model).sort((a, b) => a.monthly - b.monthly)[0];
}

export function dealsByNetwork(network: Network): PhoneDeal[] {
  return phoneDeals.filter(d => d.network === network);
}

export function dealsByBrand(brand: Brand): PhoneDeal[] {
  return phoneDeals.filter(d => d.brand === brand);
}

export function dealsUnder(monthlyCap: number): PhoneDeal[] {
  return phoneDeals.filter(d => d.monthly <= monthlyCap).sort((a, b) => a.monthly - b.monthly);
}

// A one-liner the chat widget can quote back to a customer.
export function summariseDeal(d: PhoneDeal): string {
  const data = d.dataGb === "unlimited" ? "Unlimited" : `${d.dataGb}GB`;
  const up = d.upfront > 0 ? ` (£${d.upfront} upfront)` : "";
  return `${d.model} ${d.storageGb}GB ${d.colour} on ${d.network} — £${d.monthly.toFixed(2)}/mo${up}, ${d.contractMonths} months, ${data}${d.fiveG ? " 5G" : ""}, unlimited mins & texts.`;
}
