'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StatsPanel from './stats-panel';
import EnvironmentalPanel from './environmental-panel';
import CropSelector from './crop-selector';
import UpgradesShop from './upgrades-shop';
import { Sparkles, Info } from 'lucide-react';
import { GAME_CONFIG, type CropTypeKey, type UpgradeTypeKey } from '@/lib/constants';
import { toast } from 'react-hot-toast';

// Dynamically import Scene to avoid SSR issues with Three.js
const Scene = dynamic(() => import('./scene'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-lg">
      <div className="text-white">Loading 3D Scene...</div>
    </div>
  ),
});

interface GameState {
  player: {
    id: string;
    gaiaBalance: number;
    energyCostPerHour: number;
    rackUnits: Array<{
      id: string;
      slotIndex: number;
      isEmpty: boolean;
      crop?: {
        id: string;
        cropType: string;
        growthStage: string;
        progressPercent: number;
        environmentalScore: number;
      } | null;
    }>;
    environment: {
      id: string;
      waterLevel: number;
      phLevel: number;
      nutrientPPM: number;
      lightingIntensity: number;
    } | null;
    upgrades: Array<{
      upgradeType: string;
      level: number;
    }>;
  } | null;
}

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState>({ player: null });
  const [selectedRackUnit, setSelectedRackUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    try {
      const response = await fetch('/api/game/state');
      if (!response.ok) throw new Error('Failed to fetch game state');
      const data = await response.json();
      setGameState(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game state:', error);
      toast.error('Failed to load game state');
    }
  }, []);

  // Run game tick
  const runTick = useCallback(async () => {
    if (!gameState?.player?.id) return;

    try {
      const response = await fetch('/api/game/tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: gameState.player.id }),
      });

      if (!response.ok) throw new Error('Tick failed');
      
      // Refresh game state after tick
      await fetchGameState();
    } catch (error) {
      console.error('Error running tick:', error);
    }
  }, [gameState?.player?.id, fetchGameState]);

  // Initialize game
  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  // Start game loop
  useEffect(() => {
    if (!gameState?.player?.id) return;

    // Start tick interval
    tickIntervalRef.current = setInterval(() => {
      runTick();
    }, GAME_CONFIG.TICK_INTERVAL_MS);

    // Start autosave interval
    autosaveIntervalRef.current = setInterval(() => {
      // Auto-save is handled by database updates
      toast.success('Game auto-saved', { duration: 2000 });
    }, GAME_CONFIG.AUTOSAVE_INTERVAL_MS);

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      if (autosaveIntervalRef.current) clearInterval(autosaveIntervalRef.current);
    };
  }, [gameState?.player?.id, runTick]);

  // Plant crop
  const handlePlant = async (cropType: CropTypeKey) => {
    if (!selectedRackUnit || !gameState?.player?.id) return;

    try {
      const response = await fetch('/api/game/plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rackUnitId: selectedRackUnit.id,
          cropType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to plant crop');
      }

      toast.success(`Planted ${cropType}!`);
      setSelectedRackUnit(null);
      await fetchGameState();
    } catch (error: any) {
      console.error('Error planting crop:', error);
      toast.error(error?.message ?? 'Failed to plant crop');
    }
  };

  // Harvest crop
  const handleHarvest = async () => {
    if (!selectedRackUnit?.crop || selectedRackUnit.crop.growthStage !== 'harvest_ready') return;

    try {
      const response = await fetch('/api/game/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropId: selectedRackUnit.crop.id }),
      });

      if (!response.ok) throw new Error('Failed to harvest');

      const data = await response.json();
      toast.success(
        `Harvested! Grade: ${data.qualityGrade} (+${data.harvestValue} $GAIA)`,
        { duration: 4000 }
      );
      setSelectedRackUnit(null);
      await fetchGameState();
    } catch (error) {
      console.error('Error harvesting:', error);
      toast.error('Failed to harvest crop');
    }
  };

  // Adjust environment
  const handleEnvironmentAdjust = async (action: string, value?: number) => {
    if (!gameState?.player?.id) return;

    try {
      const response = await fetch('/api/game/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: gameState.player.id,
          action,
          intensity: value,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to adjust environment');
      }

      await fetchGameState();
    } catch (error: any) {
      console.error('Error adjusting environment:', error);
      toast.error(error?.message ?? 'Failed to adjust environment');
    }
  };

  // Purchase upgrade
  const handleUpgradePurchase = async (upgradeType: UpgradeTypeKey) => {
    if (!gameState?.player?.id) return;

    try {
      const response = await fetch('/api/game/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: gameState.player.id,
          upgradeType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to purchase upgrade');
      }

      toast.success('Upgrade purchased!');
      await fetchGameState();
    } catch (error: any) {
      console.error('Error purchasing upgrade:', error);
      toast.error(error?.message ?? 'Failed to purchase upgrade');
    }
  };

  // Handle rack unit click
  const handleRackUnitClick = (rackUnit: any) => {
    setSelectedRackUnit(rackUnit);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading Gaia's Vertical Horizon...</div>
      </div>
    );
  }

  const activeCrops = gameState?.player?.rackUnits?.filter((ru) => !ru.isEmpty)?.length ?? 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-blue-900/20 to-purple-900/20" />
        <div className="shimmer opacity-20" />
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 glow-green">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-orbitron font-black text-gradient-rainbow">
                  Gaia's Vertical Horizon
                </h1>
                <p className="text-sm text-gray-400 font-medium mt-1">Revolutionary Farming Experience</p>
              </div>
            </div>
            <Button
              className="glass-strong border border-white/20 hover:border-neon-cyan/50 px-6 py-3 font-orbitron"
              onClick={() => {
                toast(
                  'Manage your vertical farm! Click racks to plant/harvest. Maintain environmental parameters for best quality.',
                  { duration: 5000, icon: <Info className="w-5 h-5" /> }
                );
              }}
            >
              <Info className="w-4 h-4 mr-2" />
              How to Play
            </Button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Stats & Environment */}
          <div className="space-y-4">
            <StatsPanel
              gaiaBalance={gameState?.player?.gaiaBalance ?? 0}
              energyCostPerHour={gameState?.player?.energyCostPerHour ?? 0}
              activeCrops={activeCrops}
            />
            <EnvironmentalPanel
              environment={gameState?.player?.environment ?? null}
              onAdjust={handleEnvironmentAdjust}
            />
          </div>

          {/* Center - Visualization */}
          <div className="lg:col-span-1">
            <div className="glass-strong border border-white/10 rounded-2xl overflow-hidden" style={{ height: '600px' }}>
              <Scene
                rackUnits={gameState?.player?.rackUnits ?? []}
                onRackUnitClick={handleRackUnitClick}
                selectedRackId={selectedRackUnit?.id ?? null}
              />
            </div>

            {/* Selected Rack Info */}
            {selectedRackUnit && (
              <div className="mt-4 glass-strong rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                <div className="shimmer opacity-20" />
                <div className="relative z-10">
                  <h3 className="text-xl font-orbitron font-bold text-gradient-rainbow mb-4">
                    Rack Unit #{selectedRackUnit.slotIndex + 1}
                  </h3>
                  {selectedRackUnit.isEmpty ? (
                    <p className="text-gray-400 text-sm font-medium">🌱 Empty slot - Ready to plant</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-900/20 to-cyan-900/10 border border-blue-500/20">
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Crop</span>
                        <span className="font-orbitron font-bold text-neon-blue">{selectedRackUnit.crop?.cropType}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-pink-900/10 border border-purple-500/20">
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Stage</span>
                        <span className="font-orbitron font-bold text-neon-purple">{selectedRackUnit.crop?.growthStage?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-900/20 to-emerald-900/10 border border-green-500/20">
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Progress</span>
                        <span className="font-orbitron font-bold text-neon-green">{Math.floor(selectedRackUnit.crop?.progressPercent ?? 0)}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-900/20 to-amber-900/10 border border-yellow-500/20">
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Quality</span>
                        <span className="font-orbitron font-bold text-energy-yellow">{Math.floor(selectedRackUnit.crop?.environmentalScore ?? 0)}/100</span>
                      </div>
                      {selectedRackUnit.crop?.growthStage === 'harvest_ready' && (
                        <Button
                          onClick={handleHarvest}
                          className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-orbitron border-0 glow-green py-6 text-base"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Harvest Crop Now
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Actions */}
          <div className="space-y-4">
            <CropSelector
              onPlant={handlePlant}
              disabled={!selectedRackUnit || !selectedRackUnit.isEmpty}
            />
            <UpgradesShop
              upgrades={gameState?.player?.upgrades ?? []}
              onPurchase={handleUpgradePurchase}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
