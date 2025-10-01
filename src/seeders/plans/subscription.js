export const EMPTY_PLAN = {
  name: "Default Plan",
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
    imageCredit: 30,
    videoCredit: 128,
    aiImageCredit: 3,
    maxVariant: 2,
    imageResolution: "2k",
    videoResolution: "2k",
    displayQuality: "medium",
    embed: true,
    multiImageFromCAD: true,
    customVideoAngle: true, // used later
    pdfCatalogue: true, // used later
    playground: false, // used later
  },
  prices: [{ currency: "INR", amount: 0 }],
  durationInDays: 5,
  weight: 10,
};

export default [
  DEFAULT_PLAN,
  {
    name: "Small Plan",
    planId: "plan_ROG4g8SOLKXxG2",
    description: "Small plan for beginners",
    type: "order",
    features: {
      modelCredit: 50,
      material: 100,
      preset: 100,
      customAssets: 10,
      imageCredit: 500,
      videoCredit: 200,
      aiImageCredit: 150,
      maxVariant: 4,
      imageResolution: "4k",
      videoResolution: "4k",
      displayQuality: "high",
      embed: true,
      multiImageFromCAD: true,
      customVideoAngle: true, // used later
      pdfCatalogue: true, // used later
      playground: false, // used later
    },
    prices: [{ currency: "INR", amount: 17_499 }],
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 20,
  },
  {
    name: "Starter Plan",
    planId: "plan_ROG6gbK7PE0ghF",
    description: "Starter plan with limited features",
    type: "order",
    features: {
      modelCredit: 100,
      material: 100,
      preset: 100,
      customAssets: 25,
      imageCredit: 1000,
      videoCredit: 400,
      aiImageCredit: 300,
      maxVariant: 8,
      imageResolution: "4k",
      videoResolution: "4k",
      displayQuality: "high",
      embed: true,
      multiImageFromCAD: true,
      customVideoAngle: true, // used later
      pdfCatalogue: true, // used later
      playground: false, // used later
    },
    prices: [{ currency: "INR", amount: 24_999 }],
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 30,
  },
  {
    name: "Growth Plan",
    planId: "plan_ROGByV07fnAzU6",
    description: "Growth plan with extended features",
    type: "order",
    features: {
      modelCredit: 250,
      material: 100,
      preset: 100,
      customAssets: 75,
      imageCredit: 2500,
      videoCredit: 1000,
      aiImageCredit: 750,
      maxVariant: 10,
      imageResolution: "4k",
      videoResolution: "4k",
      displayQuality: "high",
      embed: true,
      multiImageFromCAD: true,
      customVideoAngle: true, // used later
      pdfCatalogue: true, // used later
      playground: false, // used later
    },
    prices: [{ currency: "INR", amount: 54_999 }],
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 40,
  },
  {
    name: "Pro Studio Plan",
    planId: "plan_ROGEJmz3xzX9ls",
    description: "Pro Studio plan with full features",
    type: "order",
    features: {
      modelCredit: 500,
      material: 100,
      preset: 100,
      customAssets: 200,
      imageCredit: 5000,
      videoCredit: 2000,
      aiImageCredit: 1500,
      maxVariant: 25,
      imageResolution: "8k",
      videoResolution: "8k",
      displayQuality: "ultra high",
      embed: true,
      multiImageFromCAD: true,
      customVideoAngle: true, // used later
      pdfCatalogue: true, // used later
      playground: false, // used later
    },
    prices: [{ currency: "INR", amount: 1_09_999 }],
    durationInDays: Number.MAX_SAFE_INTEGER,
    weight: 50,
  },
];
