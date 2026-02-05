// Game constants and configuration

export const GAME_CONFIG = {
  STARTING_GAIA: 1000,
  TICK_INTERVAL_MS: 1000, // Update every 1 second
  AUTOSAVE_INTERVAL_MS: 30000, // Auto-save every 30 seconds
  RACK_SLOTS: 9, // 3x3 grid
};

// Crop types and their properties
export const CROP_TYPES: {
  [key: string]: {
    name: string;
    growthTimeSeconds: number;
    basePrice: number;
    seedCost: number;
    image: string;
    description: string;
  };
} = {
  microgreens: {
    name: 'Microgreens',
    growthTimeSeconds: 120, // 2 minutes
    basePrice: 50,
    seedCost: 10,
    image: '/crops/microgreens.jpg',
    description: 'Fast-growing salad greens',
  },
  strawberries: {
    name: 'Strawberries',
    growthTimeSeconds: 300, // 5 minutes
    basePrice: 150,
    seedCost: 30,
    image: '/crops/strawberries.jpg',
    description: 'Sweet berries, medium growth',
  },
  wasabi: {
    name: 'Wasabi',
    growthTimeSeconds: 600, // 10 minutes
    basePrice: 500,
    seedCost: 100,
    image: '/crops/wasabi.jpg',
    description: 'Premium crop, slow growth',
  },
};

export type CropTypeKey = 'microgreens' | 'strawberries' | 'wasabi';

// Growth stages
export const GROWTH_STAGES: {
  [key: string]: { name: string; progressThreshold: number };
} = {
  seed: { name: 'Seed', progressThreshold: 0 },
  germination: { name: 'Germination', progressThreshold: 20 },
  vegetative: { name: 'Vegetative', progressThreshold: 40 },
  flowering: { name: 'Flowering', progressThreshold: 70 },
  harvest_ready: { name: 'Harvest Ready', progressThreshold: 100 },
};

export type GrowthStageKey = 'seed' | 'germination' | 'vegetative' | 'flowering' | 'harvest_ready';

// Quality grades and multipliers
export const QUALITY_GRADES: {
  [key: string]: { name: string; priceMultiplier: number; color: string };
} = {
  S: { name: 'S-Grade', priceMultiplier: 2.0, color: '#FFD700' },
  A: { name: 'A-Grade', priceMultiplier: 1.5, color: '#00ff88' },
  B: { name: 'B-Grade', priceMultiplier: 1.2, color: '#00aaff' },
  C: { name: 'C-Grade', priceMultiplier: 0.8, color: '#888888' },
};

export type QualityGradeKey = 'S' | 'A' | 'B' | 'C';

// Environmental parameters
export const ENVIRONMENTAL_PARAMS = {
  water: {
    name: 'Water Level',
    unit: '%',
    min: 0,
    max: 100,
    optimal: { min: 70, max: 100 },
    depletionRate: 0.5, // per second per crop
    refillAmount: 20,
    refillCost: 5,
  },
  ph: {
    name: 'pH Level',
    unit: '',
    min: 0,
    max: 14,
    optimal: { min: 5.5, max: 6.5 },
    driftRate: 0.01, // random drift per second
    adjustAmount: 0.5,
    adjustCost: 5,
  },
  nutrient: {
    name: 'Nutrient PPM',
    unit: 'PPM',
    min: 0,
    max: 2000,
    optimal: { min: 1200, max: 1800 },
    depletionRate: 1, // per second per crop
    addAmount: 100,
    addCost: 10,
  },
  lighting: {
    name: 'Lighting Intensity',
    unit: '%',
    min: 0,
    max: 100,
    optimal: { min: 70, max: 100 },
    energyCostPerHour: 0.5, // per percentage point
  },
};

// Upgrades
export const UPGRADES: {
  [key: string]: {
    name: string;
    description: string;
    cost: number;
    icon: string;
  };
} = {
  auto_water: {
    name: 'Auto-Water System',
    description: 'Automatically maintains water level above 70%',
    cost: 500,
    icon: 'Droplet',
  },
  auto_nutrient: {
    name: 'Auto-Nutrient System',
    description: 'Automatically maintains nutrient levels above 1200 PPM',
    cost: 600,
    icon: 'Beaker',
  },
  ph_stabilizer: {
    name: 'pH Stabilizer',
    description: 'Reduces pH drift by 50%',
    cost: 400,
    icon: 'Activity',
  },
  efficient_lighting: {
    name: 'Efficient Lighting',
    description: 'Reduces energy costs by 30%',
    cost: 800,
    icon: 'Zap',
  },
  tower_expansion: {
    name: 'Tower Expansion',
    description: 'Adds 9 more rack slots (coming soon)',
    cost: 2000,
    icon: 'Layers',
  },
};

export type UpgradeTypeKey = 'auto_water' | 'auto_nutrient' | 'ph_stabilizer' | 'efficient_lighting' | 'tower_expansion';

// Rack unit cost
export const RACK_UNIT_COST = 100;
