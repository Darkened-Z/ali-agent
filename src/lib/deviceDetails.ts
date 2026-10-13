export type DeviceColor = {
  name: string;
  hex: string;
  image: string;
};

export type DeviceStorage = {
  size: string;
  monthlyDiff: number;
  upfrontDiff: number;
  popular?: boolean;
};

export type DeviceAirtimePlan = {
  id: string;
  name: string;
  data: string;
  monthly: number;
  upfront: number;
  features: string[];
  popular?: boolean;
  savings?: string;
};

export type DeviceHighlight = {
  icon: string;
  title: string;
  desc: string;
};

export type DeviceSpecCategory = {
  category: string;
  items: { label: string; value: string }[];
};

export type DeviceDetail = {
  slug: string;
  brand: "Apple" | "Samsung" | "Google" | "HONOR" | "Motorola" | "Other";
  model: string;
  tagline: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  colors: DeviceColor[];
  storages: DeviceStorage[];
  defaultMonthly: number;
  defaultUpfront: number;
  contractOptions: number[]; // e.g. [36, 24]
  airtimePlans: DeviceAirtimePlan[];
  highlights: DeviceHighlight[];
  whatsInTheBox: { name: string; icon: string }[];
  specs: DeviceSpecCategory[];
  tradeInBonus: number;
};

