import React, { useState, useEffect } from 'react';
import { GameState, Identity, ScenarioID } from './types';
import { SCENARIOS } from './constants';
import SpectrumMixer from './components/SpectrumMixer';
import WorldMap from './components/WorldMap';
import ScenarioView from './components/ScenarioView';
import TheLounge from './components/TheLounge';
import Dashboard from './components/Dashboard';
import ProfileHUD from './components/ProfileHUD';
import { Button } from './components/UIComponents';

const INITIAL_STATE: GameState = {
  phase: 'SPLASH',
  identity: { label: 50, action: 50, pull: 50, heart: 50, vibeName: '', avatar: '😐' },
  battery: 100,
  xp: 0,
  scenariosCompleted: [],
  loungeVisits: 0,
  powerUpsOwned: [],
  powerUpsUsed: [],
  driversEncountered: {},
  frictionByAxis: { label: 0, action: 0, pull: 0, heart: 0 },
  activeScenarioId: null,
  history: []
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('navigating_spaces_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem('navigating_spaces_state', JSON.stringify(gameState));
  }, [gameState]);

  const startGame = () => {
    setGameState({ ...INITIAL_STATE, phase: 'MIXER' });
  };

  const fullReset = () => {
    if (window.confirm("Are you sure you want to restart? All progress will be lost.")) {
      // Create a fresh copy to ensure no reference artifacts
      const freshState: GameState = {
        phase: 'SPLASH',
        identity: { label: 50, action: 50, pull: 50, heart: 50, vibeName: '', avatar: '😐' },
        battery: 100,
        xp: 0,
        scenariosCompleted: [],
        loungeVisits: 0,
        powerUpsOwned: [],
        powerUpsUsed: [],
        driversEncountered: {},
        frictionByAxis: { label: 0, action: 0, pull: 0, heart: 0 },
        activeScenarioId: null,
        history: []
      };
      setGameState(freshState);
      localStorage.setItem('navigating_spaces_state', JSON.stringify(freshState));
    }
  };

  const handleIdentityComplete = (identity: Identity) => {
    setGameState(prev => ({
      ...prev,
      identity,
      phase: 'MAP'
    }));
  };

  const handleSelectLocation = (id: ScenarioID) => {
    setGameState(prev => ({
      ...prev,
      activeScenarioId: id,
      phase: 'SCENARIO'
    }));
  };

  const handleDrain = (amount: number) => {
    setGameState(prev => {
      const newBattery = Math.max(0, prev.battery - amount);
      if (newBattery === 0) {
        return { ...prev, battery: 0, phase: 'SUMMARY' };
      }
      return { ...prev, battery: newBattery };
    });
  };

  const handleScenarioResolve = (batteryChange: number, xpGain: number, driversCorrect: boolean) => {
    const scenario = SCENARIOS[gameState.activeScenarioId!];
    
    setGameState(prev => {
        const newDrivers = { ...prev.driversEncountered };
        scenario.correctDrivers.forEach(d => {
            newDrivers[d] = (newDrivers[d] || 0) + 1;
        });

        const newFriction = { ...prev.frictionByAxis };
        if (!driversCorrect) {
            scenario.relevantAxes.forEach(axis => {
                newFriction[axis] += 1;
            });
        }
        
        // Power Up Consumption Logic
        const newPowerUpsUsed = [...prev.powerUpsUsed];
        
        // Insight is consumed if it was owned and not yet used (single use per purchase)
        if (prev.powerUpsOwned.includes('Insight') && !newPowerUpsUsed.includes('Insight')) {
            newPowerUpsUsed.push('Insight');
        }

        // Shield is consumed ONLY if answer was wrong and shield was active
        if (!driversCorrect && prev.powerUpsOwned.includes('Shield') && !newPowerUpsUsed.includes('Shield')) {
            newPowerUpsUsed.push('Shield');
        }

        return {
            ...prev,
            battery: Math.min(100, Math.max(0, prev.battery + batteryChange)),
            xp: prev.xp + xpGain,
            scenariosCompleted: [...prev.scenariosCompleted, scenario.id],
            driversEncountered: newDrivers,
            frictionByAxis: newFriction,
            powerUpsUsed: newPowerUpsUsed,
            history: [...prev.history, { 
                scenarioId: scenario.id, 
                driversIdentified: driversCorrect, 
                batteryChange 
            }]
        };
    });
  };

  const returnToMap = () => {
     setGameState(prev => {
        if (prev.scenariosCompleted.length >= 5) { 
            return { ...prev, phase: 'SUMMARY' };
        }
        return { ...prev, phase: 'MAP', activeScenarioId: null };
     });
  };

  const handleLoungePurchase = (cost: number, type: string, effect: Partial<GameState>) => {
    setGameState(prev => ({
        ...prev,
        ...effect,
        powerUpsOwned: [...prev.powerUpsOwned, type as any],
    }));
  };

  // Determine if HUD should be visible
  const showHUD = gameState.phase === 'MAP' || gameState.phase === 'SCENARIO' || gameState.phase === 'LOUNGE';
  
  // Calculate active inventory for HUD
  const activePowerUps = gameState.powerUpsOwned.filter(p => 
      p !== 'Extra Battery' && !gameState.powerUpsUsed.includes(p)
  );

  return (
    <div className="min-h-screen font-sans bg-background text-text-primary overflow-x-hidden flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col">
        
        {gameState.phase !== 'SPLASH' && (
          <header className="flex justify-between items-center mb-6 opacity-50 text-xs uppercase tracking-widest">
            <span>Navigating Spaces</span>
            <span>Ch. 7: Diversity</span>
          </header>
        )}

        <main className="flex-1 flex flex-col justify-center">
          
          {gameState.phase === 'SPLASH' && (
            <div className="text-center space-y-8 animate-fadeIn">
              <h1 className="text-6xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-safe">
                Navigating<br/>Spaces
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary max-w-lg mx-auto">
                Explore the complexity of identity and social friction.
              </p>
              <Button onClick={startGame} className="text-xl px-12 py-4 shadow-[0_0_30px_rgba(167,139,250,0.4)]">
                Start Experience
              </Button>
            </div>
          )}

          {gameState.phase === 'MIXER' && (
            <SpectrumMixer onComplete={handleIdentityComplete} />
          )}

          {/* Map & Scenario Layout Wrapper */}
          {showHUD && (
             <div className="flex flex-col lg:flex-row gap-6 items-stretch h-full min-h-[600px]">
                 
                 {/* Main Content Area */}
                 <div className="flex-grow relative flex flex-col">
                    {gameState.phase === 'MAP' && (
                        <WorldMap 
                            gameState={gameState} 
                            onSelectLocation={handleSelectLocation}
                            onVisitLounge={() => setGameState(prev => ({ ...prev, phase: 'LOUNGE', loungeVisits: prev.loungeVisits + 1 }))}
                        />
                    )}

                    {gameState.phase === 'SCENARIO' && gameState.activeScenarioId && (
                        <div className="relative h-full flex flex-col">
                            <ScenarioView 
                                scenario={SCENARIOS[gameState.activeScenarioId]}
                                gameState={gameState}
                                onDrain={handleDrain}
                                onResolve={handleScenarioResolve}
                            />
                            {gameState.scenariosCompleted.includes(gameState.activeScenarioId) && (
                                <div className="mt-6 flex justify-center animate-fadeIn pb-6">
                                    <Button onClick={returnToMap} className="shadow-2xl text-xl px-10">
                                        Return to Map
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {gameState.phase === 'LOUNGE' && (
                        <TheLounge 
                            gameState={gameState}
                            onPurchase={handleLoungePurchase}
                            onExit={() => setGameState(prev => ({ ...prev, phase: 'MAP' }))}
                        />
                    )}
                 </div>

                 {/* Persistent HUD */}
                 <div className="lg:w-64 flex-shrink-0">
                     <ProfileHUD 
                        identity={gameState.identity} 
                        battery={gameState.battery}
                        xp={gameState.xp}
                        activePowerUps={activePowerUps}
                        className="h-full sticky top-4"
                     />
                 </div>
             </div>
          )}

          {gameState.phase === 'SUMMARY' && (
            <Dashboard 
                gameState={gameState}
                onReplay={startGame}
            />
          )}
        </main>
      </div>
      
      {/* Global Restart Footer */}
      {gameState.phase !== 'SPLASH' && (
          <footer className="w-full text-center py-6 border-t border-white/5 mt-auto relative z-50">
              <button 
                onClick={fullReset} 
                className="px-8 py-4 text-xs font-bold text-text-secondary hover:text-danger uppercase tracking-widest opacity-50 hover:opacity-100 transition-all hover:scale-105 active:scale-95"
              >
                  Restart Game
              </button>
          </footer>
      )}
    </div>
  );
};

export default App;