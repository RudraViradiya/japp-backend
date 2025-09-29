export const EMPTY_PLAN = {
  name: "Free Trail",
  planId: "",
  description: "empty plan with limited features",
  type: "order",
  features: {
    modelCredit: 0,
    material: 10,
    preset: 10,
    customAssets: 0,
    imageCredit: 0,
    videoCredit: 0,
    aiImageCredit: 0,
    maxVariant: 2,
    imageResolution: "2k",
    videoResolution: "2k",
    displayQuality: "medium",
    customVideoAngle: true,
    embed: true,
    multiImageFromCAD: true,
    pdfCatalogue: true,
    playground: false,
  },
  prices: [{ currency: "INR", amount: 0 }],
  durationInDays: 0,
  weight: 10,
};

export const DEFAULT_PLAN = {
  name: "Free Trail",
  planId: "",
  description: "Free trail plan with limited features",
  type: "order",
  features: {
    modelCredit: 3,
    material: 100,
    preset: 100,
    customAssets: 2,
    imageCredit: 24,
    videoCredit: 8,
    aiImageCredit: 3,
    maxVariant: 3,
    imageResolution: "2k",
    videoResolution: "2k",
    displayQuality: "medium",
    customVideoAngle: true, // used later
    embed: true,
    multiImageFromCAD: true,
    pdfCatalogue: true, // used later
    playground: false, // used later
  },
  prices: [{ currency: "INR", amount: 0 }],
  durationInDays: 5,
  weight: 10,
};

export default [
  {
    name: "Small Plan",
    planId: "plan_RMKQHj39CN2KZe",
    description: "Small plan for beginners",
    type: "order",
    features: {
      modelCredit: 100,
      material: 100,
      preset: 100,
      customAssets: 5,
      imageCredit: Number.MAX_SAFE_INTEGER,
      videoCredit: 4,
      aiImageCredit: 300,
      maxVariant: 2,
      imageResolution: "4k",
      videoResolution: "4k",
      displayQuality: "high",
      customVideoAngle: true, // used later
      embed: true,

      multiImageFromCAD: true,
      pdfCatalogue: true, // used later
      playground: false, // used later
    },
    prices: [{ currency: "INR", amount: 22999 }],
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 20,
  },
  {
    name: "Starter Plan",
    planId: "plan_RKjWPFVJZNFt7l",
    description: "Starter plan with limited features",
    type: "order",
    features: {
      modelCredit: 50,
      material: 100,
      preset: 100,
      customAssets: 3,
      imageCredit: Number.MAX_SAFE_INTEGER,
      videoCredit: 4,
      aiImageCredit: 150,
      maxVariant: 2,
      imageResolution: "4k",
      videoResolution: "4k",
      displayQuality: "high",
      customVideoAngle: true, // used later
      embed: true,

      multiImageFromCAD: true,
      pdfCatalogue: true, // used later
      playground: false, // used later
    },
    prices: [{ currency: "INR", amount: 34999 }],
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 30,
  },
  {
    name: "Growth Plan",
    planId: "plan_RKjXLhQxbdT3rL",
    description: "Growth plan with extended features",
    type: "order",
    features: {
      modelCredit: 250,
      material: 100,
      preset: 100,
      customAssets: 10,
      imageCredit: Number.MAX_SAFE_INTEGER,
      videoCredit: 10,
      aiImageCredit: 750,
      maxVariant: 2,
      imageResolution: "4k",
      videoResolution: "4k",
      displayQuality: "high",
      customVideoAngle: true, // used later
      embed: true,
      multiImageFromCAD: true,
      pdfCatalogue: true, // used later
      playground: false, // used later
    },
    prices: [{ currency: "INR", amount: 79999 }],
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 40,
  },
  {
    name: "Pro Studio Plan",
    planId: "plan_RKjXdutBCioAhq",
    description: "Pro Studio plan with full features",
    type: "order",
    features: {
      modelCredit: 500,
      material: 100,
      preset: 100,
      imageCredit: Number.MAX_SAFE_INTEGER,
      videoCredit: Number.MAX_SAFE_INTEGER,
      aiImageCredit: 1500,
      customAssets: Number.MAX_SAFE_INTEGER,
      maxVariant: 2,

      imageResolution: "8k",
      videoResolution: "8k",
      displayQuality: "high",
      customVideoAngle: true, // used later
      embed: true,

      multiImageFromCAD: true,
      pdfCatalogue: true, // used later
      playground: false, // used later
    },
    prices: [{ currency: "INR", amount: 149999 }],
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 50,
  },
];