export const DEVICE_CATALOGUE: Record<string, DeviceDetail> = {
  "iphone-18-pro": {
    slug: "iphone-18-pro",
    brand: "Apple",
    model: "iPhone 18 Pro",
    tagline: "Titanium. So strong. So light. So Pro.",
    badge: "FLAGSHIP LAUNCH",
    rating: 4.9,
    reviewsCount: 1482,
    colors: [
      {
        name: "Natural Titanium",
        hex: "#9f9990",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
      {
        name: "Desert Titanium",
        hex: "#c5a88c",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
      {
        name: "White Titanium",
        hex: "#eae6df",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
      {
        name: "Black Titanium",
        hex: "#3c3b39",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
    ],
    storages: [
      { size: "128GB", monthlyDiff: 0, upfrontDiff: 0 },
      { size: "256GB", monthlyDiff: 4, upfrontDiff: 0, popular: true },
      { size: "512GB", monthlyDiff: 9, upfrontDiff: 20 },
      { size: "1TB", monthlyDiff: 15, upfrontDiff: 50 },
    ],
    defaultMonthly: 54.0,
    defaultUpfront: 30.0,
    contractOptions: [36, 24],
    airtimePlans: [
      {
        id: "unlimited-plus",
        name: "Unlimited Data (Best Value)",
        data: "Unlimited 5G Data",
        monthly: 54.0,
        upfront: 30.0,
        popular: true,
        savings: "Save £288 over contract",
        features: [
          "Truly Unlimited 5G Standalone data with zero speed caps",
          "Unlimited UK calls and texts",
          "12GB European Roaming in 49 destinations",
          "Three+ Rewards: £1 Caffè Nero weekly & cinema tickets",
          "Free eSIM activation or next-day DPD physical SIM",
        ],
      },
      {
        id: "300gb-plan",
        name: "300GB 5G Data Plan",
        data: "300GB 5G Data",
        monthly: 49.0,
        upfront: 30.0,
        features: [
          "300GB ultra-fast 5G data allowance",
          "Unlimited UK calls and texts",
          "Three+ Rewards app access",
          "Personal Hotspot / Tethering enabled",
        ],
      },
      {
        id: "100gb-plan",
        name: "100GB 5G Data Plan",
        data: "100GB 5G Data",
        monthly: 44.0,
        upfront: 30.0,
        features: [
          "100GB 5G data allowance",
          "Unlimited UK calls and texts",
          "Three+ Rewards app access",
        ],
      },
    ],
    highlights: [
      {
        icon: "chip",
        title: "Apple A19 Pro Silicon",
        desc: "Breakthrough speed and industry-leading efficiency built for Apple Intelligence.",
      },
      {
        icon: "camera",
        title: "48MP Fusion Pro Camera",
        desc: "Next-generation 5x optical tetraprism telephoto with 4K 120fps Dolby Vision video.",
      },
      {
        icon: "shield",
        title: "Grade 5 Titanium Frame",
        desc: "Lightweight aerospace titanium with contoured edges and latest Ceramic Shield front.",
      },
      {
        icon: "battery",
        title: "All-Day Pro Battery",
        desc: "Up to 29 hours video playback with fast MagSafe & Qi2 wireless charging.",
      },
    ],
    whatsInTheBox: [
      { name: "Apple iPhone 18 Pro", icon: "device" },
      { name: "USB-C to USB-C Woven Cable (1m)", icon: "cable" },
      { name: "Quick Start Guide & SIM Pin", icon: "guide" },
      { name: "100% Recycled Three Packaging", icon: "box" },
    ],
    specs: [
      {
        category: "Display",
        items: [
          { label: "Screen Size", value: "6.3-inch Super Retina XDR OLED" },
          { label: "Resolution", value: "2622 x 1206 pixels at 460 ppi" },
          { label: "Refresh Rate", value: "ProMotion adaptive refresh up to 120Hz" },
          { label: "Brightness", value: "2,000 nits peak outdoor brightness" },
          { label: "Always-On", value: "Supported with Dynamic Island" },
        ],
      },
      {
        category: "Camera System",
        items: [
          { label: "Main Camera", value: "48MP Fusion (f/1.78) with sensor-shift OIS" },
          { label: "Ultra-Wide", value: "48MP with 120° field of view and Macro autofocus" },
          { label: "Telephoto", value: "12MP 5x optical zoom tetraprism lens" },
          { label: "Video", value: "4K Dolby Vision up to 120 fps, Spatial Video" },
          { label: "Front Camera", value: "12MP TrueDepth with autofocus" },
        ],
      },
      {
        category: "Performance & Battery",
        items: [
          { label: "Chipset", value: "Apple A19 Pro with 6-core GPU & 16-core Neural Engine" },
          { label: "Battery Life", value: "Up to 29 hours video playback" },
          { label: "Charging", value: "50% charge in 30 mins with 30W adapter; MagSafe 25W" },
          { label: "Water Resistance", value: "IP68 rated (maximum depth of 6m up to 30 mins)" },
        ],
      },
      {
        category: "Connectivity",
        items: [
          { label: "5G", value: "5G Standalone & Non-Standalone (All UK bands)" },
          { label: "Wi-Fi", value: "Wi-Fi 7 (802.11be) with 2x2 MIMO" },
          { label: "Bluetooth", value: "Bluetooth 5.3" },
          { label: "SIM Types", value: "Dual SIM (Nano-SIM and eSIM, supports Dual eSIM)" },
        ],
      },
    ],
    tradeInBonus: 550,
  },

  "iphone-17": {
    slug: "iphone-17",
    brand: "Apple",
    model: "iPhone 17",
    tagline: "More delightful. More durable. Packed with power.",
    badge: "POPULAR DEAL",
    rating: 4.8,
    reviewsCount: 1210,
    colors: [
      {
        name: "Lavender",
        hex: "#c3b9d4",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
      {
        name: "Sage Green",
        hex: "#b8c9b9",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
      {
        name: "Midnight Black",
        hex: "#232528",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
      {
        name: "Starlight White",
        hex: "#f3f0e8",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
    ],
    storages: [
      { size: "128GB", monthlyDiff: 0, upfrontDiff: 0 },
      { size: "256GB", monthlyDiff: 3, upfrontDiff: 0, popular: true },
      { size: "512GB", monthlyDiff: 7, upfrontDiff: 20 },
    ],
    defaultMonthly: 42.0,
    defaultUpfront: 25.0,
    contractOptions: [36, 24],
    airtimePlans: [
      {
        id: "unlimited-17",
        name: "Unlimited 5G Data",
        data: "Unlimited 5G Data",
        monthly: 46.0,
        upfront: 25.0,
        popular: true,
        savings: "Save £216 over contract",
        features: [
          "Unlimited UK 5G Data with zero caps",
          "Unlimited calls & texts",
          "Three+ VIP rewards access",
          "12GB EU Roaming included",
        ],
      },
      {
        id: "100gb-17",
        name: "100GB 5G Data Plan",
        data: "100GB 5G Data",
        monthly: 42.0,
        upfront: 25.0,
        features: [
          "100GB high-speed 5G data",
          "Unlimited calls & texts",
          "Three+ Rewards",
        ],
      },
    ],
    highlights: [
      {
        icon: "chip",
        title: "Apple A19 Bionic",
        desc: "Ultra-fast processor built for Apple Intelligence and buttery-smooth multitasking.",
      },
      {
        icon: "camera",
        title: "48MP Dual Fusion Camera",
        desc: "2x optical-quality telephoto with computational portrait lighting.",
      },
      {
        icon: "shield",
        title: "Colour-Infused Glass",
        desc: "Tough textured matte glass back and aerospace-grade aluminium frame.",
      },
      {
        icon: "display",
        title: "Dynamic Island",
        desc: "Bubbles up alerts and Live Activities so you never miss a beat.",
      },
    ],
    whatsInTheBox: [
      { name: "Apple iPhone 17", icon: "device" },
      { name: "USB-C Charge Cable", icon: "cable" },
      { name: "SIM Tool & Documentation", icon: "guide" },
    ],
    specs: [
      {
        category: "Display",
        items: [
          { label: "Screen Size", value: "6.1-inch Super Retina XDR OLED" },
          { label: "Resolution", value: "2556 x 1179 pixels at 460 ppi" },
          { label: "Brightness", value: "Up to 2,000 nits peak outdoor brightness" },
        ],
      },
      {
        category: "Camera",
        items: [
          { label: "Main Camera", value: "48MP Fusion (f/1.6)" },
          { label: "Ultra Wide", value: "12MP (f/2.4)" },
          { label: "Optical Zoom", value: "2x optical zoom in, 2x optical zoom out" },
        ],
      },
      {
        category: "Battery",
        items: [
          { label: "Video Playback", value: "Up to 22 hours" },
          { label: "Fast Charge", value: "Up to 50% charge in 30 minutes with 20W USB-C" },
        ],
      },
    ],
    tradeInBonus: 450,
  },

  "samsung-galaxy-s26": {
    slug: "samsung-galaxy-s26",
    brand: "Samsung",
    model: "Samsung Galaxy S26",
    tagline: "Galaxy AI is here. Circle to Search, Live Translate, and more.",
    badge: "TRADE-IN HERO",
    rating: 4.8,
    reviewsCount: 940,
    colors: [
      {
        name: "Cobalt Violet",
        hex: "#4f4961",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-samsung-galaxy-s26-cobaltviolet.png",
      },
      {
        name: "Amber Yellow",
        hex: "#f3e1b7",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-samsung-galaxy-s26-cobaltviolet.png",
      },
      {
        name: "Onyx Black",
        hex: "#2b2a29",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-samsung-galaxy-s26-cobaltviolet.png",
      },
      {
        name: "Marble Grey",
        hex: "#d1cfce",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-samsung-galaxy-s26-cobaltviolet.png",
      },
    ],
    storages: [
      { size: "128GB", monthlyDiff: 0, upfrontDiff: 0 },
      { size: "256GB", monthlyDiff: 3, upfrontDiff: 0, popular: true },
      { size: "512GB", monthlyDiff: 8, upfrontDiff: 30 },
    ],
    defaultMonthly: 38.0,
    defaultUpfront: 29.0,
    contractOptions: [36, 24],
    airtimePlans: [
      {
        id: "unlimited-s26",
        name: "Unlimited 5G Data",
        data: "Unlimited 5G Data",
        monthly: 38.0,
        upfront: 29.0,
        popular: true,
        savings: "Save £726 when you trade in",
        features: [
          "Unlimited 5G UK Data",
          "Unlimited minutes & texts",
          "Galaxy AI features built-in",
          "Three+ VIP discounts and presales",
        ],
      },
      {
        id: "100gb-s26",
        name: "100GB 5G Data Plan",
        data: "100GB 5G Data",
        monthly: 34.0,
        upfront: 29.0,
        features: [
          "100GB 5G data",
          "Unlimited calls & texts",
          "Three+ Rewards",
        ],
      },
    ],
    highlights: [
      {
        icon: "ai",
        title: "Galaxy AI Built-in",
        desc: "Instant live translations, photo editing assist, and Circle to Search with Google.",
      },
      {
        icon: "display",
        title: "Dynamic AMOLED 2X",
        desc: "6.2-inch FHD+ with Vision Booster and adaptive 1-120Hz refresh rate.",
      },
      {
        icon: "camera",
        title: "50MP Triple Camera",
        desc: "Nightography AI enhancement and 3x optical zoom telephoto.",
      },
      {
        icon: "battery",
        title: "Intelligent All-Day Battery",
        desc: "4,000mAh battery optimized by machine learning for maximum endurance.",
      },
    ],
    whatsInTheBox: [
      { name: "Samsung Galaxy S26", icon: "device" },
      { name: "USB-C to USB-C Cable", icon: "cable" },
      { name: "Ejection Pin & Quick Guide", icon: "guide" },
    ],
    specs: [
      {
        category: "Display",
        items: [
          { label: "Screen", value: "6.2\" Dynamic AMOLED 2X (2340 x 1080)" },
          { label: "Refresh", value: "1-120Hz Adaptive Refresh" },
          { label: "Brightness", value: "2,600 nits peak brightness" },
        ],
      },
      {
        category: "Camera",
        items: [
          { label: "Rear Cameras", value: "50MP Wide + 12MP Ultra-Wide + 10MP Telephoto (3x)" },
          { label: "Front Camera", value: "12MP Dual Pixel AF" },
        ],
      },
    ],
    tradeInBonus: 726,
  },

  "samsung-galaxy-s26-ultra": {
    slug: "samsung-galaxy-s26-ultra",
    brand: "Samsung",
    model: "Samsung Galaxy S26 Ultra",
    tagline: "Titanium armor. 200MP camera. S Pen integrated.",
    badge: "ULTIMATE FLAGSHIP",
    rating: 4.9,
    reviewsCount: 1650,
    colors: [
      {
        name: "Titanium Grey",
        hex: "#6b6a67",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-samsung-galaxy-s26-cobaltviolet.png",
      },
      {
        name: "Titanium Black",
        hex: "#2d2d2c",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-samsung-galaxy-s26-cobaltviolet.png",
      },
      {
        name: "Titanium Violet",
        hex: "#584b63",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-samsung-galaxy-s26-cobaltviolet.png",
      },
      {
        name: "Titanium Yellow",
        hex: "#e2d2a4",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-samsung-galaxy-s26-cobaltviolet.png",
      },
    ],
    storages: [
      { size: "256GB", monthlyDiff: 0, upfrontDiff: 0, popular: true },
      { size: "512GB", monthlyDiff: 5, upfrontDiff: 20 },
      { size: "1TB", monthlyDiff: 12, upfrontDiff: 50 },
    ],
    defaultMonthly: 59.0,
    defaultUpfront: 39.0,
    contractOptions: [36, 24],
    airtimePlans: [
      {
        id: "unlimited-s26-ultra",
        name: "Unlimited 5G Data",
        data: "Unlimited 5G Data",
        monthly: 59.0,
        upfront: 39.0,
        popular: true,
        savings: "Save £360 + Free Galaxy Buds FE",
        features: [
          "Unlimited 5G Data with no speed throttling",
          "Unlimited calls and texts",
          "Three+ VIP rewards",
          "12GB EU roaming in 49 destinations",
        ],
      },
      {
        id: "300gb-s26-ultra",
        name: "300GB 5G Data Plan",
        data: "300GB 5G Data",
        monthly: 53.0,
        upfront: 39.0,
        features: [
          "300GB 5G Data",
          "Unlimited calls & texts",
          "Three+ Rewards",
        ],
      },
    ],
    highlights: [
      {
        icon: "pen",
        title: "Built-in S Pen",
        desc: "Write, sketch and navigate with pinpoint precision directly on screen.",
      },
      {
        icon: "camera",
        title: "200MP Quad Tele System",
        desc: "Up to 100x Space Zoom with AI zoom stabilization and 5x optical periscope.",
      },
      {
        icon: "shield",
        title: "Corning Gorilla Armor",
        desc: "Reduces reflections by 75% while providing enhanced scratch resistance.",
      },
      {
        icon: "chip",
        title: "Snapdragon 8 Gen 5 for Galaxy",
        desc: "Industry-leading ray tracing and NPU performance for next-gen gaming.",
      },
    ],
    whatsInTheBox: [
      { name: "Samsung Galaxy S26 Ultra", icon: "device" },
      { name: "Integrated S Pen", icon: "pen" },
      { name: "USB-C to USB-C Cable", icon: "cable" },
      { name: "SIM Eject Pin", icon: "guide" },
    ],
    specs: [
      {
        category: "Display",
        items: [
          { label: "Display", value: "6.8\" QHD+ Dynamic AMOLED 2X (3120 x 1440)" },
          { label: "Peak Brightness", value: "2,600 nits with Anti-Reflective Armor" },
          { label: "Refresh Rate", value: "1-120Hz LTPO" },
        ],
      },
      {
        category: "Camera",
        items: [
          { label: "Main Sensor", value: "200MP Wide with OIS (f/1.7)" },
          { label: "Periscope Zoom", value: "50MP 5x Optical Zoom (Up to 100x Space Zoom)" },
          { label: "Ultra Wide", value: "12MP Dual Pixel AF" },
          { label: "Telephoto", value: "10MP 3x Optical Zoom" },
        ],
      },
      {
        category: "Battery & Performance",
        items: [
          { label: "Battery", value: "5,000 mAh with 45W Fast Charging" },
          { label: "Water Resistance", value: "IP68" },
        ],
      },
    ],
    tradeInBonus: 650,
  },

  "google-pixel-11": {
    slug: "google-pixel-11",
    brand: "Google",
    model: "Google Pixel 11",
    tagline: "The AI phone crafted by Google. Save up to £576 on Three.",
    badge: "EXCLUSIVE SAVINGS",
    rating: 4.8,
    reviewsCount: 780,
    colors: [
      {
        name: "Frost White",
        hex: "#e9edf0",
        image: "https://www.three.co.uk/content/dam/live-asset/web/trading/bau-trading/1100x1100-google-pixel-11-frost-576.png",
      },
      {
        name: "Obsidian Black",
        hex: "#282a2b",
        image: "https://www.three.co.uk/content/dam/live-asset/web/trading/bau-trading/1100x1100-google-pixel-11-frost-576.png",
      },
      {
        name: "Porcelain",
        hex: "#f4f1ea",
        image: "https://www.three.co.uk/content/dam/live-asset/web/trading/bau-trading/1100x1100-google-pixel-11-frost-576.png",
      },
      {
        name: "Hazel",
        hex: "#878d85",
        image: "https://www.three.co.uk/content/dam/live-asset/web/trading/bau-trading/1100x1100-google-pixel-11-frost-576.png",
      },
    ],
    storages: [
      { size: "128GB", monthlyDiff: 0, upfrontDiff: 0 },
      { size: "256GB", monthlyDiff: 3, upfrontDiff: 0, popular: true },
      { size: "512GB", monthlyDiff: 7, upfrontDiff: 20 },
    ],
    defaultMonthly: 47.0,
    defaultUpfront: 15.0,
    contractOptions: [36, 24],
    airtimePlans: [
      {
        id: "unlimited-pixel-11",
        name: "Unlimited 5G Data",
        data: "Unlimited 5G Data",
        monthly: 47.0,
        upfront: 15.0,
        popular: true,
        savings: "Save up to £576 with airtime promo",
        features: [
          "Unlimited 5G UK Data",
          "Gemini Nano on-device AI assistant",
          "7 years of Android OS and Security Updates",
          "Three+ VIP reward benefits",
        ],
      },
      {
        id: "100gb-pixel-11",
        name: "100GB 5G Data Plan",
        data: "100GB 5G Data",
        monthly: 41.0,
        upfront: 15.0,
        features: [
          "100GB 5G Data",
          "Unlimited calls & texts",
          "Three+ Rewards",
        ],
      },
    ],
    highlights: [
      {
        icon: "chip",
        title: "Google Tensor G5",
        desc: "Engineered specifically for Google AI and Google Gemini generative tools.",
      },
      {
        icon: "camera",
        title: "Best Take & Magic Editor",
        desc: "Fix blinking eyes, remove photo distractions, and re-imagine backgrounds.",
      },
      {
        icon: "shield",
        title: "7 Years of OS Updates",
        desc: "Guaranteed Android feature drops and security patches until 2033.",
      },
      {
        icon: "battery",
        title: "24-Hour Adaptive Battery",
        desc: "Learns your favorite apps to prioritize power where you need it most.",
      },
    ],
    whatsInTheBox: [
      { name: "Google Pixel 11", icon: "device" },
      { name: "1m USB-C to USB-C Cable (USB 2.0)", icon: "cable" },
      { name: "Quick Switch Adaptor & SIM Tool", icon: "guide" },
    ],
    specs: [
      {
        category: "Display",
        items: [
          { label: "Display", value: "6.3-inch Actua Display (1080 x 2424 OLED)" },
          { label: "Refresh Rate", value: "60-120Hz Smooth Display" },
          { label: "Brightness", value: "2,700 nits peak brightness" },
        ],
      },
      {
        category: "Camera",
        items: [
          { label: "Main Camera", value: "50MP Octa PD wide (f/1.68)" },
          { label: "Ultra-Wide", value: "48MP Quad PD with Macro Focus" },
          { label: "Super Res Zoom", value: "Up to 8x digital zoom" },
        ],
      },
    ],
    tradeInBonus: 500,
  },

  "honor-magic-v6": {
    slug: "honor-magic-v6",
    brand: "HONOR",
    model: "HONOR Magic V6",
    tagline: "The world's thinnest inward foldable. Flagship power unfolded.",
    badge: "FOLDABLE INNOVATION",
    rating: 4.8,
    reviewsCount: 420,
    colors: [
      {
        name: "Imperial Red",
        hex: "#8b263e",
        image: "https://www.three.co.uk/content/dam/live-asset/web/device-images/phones/honor/magic-series/620x620-centre-honor-magic-v6-red.png",
      },
      {
        name: "Velvet Black",
        hex: "#1d1d1f",
        image: "https://www.three.co.uk/content/dam/live-asset/web/device-images/phones/honor/magic-series/620x620-centre-honor-magic-v6-red.png",
      },
      {
        name: "Silk Green",
        hex: "#3d5448",
        image: "https://www.three.co.uk/content/dam/live-asset/web/device-images/phones/honor/magic-series/620x620-centre-honor-magic-v6-red.png",
      },
    ],
    storages: [
      { size: "512GB", monthlyDiff: 0, upfrontDiff: 0, popular: true },
      { size: "1TB", monthlyDiff: 8, upfrontDiff: 50 },
    ],
    defaultMonthly: 49.0,
    defaultUpfront: 39.0,
    contractOptions: [36, 24],
    airtimePlans: [
      {
        id: "unlimited-honor-v6",
        name: "Unlimited 5G Foldable Plan",
        data: "Unlimited 5G Data",
        monthly: 49.0,
        upfront: 39.0,
        popular: true,
        features: [
          "Unlimited 5G Data",
          "Dual screen multitasking optimization",
          "Three+ VIP Rewards app access",
          "12GB EU roaming in 49 destinations",
        ],
      },
    ],
    highlights: [
      {
        icon: "fold",
        title: "Ultra-Thin 9.2mm Folded",
        desc: "Slimmer than most traditional bar phones with aerospace titanium hinge.",
      },
      {
        icon: "display",
        title: "Dual 120Hz LTPO Displays",
        desc: "7.92-inch inner foldable screen plus 6.43-inch outer display with 4320Hz PWM dimming.",
      },
      {
        icon: "battery",
        title: "5,150mAh Silicon-Carbon Battery",
        desc: "Massive battery that fits into an ultra-thin chassis with 66W SuperCharge.",
      },
    ],
    whatsInTheBox: [
      { name: "HONOR Magic V6 Foldable", icon: "device" },
      { name: "66W SuperCharge Power Brick", icon: "charger" },
      { name: "Protective Aramid Case & Cable", icon: "case" },
    ],
    specs: [
      {
        category: "Displays",
        items: [
          { label: "Inner Screen", value: "7.92-inch Foldable OLED (2344 x 2156, 120Hz)" },
          { label: "Outer Screen", value: "6.43-inch OLED (2376 x 1060, 120Hz)" },
        ],
      },
    ],
    tradeInBonus: 550,
  },

  "motorola-razr-70-ultra": {
    slug: "motorola-razr-70-ultra",
    brand: "Motorola",
    model: "Motorola Razr 70 Ultra",
    tagline: "Pocket the magic. Largest external flip display ever.",
    badge: "FLIP EXCLUSIVE",
    rating: 4.7,
    reviewsCount: 390,
    colors: [
      {
        name: "Orient Blue",
        hex: "#224263",
        image: "https://www.three.co.uk/content/dam/live-asset/web/device-images/phones/motorola/razr-70-ultra/620x620-centre-motorola-razr-70-ultra-orient-blue.png",
      },
      {
        name: "Midnight Navy",
        hex: "#1d2330",
        image: "https://www.three.co.uk/content/dam/live-asset/web/device-images/phones/motorola/razr-70-ultra/620x620-centre-motorola-razr-70-ultra-orient-blue.png",
      },
      {
        name: "Peach Fuzz",
        hex: "#f5a287",
        image: "https://www.three.co.uk/content/dam/live-asset/web/device-images/phones/motorola/razr-70-ultra/620x620-centre-motorola-razr-70-ultra-orient-blue.png",
      },
    ],
    storages: [
      { size: "256GB", monthlyDiff: 0, upfrontDiff: 0 },
      { size: "512GB", monthlyDiff: 4, upfrontDiff: 0, popular: true },
    ],
    defaultMonthly: 41.0,
    defaultUpfront: 29.0,
    contractOptions: [36, 24],
    airtimePlans: [
      {
        id: "unlimited-razr-70",
        name: "Unlimited 5G Data",
        data: "Unlimited 5G Data",
        monthly: 41.0,
        upfront: 29.0,
        popular: true,
        features: [
          "Unlimited 5G UK Data",
          "Moto AI external screen interactions",
          "Three+ VIP Rewards app access",
        ],
      },
    ],
    highlights: [
      {
        icon: "flip",
        title: "4.0\" External pOLED Display",
        desc: "Respond to messages, play games, and take selfies without opening the phone.",
      },
      {
        icon: "camera",
        title: "50MP Dual Camera with Moto AI",
        desc: "AI Action Shot and adaptive stabilization for shake-free videos.",
      },
      {
        icon: "chip",
        title: "Snapdragon 8s Gen 3",
        desc: "Blazing fast performance paired with 45W TurboPower charging.",
      },
    ],
    whatsInTheBox: [
      { name: "Motorola Razr 70 Ultra", icon: "device" },
      { name: "TurboPower 68W Charger", icon: "charger" },
      { name: "Premium Vegan Leather Case", icon: "case" },
    ],
    specs: [
      {
        category: "Displays",
        items: [
          { label: "Main Screen", value: "6.9\" FHD+ pOLED (165Hz, HDR10+)" },
          { label: "External Screen", value: "4.0\" pOLED (165Hz, Gorilla Glass Victus)" },
        ],
      },
    ],
    tradeInBonus: 400,
  },
};

export function getDeviceBySlug(slug: string): DeviceDetail {
  if (DEVICE_CATALOGUE[slug]) {
    return DEVICE_CATALOGUE[slug];
  }

  // Generates fallback device details for any unlisted slug gracefully
  const cleanName = slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const isApple = slug.toLowerCase().includes("iphone");
  const isSamsung = slug.toLowerCase().includes("samsung") || slug.toLowerCase().includes("galaxy");
  const isGoogle = slug.toLowerCase().includes("pixel");

  const brand = isApple ? "Apple" : isSamsung ? "Samsung" : isGoogle ? "Google" : "Other";

  return {
    slug,
    brand,
    model: cleanName,
    tagline: `Experience the amazing ${cleanName} on the UK's fastest 5G network.`,
    badge: "SPECIAL OFFER",
    rating: 4.8,
    reviewsCount: 520,
    colors: [
      {
        name: "Graphite Black",
        hex: "#222222",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
      {
        name: "Silver Mist",
        hex: "#e0e0e0",
        image: "https://www.three.co.uk/content/dam/live-asset/web/Pages/Home/620x620-centre-iphone-17-lavender.png",
      },
    ],
    storages: [
      { size: "128GB", monthlyDiff: 0, upfrontDiff: 0 },
      { size: "256GB", monthlyDiff: 4, upfrontDiff: 0, popular: true },
      { size: "512GB", monthlyDiff: 9, upfrontDiff: 30 },
    ],
    defaultMonthly: 39.0,
    defaultUpfront: 20.0,
    contractOptions: [36, 24],
    airtimePlans: [
      {
        id: `unl-${slug}`,
        name: "Unlimited 5G Data",
        data: "Unlimited 5G Data",
        monthly: 39.0,
        upfront: 20.0,
        popular: true,
        features: [
          "Unlimited 5G Data allowance",
          "Unlimited UK calls and texts",
          "Three+ VIP Rewards",
          "12GB EU roaming in 49 destinations",
        ],
      },
      {
        id: `100gb-${slug}`,
        name: "100GB 5G Data",
        data: "100GB 5G Data",
        monthly: 34.0,
        upfront: 20.0,
        features: [
          "100GB 5G Data",
          "Unlimited UK calls and texts",
          "Three+ Rewards",
        ],
      },
    ],
    highlights: [
      { icon: "chip", title: "Next-Gen 5G Power", desc: "Fast downloads and lag-free streaming anywhere." },
      { icon: "camera", title: "Advanced Pro Camera", desc: "Stunning low-light photography and 4K video recording." },
      { icon: "battery", title: "Long-lasting Battery", desc: "Power through your entire day without worry." },
    ],
    whatsInTheBox: [
      { name: cleanName, icon: "device" },
      { name: "USB-C Fast Charging Cable", icon: "cable" },
      { name: "SIM Tool & Guide", icon: "guide" },
    ],
    specs: [
      {
        category: "Network",
        items: [
          { label: "Network Band", value: "5G Ready (Standalone & Non-Standalone)" },
          { label: "Wi-Fi", value: "Wi-Fi 6E / Wi-Fi 7" },
        ],
      },
    ],
    tradeInBonus: 400,
  };
}
