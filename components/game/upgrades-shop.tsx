'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Sparkles } from 'lucide-react';
import { UPGRADES, type UpgradeTypeKey } from '@/lib/constants';
import * as LucideIcons from 'lucide-react';

interface UpgradesShopProps {
  upgrades: Array<{
    upgradeType: string;
    level: number;
  }>;
  onPurchase: (upgradeType: UpgradeTypeKey) => void;
}

export default function UpgradesShop({ upgrades, onPurchase }: UpgradesShopProps) {
  const hasUpgrade = (upgradeType: UpgradeTypeKey) => {
    return upgrades?.some((u) => u.upgradeType === upgradeType) ?? false;
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)?.[iconName];
    return Icon ? <Icon className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6" />;
  };

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="w-5 h-5 text-neon-purple" />
        <h3 className="text-lg font-orbitron font-bold text-gradient-rainbow">Upgrades Market</h3>
      </div>

      <div className="space-y-4">
        {Object.entries(UPGRADES).map(([key, upgrade]) => {
          const purchased = hasUpgrade(key as UpgradeTypeKey);
          return (
            <div
              key={key}
              className={`
                relative overflow-hidden rounded-xl p-4 transition-all duration-300
                ${
                  purchased
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-2 border-green-500/40'
                    : 'glass hover:glass-strong border border-gray-700/50 hover:border-neon-purple/50 group'
                }
              `}
            >
              {/* Shimmer effect */}
              {!purchased && <div className="shimmer opacity-0 group-hover:opacity-100" />}
              
              {/* Purchased glow */}
              {purchased && (
                <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
              )}

              <div className="relative z-10 flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  p-3 rounded-xl flex-shrink-0
                  ${
                    purchased
                      ? 'bg-green-500/20 text-neon-green glow-green'
                      : 'bg-purple-500/20 text-neon-purple group-hover:glow-purple'
                  }
                `}>
                  {getIcon(upgrade.icon)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-orbitron font-bold text-white text-base leading-tight">
                      {upgrade.name}
                    </h4>
                    {purchased && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg border border-green-500/30">
                        <Check className="w-4 h-4 text-neon-green" />
                        <Sparkles className="w-3 h-3 text-neon-green" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {upgrade.description}
                  </p>

                  {!purchased && (
                    <Button
                      size="sm"
                      onClick={() => onPurchase(key as UpgradeTypeKey)}
                      className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-orbitron border-0 glow-purple"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Purchase · {upgrade.cost} $GAIA
                    </Button>
                  )}
                  
                  {purchased && (
                    <div className="mt-3 text-sm font-orbitron font-bold text-gradient-green flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      ACTIVE
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
