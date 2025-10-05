const CURRENCY_LIST = [
  { currency: "INR", symbol: "₹" },
  { currency: "USD", symbol: "$" },
  { currency: "EUR", symbol: "€" },
  { currency: "GBP", symbol: "£" },
];

// Example static conversion rates (can be adjusted)
const STATIC_PRICES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0098,
};

// Helper to generate prices with symbols
const generatePrices = (amountINR) =>
  CURRENCY_LIST.map(({ currency, symbol }) => ({
    currency,
    symbol,
    amount: Math.round(amountINR * STATIC_PRICES[currency]),
  }));

const CREDITS = [
  {
    name: "Starter Pack",
    planId: "TOP_UP",
    description: "15 model credits for quick experiments",
    type: "modelCredit",
    features: { modelCredit: 15 },
    prices: generatePrices(3700), //250 per cad
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 10,
    isActive: true,
  },
  {
    name: "Basic Pack",
    planId: "TOP_UP",
    description: "50 model credits to get started",
    type: "modelCredit",
    features: { modelCredit: 50 },
    prices: generatePrices(11500), // 230 per cad
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 20,
    isActive: true,
  },
  {
    name: "Standard Pack",
    planId: "TOP_UP",
    description: "100 model credits for regular usage",
    type: "modelCredit",
    features: { modelCredit: 100 },
    prices: generatePrices(21000), //210 per cad
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 30,
    isActive: true,
  },
  {
    name: "Pro Pack",
    planId: "TOP_UP",
    description: "500 model credits for professionals",
    type: "modelCredit",
    features: { modelCredit: 500 },
    prices: generatePrices(100000), // 200 per cad
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 40,
    isActive: true,
  },
];
const IMAGE = [
  {
    name: "Starter Image Pack",
    planId: "TOP_UP",
    description: "250 image credits for small tasks",
    type: "imageCredit",
    features: { imageCredit: 250 },
    prices: generatePrices(1250),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 10,
    isActive: true,
  },
  {
    name: "Basic Image Pack",
    planId: "TOP_UP",
    description: "500 image credits for consistent usage",
    type: "imageCredit",
    features: { imageCredit: 500 },
    prices: generatePrices(2500),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 20,
    isActive: true,
  },
  {
    name: "Standard Image Pack",
    planId: "TOP_UP",
    description: "1000 image credits for larger projects",
    type: "imageCredit",
    features: { imageCredit: 1000 },
    prices: generatePrices(5000),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 30,
    isActive: true,
  },
  {
    name: "Pro Image Pack",
    planId: "TOP_UP",
    description: "5000 image credits for professionals",
    type: "imageCredit",
    features: { imageCredit: 5000 },
    prices: generatePrices(25000),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 40,
    isActive: true,
  },
];

const VIDEO = [
  {
    name: "Starter Video Pack",
    planId: "TOP_UP",
    description: "100 video credits for quick projects",
    type: "videoCredit",
    features: { videoCredit: 100 },
    prices: generatePrices(1000),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 10,
    isActive: true,
  },
  {
    name: "Basic Video Pack",
    planId: "TOP_UP",
    description: "250 video credits for growing needs",
    type: "videoCredit",
    features: { videoCredit: 250 },
    prices: generatePrices(2500),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 20,
    isActive: true,
  },
  {
    name: "Standard Video Pack",
    planId: "TOP_UP",
    description: "500 video credits for regular usage",
    type: "videoCredit",
    features: { videoCredit: 500 },
    prices: generatePrices(5000),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 30,
    isActive: true,
  },
  {
    name: "Pro Video Pack",
    planId: "TOP_UP",
    description: "1000 video credits for professionals",
    type: "videoCredit",
    features: { videoCredit: 1000 },
    prices: generatePrices(10000),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 40,
    isActive: true,
  },
];

const AI_IMAGE = [
  {
    name: "Starter AI Image Pack",
    planId: "TOP_UP",
    description: "100 AI image credits for testing ideas",
    type: "aiImageCredit",
    features: { aiImageCredit: 100 },
    prices: generatePrices(1000),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 10,
    isActive: true,
  },
  {
    name: "Basic AI Image Pack",
    planId: "TOP_UP",
    description: "250 AI image credits for creative work",
    type: "aiImageCredit",
    features: { aiImageCredit: 250 },
    prices: generatePrices(2500),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 20,
    isActive: true,
  },
  {
    name: "Standard AI Image Pack",
    planId: "TOP_UP",
    description: "500 AI image credits for heavy projects",
    type: "aiImageCredit",
    features: { aiImageCredit: 500 },
    prices: generatePrices(5000),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 30,
    isActive: true,
  },
  {
    name: "Pro AI Image Pack",
    planId: "TOP_UP",
    description: "1000 AI image credits for professionals",
    type: "aiImageCredit",
    features: { aiImageCredit: 1000 },
    prices: generatePrices(10000),
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 40,
    isActive: true,
  },
];

export default [...CREDITS, ...IMAGE, ...VIDEO, ...AI_IMAGE];
