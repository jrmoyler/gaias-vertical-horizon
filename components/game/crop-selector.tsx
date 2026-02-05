'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sprout, Clock, Coins, TrendingUp, AlertCircle } from 'lucide-react';
import { CROP_TYPES, type CropTypeKey } from '@/lib/constants';
import Image from 'next/image';

interface CropSelectorProps {
  onPlant: (cropType: CropTypeKey) => void;
  disabled: boolean;
}

export default function CropSelector({ onPlant, disabled }: CropSelectorProps) {
  const [selectedCrop, setSelectedCrop] = useState<CropTypeKey | null>(null);

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sprout className="w-5 h-5 text-neon-green" />
        <h3 className="text-lg font-orbitron font-bold text-gradient-rainbow">Crop Selection</h3>
      </div>

      {/* Warning message */}
      {disabled && (
        <div className="mb-4 p-3 rounded-xl bg-yellow-900/20 border border-yellow-500/30 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-warning-orange flex-shrink-0" />
          <p className="text-sm text-gray-300 font-medium">
            Select an empty rack unit to plant crops
          </p>
        </div>
      )}

      {/* Crop cards */}
      <div className="space-y-3">
        {Object.entries(CROP_TYPES).map(([key, crop]) => {
          const isSelected = selectedCrop === key;
          return (
            <button
              key={key}
              className={`
                w-full relative overflow-hidden rounded-xl p-4 transition-all duration-300 group
                ${
                  isSelected
                    ? 'glass-strong border-2 border-neon-green glow-green scale-[1.02]'
                    : 'glass border border-gray-700/50 hover:border-neon-green/50 hover:scale-[1.01]'
                }
              `}
              onClick={() => setSelectedCrop(key as CropTypeKey)}
            >
              {/* Shimmer effect */}
              <div className={`shimmer ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

              <div className="relative z-10 flex items-center gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/10">
                  <Image
                    src={crop.image}
                    alt={crop.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {/* Overlay gradient */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
                    ${isSelected ? 'opacity-30' : 'opacity-50'}
                  `} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <h4 className={`
                    font-orbitron font-bold text-base leading-tight mb-2
                    ${isSelected ? 'text-gradient-green' : 'text-white'}
                  `}>
                    {crop.name}
                  </h4>
                  
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                    {crop.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-2">
                    <div className={`
                      flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
                      ${isSelected ? 'bg-blue-500/20 text-neon-blue' : 'bg-gray-800/60 text-gray-300'}
                    `}>
                      <Clock className="w-3.5 h-3.5" />
                      {Math.floor(crop.growthTimeSeconds / 60)}m
                    </div>
                    
                    <div className={`
                      flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
                      ${isSelected ? 'bg-yellow-500/20 text-energy-yellow' : 'bg-gray-800/60 text-gray-300'}
                    `}>
                      <Coins className="w-3.5 h-3.5" />
                      {crop.seedCost}
                    </div>
                    
                    <div className={`
                      flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
                      ${isSelected ? 'bg-green-500/20 text-neon-green' : 'bg-gray-800/60 text-gray-300'}
                    `}>
                      <TrendingUp className="w-3.5 h-3.5" />
                      {crop.basePrice}
                    </div>
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md" />
                      <div className="relative w-8 h-8 rounded-full bg-neon-green flex items-center justify-center">
                        <Sprout className="w-5 h-5 text-gray-900" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Plant button */}
      <Button
        className={`
          w-full mt-6 font-orbitron font-bold py-6 text-base
          ${
            disabled || !selectedCrop
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white glow-green'
          }
          border-0
        `}
        onClick={() => selectedCrop && onPlant(selectedCrop)}
        disabled={disabled || !selectedCrop}
      >
        {selectedCrop ? (
          <>
            <Sprout className="w-5 h-5 mr-2" />
            Plant {CROP_TYPES[selectedCrop].name}
          </>
        ) : (
          'Select a Crop to Plant'
        )}
      </Button>
    </div>
  );
}
