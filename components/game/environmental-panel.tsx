'use client';

import { Droplet, Activity, Beaker, Sun, Plus, Minus, RefreshCw, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ENVIRONMENTAL_PARAMS } from '@/lib/constants';

interface EnvironmentalPanelProps {
  environment: {
    waterLevel: number;
    phLevel: number;
    nutrientPPM: number;
    lightingIntensity: number;
  } | null;
  onAdjust: (action: string, value?: number) => void;
}

export default function EnvironmentalPanel({
  environment,
  onAdjust,
}: EnvironmentalPanelProps) {
  if (!environment) return null;

  const getStatusColor = (value: number, optimal: { min: number; max: number }) => {
    if (value >= optimal.min && value <= optimal.max) return 'text-emerald-400';
    if (value >= optimal.min * 0.8 && value <= optimal.max * 1.2) return 'text-warning-orange';
    return 'text-red-400';
  };
  
  const getStatusGradient = (value: number, optimal: { min: number; max: number }) => {
    if (value >= optimal.min && value <= optimal.max) return 'from-emerald-500 to-green-500';
    if (value >= optimal.min * 0.8 && value <= optimal.max * 1.2) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Gauge className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-orbitron font-bold text-gradient-rainbow">Environment Control</h3>
      </div>

      <div className="space-y-5">
        {/* Water Level */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/10 border border-blue-500/20">
          <div className="shimmer opacity-20" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-neon-blue" />
                <span className="text-sm font-medium uppercase tracking-wide text-gray-300">Water Level</span>
              </div>
              <span className={`text-xl font-orbitron font-bold ${getStatusColor(environment.waterLevel, ENVIRONMENTAL_PARAMS.water.optimal)}`}>
                {environment.waterLevel?.toFixed(1) ?? 0}%
              </span>
            </div>
            <div className="h-3 bg-gray-900/60 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full bg-gradient-to-r ${getStatusGradient(environment.waterLevel, ENVIRONMENTAL_PARAMS.water.optimal)} transition-all duration-500`}
                style={{ width: `${environment.waterLevel ?? 0}%` }}
              >
                <div className="shimmer" />
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onAdjust('refill_water')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-orbitron border-0 glow-blue"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refill Water (+{ENVIRONMENTAL_PARAMS.water.refillAmount}%) · {ENVIRONMENTAL_PARAMS.water.refillCost} $GAIA
            </Button>
          </div>
        </div>

        {/* pH Level */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-purple-500/20">
          <div className="shimmer opacity-20" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon-purple" />
                <span className="text-sm font-medium uppercase tracking-wide text-gray-300">pH Level</span>
              </div>
              <span className={`text-xl font-orbitron font-bold ${getStatusColor(environment.phLevel, ENVIRONMENTAL_PARAMS.ph.optimal)}`}>
                {environment.phLevel?.toFixed(2) ?? 0}
              </span>
            </div>
            <div className="text-xs text-gray-400 text-center px-2 py-1 bg-gray-900/40 rounded-lg border border-white/5">
              Optimal Range: {ENVIRONMENTAL_PARAMS.ph.optimal.min} - {ENVIRONMENTAL_PARAMS.ph.optimal.max}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onAdjust('ph_down')}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-orbitron border-0"
              >
                <Minus className="w-4 h-4 mr-1" />
                pH Down
              </Button>
              <Button
                size="sm"
                onClick={() => onAdjust('ph_up')}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-orbitron border-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                pH Up
              </Button>
            </div>
          </div>
        </div>

        {/* Nutrient PPM */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20">
          <div className="shimmer opacity-20" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-neon-green" />
                <span className="text-sm font-medium uppercase tracking-wide text-gray-300">Nutrients</span>
              </div>
              <span className={`text-xl font-orbitron font-bold ${getStatusColor(environment.nutrientPPM, ENVIRONMENTAL_PARAMS.nutrient.optimal)}`}>
                {environment.nutrientPPM ?? 0} <span className="text-sm text-gray-500">PPM</span>
              </span>
            </div>
            <div className="h-3 bg-gray-900/60 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full bg-gradient-to-r ${getStatusGradient(environment.nutrientPPM, ENVIRONMENTAL_PARAMS.nutrient.optimal)} transition-all duration-500`}
                style={{
                  width: `${((environment.nutrientPPM ?? 0) / ENVIRONMENTAL_PARAMS.nutrient.max) * 100}%`,
                }}
              >
                <div className="shimmer" />
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onAdjust('add_nutrients')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-orbitron border-0 glow-green"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Nutrients (+{ENVIRONMENTAL_PARAMS.nutrient.addAmount} PPM) · {ENVIRONMENTAL_PARAMS.nutrient.addCost} $GAIA
            </Button>
          </div>
        </div>

        {/* Lighting Intensity */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-yellow-900/20 to-amber-900/10 border border-yellow-500/20">
          <div className="shimmer opacity-20" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-energy-yellow" />
                <span className="text-sm font-medium uppercase tracking-wide text-gray-300">Lighting</span>
              </div>
              <span className="text-xl font-orbitron font-bold text-energy-yellow">
                {environment.lightingIntensity ?? 0}%
              </span>
            </div>
            <Slider
              value={[environment.lightingIntensity ?? 80]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => onAdjust('adjust_lighting', value[0])}
              className="cursor-pointer [&_[role=slider]]:bg-yellow-500 [&_[role=slider]]:border-yellow-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-yellow-500/50"
            />
            <div className="text-xs text-gray-400 text-center px-2 py-1 bg-gray-900/40 rounded-lg border border-white/5">
              ⚡ Higher intensity = Faster growth + Higher energy cost
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
