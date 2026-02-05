// Game logic utilities

import { CROP_TYPES, ENVIRONMENTAL_PARAMS, GROWTH_STAGES, QUALITY_GRADES, type CropTypeKey, type GrowthStageKey, type QualityGradeKey } from './constants';

/**
 * Calculate growth progress for a crop based on time elapsed
 */
export function calculateGrowthProgress(
  cropType: CropTypeKey,
  plantedAt: Date,
  currentTime: Date
): number {
  const elapsed = (currentTime.getTime() - plantedAt.getTime()) / 1000; // seconds
  const growthTime = CROP_TYPES[cropType].growthTimeSeconds;
  const progress = (elapsed / growthTime) * 100;
  return Math.min(progress, 100);
}

/**
 * Determine growth stage based on progress percentage
 */
export function determineGrowthStage(progress: number): GrowthStageKey {
  if (progress >= 100) return 'harvest_ready';
  if (progress >= 70) return 'flowering';
  if (progress >= 40) return 'vegetative';
  if (progress >= 20) return 'germination';
  return 'seed';
}

/**
 * Calculate environmental score based on how well parameters are maintained
 */
export function calculateEnvironmentalImpact(
  waterLevel: number,
  phLevel: number,
  nutrientPPM: number,
  lightingIntensity: number
): number {
  let score = 100;

  // Water impact
  const waterOptimal = ENVIRONMENTAL_PARAMS.water.optimal;
  if (waterLevel < waterOptimal.min) {
    score -= ((waterOptimal.min - waterLevel) / waterOptimal.min) * 30;
  }

  // pH impact
  const phOptimal = ENVIRONMENTAL_PARAMS.ph.optimal;
  if (phLevel < phOptimal.min || phLevel > phOptimal.max) {
    const phDeviation = Math.min(
      Math.abs(phLevel - phOptimal.min),
      Math.abs(phLevel - phOptimal.max)
    );
    score -= phDeviation * 10;
  }

  // Nutrient impact
  const nutrientOptimal = ENVIRONMENTAL_PARAMS.nutrient.optimal;
  if (nutrientPPM < nutrientOptimal.min) {
    score -= ((nutrientOptimal.min - nutrientPPM) / nutrientOptimal.min) * 30;
  }

  // Lighting impact
  const lightingOptimal = ENVIRONMENTAL_PARAMS.lighting.optimal;
  if (lightingIntensity < lightingOptimal.min) {
    score -= ((lightingOptimal.min - lightingIntensity) / lightingOptimal.min) * 20;
  }

  return Math.max(score, 0);
}

/**
 * Calculate quality grade based on environmental score
 */
export function calculateQualityGrade(environmentalScore: number): QualityGradeKey {
  const score = environmentalScore ?? 0;
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  return 'C';
}

/**
 * Calculate harvest value
 */
export function calculateHarvestValue(
  cropType: CropTypeKey,
  qualityGrade: QualityGradeKey
): number {
  // Ensure QUALITY_GRADES exists and has the grade
  if (!QUALITY_GRADES || typeof QUALITY_GRADES !== 'object') {
    console.error('QUALITY_GRADES is not properly defined');
    return CROP_TYPES?.[cropType]?.basePrice ?? 0;
  }
  
  const basePrice = CROP_TYPES?.[cropType]?.basePrice ?? 0;
  const multiplier = QUALITY_GRADES?.[qualityGrade]?.priceMultiplier ?? 1;
  return Math.floor(basePrice * multiplier);
}

/**
 * Update environmental parameters based on time elapsed
 */
export function updateEnvironmentalParameters(
  current: {
    waterLevel: number;
    phLevel: number;
    nutrientPPM: number;
    lightingIntensity: number;
  },
  activeCropCount: number,
  secondsElapsed: number,
  upgrades: {
    hasPhStabilizer: boolean;
  }
): {
  waterLevel: number;
  phLevel: number;
  nutrientPPM: number;
} {
  // Water depletion
  const waterDepletion =
    ENVIRONMENTAL_PARAMS.water.depletionRate * activeCropCount * secondsElapsed;
  const newWaterLevel = Math.max(0, current.waterLevel - waterDepletion);

  // pH drift (random walk)
  const phDriftRate = upgrades.hasPhStabilizer
    ? ENVIRONMENTAL_PARAMS.ph.driftRate * 0.5
    : ENVIRONMENTAL_PARAMS.ph.driftRate;
  const phDrift = (Math.random() - 0.5) * 2 * phDriftRate * secondsElapsed;
  const newPhLevel = Math.max(
    ENVIRONMENTAL_PARAMS.ph.min,
    Math.min(ENVIRONMENTAL_PARAMS.ph.max, current.phLevel + phDrift)
  );

  // Nutrient depletion
  const nutrientDepletion =
    ENVIRONMENTAL_PARAMS.nutrient.depletionRate * activeCropCount * secondsElapsed;
  const newNutrientPPM = Math.max(0, current.nutrientPPM - nutrientDepletion);

  return {
    waterLevel: newWaterLevel,
    phLevel: newPhLevel,
    nutrientPPM: newNutrientPPM,
  };
}

/**
 * Calculate energy cost per hour
 */
export function calculateEnergyCost(
  lightingIntensity: number,
  hasEfficientLighting: boolean
): number {
  const baseCost =
    lightingIntensity * ENVIRONMENTAL_PARAMS.lighting.energyCostPerHour;
  const cost = hasEfficientLighting ? baseCost * 0.7 : baseCost;
  return Math.floor(cost);
}
