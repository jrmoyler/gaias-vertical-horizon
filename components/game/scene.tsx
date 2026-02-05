'use client';

import { Sparkles, Sprout, Leaf, Droplets } from 'lucide-react';

interface SceneProps {
  rackUnits: Array<{
    id: string;
    slotIndex: number;
    isEmpty: boolean;
    crop?: {
      id: string;
      cropType: string;
      growthStage: string;
      progressPercent: number;
    } | null;
  }>;
  onRackUnitClick: (rackUnit: any) => void;
  selectedRackId: string | null;
}

export default function Scene({
  rackUnits,
  onRackUnitClick,
  selectedRackId,
}: SceneProps) {
  // Ensure rackUnits is always an array
  const safeRackUnits = Array.isArray(rackUnits) ? rackUnits : [];
  
  // Get gradient color based on growth stage
  const getPlantGradient = (growthStage: string) => {
    switch (growthStage) {
      case 'seed': return 'from-amber-900 to-amber-950';
      case 'germination': return 'from-lime-500 to-lime-700';
      case 'vegetative': return 'from-green-400 to-green-600';
      case 'flowering': return 'from-yellow-400 to-amber-500';
      case 'harvest_ready': return 'from-emerald-400 to-green-500';
      default: return 'from-gray-700 to-gray-800';
    }
  };
  
  // Get icon based on growth stage
  const getPlantIcon = (growthStage: string, progressPercent: number) => {
    switch (growthStage) {
      case 'seed':
        return <Droplets className="w-6 h-6" />;
      case 'germination':
        return <Sprout className="w-7 h-7" />;
      case 'vegetative':
      case 'flowering':
      case 'harvest_ready':
        return <Leaf className="w-8 h-8" />;
      default:
        return <Sprout className="w-6 h-6" />;
    }
  };
  
  // Get height class based on progress
  const getPlantHeightClass = (progressPercent: number) => {
    if (progressPercent < 25) return 'h-8';
    if (progressPercent < 50) return 'h-12';
    if (progressPercent < 75) return 'h-16';
    return 'h-20';
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-orbitron font-bold text-gradient-rainbow mb-2">
            Vertical Farm Tower
          </h2>
          <p className="text-sm text-gray-400 font-light">Select a rack to manage your crops</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-4 lg:gap-6">
          {safeRackUnits.map((rackUnit) => {
            const isSelected = selectedRackId === rackUnit.id;
            const hasCrop = !rackUnit.isEmpty && rackUnit.crop;
            const isHarvestReady = rackUnit.crop?.growthStage === 'harvest_ready';

            return (
              <button
                key={rackUnit.id}
                onClick={() => onRackUnitClick(rackUnit)}
                className={`
                  relative aspect-square rounded-2xl transition-all duration-300 group
                  glass hover:glass-strong
                  ${isSelected 
                    ? 'border-2 border-neon-green glow-green scale-105' 
                    : 'border border-gray-700/50 hover:border-neon-green/50'
                  }
                  ${isHarvestReady ? 'pulse-green' : ''}
                  transform hover:scale-105 hover:-translate-y-1
                `}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className={`shimmer ${isSelected || isHarvestReady ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </div>

                {/* Rack number */}
                <div className={`
                  absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-orbitron font-bold
                  ${isSelected ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-800/60 text-gray-400'}
                  backdrop-blur-sm border border-white/10 z-20
                `}>
                  RACK #{rackUnit.slotIndex + 1}
                </div>

                {/* Plant visualization */}
                <div className="w-full h-full flex flex-col items-center justify-end p-6 relative z-10">
                  {hasCrop && rackUnit.crop ? (
                    <>
                      {/* Plant container with glow */}
                      <div className={`
                        flex flex-col items-center justify-end transition-all duration-700
                        ${getPlantHeightClass(rackUnit.crop.progressPercent)}
                        relative
                      `}>
                        {/* Plant glow */}
                        <div className={`
                          absolute inset-0 rounded-full blur-xl opacity-50
                          bg-gradient-to-b ${getPlantGradient(rackUnit.crop.growthStage)}
                        `} />
                        
                        {/* Plant icon */}
                        <div className={`
                          relative z-10 p-3 rounded-full
                          bg-gradient-to-br ${getPlantGradient(rackUnit.crop.growthStage)}
                          ${isHarvestReady ? 'animate-float' : ''}
                        `}>
                          {getPlantIcon(rackUnit.crop.growthStage, rackUnit.crop.progressPercent)}
                        </div>
                      </div>
                      
                      {/* Progress bar with gradient */}
                      <div className="w-full mt-4 bg-gray-900/60 rounded-full h-2.5 overflow-hidden border border-white/10 backdrop-blur-sm">
                        <div
                          className={`h-full transition-all duration-500 relative overflow-hidden ${
                            isHarvestReady 
                              ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400' 
                              : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600'
                          }`}
                          style={{ width: `${rackUnit.crop.progressPercent}%` }}
                        >
                          {/* Animated shine on progress bar */}
                          <div className="absolute inset-0 shimmer" />
                        </div>
                      </div>
                      
                      {/* Progress text */}
                      <div className={`
                        text-sm mt-2 font-orbitron font-bold
                        ${isHarvestReady ? 'text-gradient-green' : 'text-neon-blue'}
                      `}>
                        {Math.round(rackUnit.crop.progressPercent)}%
                      </div>

                      {/* Stage indicator */}
                      <div className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
                        {rackUnit.crop.growthStage.replace('_', ' ')}
                      </div>

                      {/* Harvest ready indicator */}
                      {isHarvestReady && (
                        <div className="absolute top-3 right-3 animate-pulse z-20">
                          <div className="relative">
                            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md" />
                            <Sparkles className="w-6 h-6 text-emerald-400 relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
                        <Sprout className="w-8 h-8 text-gray-600" />
                      </div>
                      <div className="text-gray-500 text-sm font-medium">Empty Slot</div>
                    </div>
                  )}
                </div>

                {/* Selected indicator glow */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-neon-green/50 animate-pulse pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
