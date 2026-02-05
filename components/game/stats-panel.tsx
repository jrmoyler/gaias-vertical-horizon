'use client';

import { Coins, Zap, Leaf, TrendingUp } from 'lucide-react';

interface StatsPanelProps {
  gaiaBalance: number;
  energyCostPerHour: number;
  activeCrops: number;
}

export default function StatsPanel({
  gaiaBalance,
  energyCostPerHour,
  activeCrops,
}: StatsPanelProps) {
  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-orbitron font-bold text-gradient-rainbow">Farm Statistics</h3>
      </div>

      <div className="space-y-4">
        {/* GAIA Balance */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-yellow-900/20 to-amber-900/10 border border-yellow-500/20">
          <div className="shimmer opacity-30" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20 glow-yellow">
                <Coins className="w-6 h-6 text-energy-yellow" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">GAIA Balance</div>
                <div className="text-2xl font-orbitron font-bold text-energy-yellow mt-1">
                  {gaiaBalance?.toLocaleString() ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Cost */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-blue-900/20 to-cyan-900/10 border border-blue-500/20">
          <div className="shimmer opacity-30" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 glow-blue">
                <Zap className="w-6 h-6 text-neon-blue" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Energy Cost</div>
                <div className="text-xl font-orbitron font-bold text-neon-blue mt-1">
                  {energyCostPerHour?.toFixed(1) ?? 0} <span className="text-sm text-gray-500">$GAIA/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Crops */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20">
          <div className="shimmer opacity-30" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20 glow-green">
                <Leaf className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Active Crops</div>
                <div className="text-xl font-orbitron font-bold text-neon-green mt-1">
                  {activeCrops ?? 0} <span className="text-sm text-gray-500">/ 9</span>
                </div>
              </div>
            </div>
            {/* Progress indicator */}
            <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${((activeCrops ?? 0) / 9) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
