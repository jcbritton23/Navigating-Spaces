import React, { useState } from 'react';
import { GameState, DriverType } from '../types';
import { DRIVERS } from '../constants';
import { Button, Card, BatteryDisplay } from './UIComponents';

interface Props {
  gameState: GameState;
  onPurchase: (cost: number, type: string, effect: Partial<GameState>) => void;
  onExit: () => void;
}

const TheLounge: React.FC<Props> = ({ gameState, onPurchase, onExit }) => {
  const [currency, setCurrency] = useState(0);
  const [currentDriver, setCurrentDriver] = useState<DriverType>(DRIVERS[0].id);
  const [options, setOptions] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  React.useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = () => {
    const driver = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
    setCurrentDriver(driver.id);
    
    const allIncorrect = DRIVERS.flatMap(d => d.incorrectDefinitions);
    const wrong1 = allIncorrect[Math.floor(Math.random() * allIncorrect.length)];
    let wrong2 = allIncorrect[Math.floor(Math.random() * allIncorrect.length)];
    while (wrong2 === wrong1) wrong2 = allIncorrect[Math.floor(Math.random() * allIncorrect.length)];

    const newOptions = [driver.definition, wrong1, wrong2].sort(() => Math.random() - 0.5);
    setOptions(newOptions);
  };

  const handleGuess = (def: string) => {
    const driver = DRIVERS.find(d => d.id === currentDriver);
    if (driver && def === driver.definition) {
      setCurrency(c => c + 1);
      setMessage("Correct! +1 Match");
      generateQuestion();
    } else {
      setMessage("Try again!");
    }
    setTimeout(() => setMessage(''), 1000);
  };

  const buyPowerUp = (type: string, cost: number, batteryBoost: number = 0) => {
    if (currency < cost) return;
    if (gameState.powerUpsOwned.includes(type as any) && type !== 'Community Connection' && type !== 'Deep Rest') return;

    let effect: Partial<GameState> = {};
    if (batteryBoost > 0) {
        effect.battery = Math.min(100, gameState.battery + batteryBoost);
    }
    
    onPurchase(cost, type, effect);
    setCurrency(c => c - cost);
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-4 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center text-safe bg-black/30 p-4 rounded-xl border border-safe/20">
        <div>
            <h2 className="text-3xl font-display font-bold">The Lounge</h2>
            <p className="text-sm opacity-80">Safe Space • Recharge • Learn</p>
        </div>
        <div className="text-right">
             <div className="text-2xl font-mono font-bold">{currency} Matches</div>
             <BatteryDisplay value={gameState.battery} />
        </div>
      </div>

      {/* 1. Training Simulation (Top) */}
      <div className="bg-gradient-to-br from-black/40 to-[#2a2a40] rounded-2xl p-8 border border-white/10 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🧠</div>
            <div className="relative z-10">
                <h3 className="uppercase tracking-widest text-sm font-bold mb-6 text-primary border-b border-white/5 pb-2">Training Simulation</h3>
                
                <div className="text-center mb-8">
                    <p className="text-xs text-text-secondary mb-2 uppercase tracking-wide">Identify the meaning of</p>
                    <p className="text-3xl font-bold text-white drop-shadow-md">{currentDriver}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
                    {options.map((opt, i) => (
                        <button 
                            key={i}
                            onClick={() => handleGuess(opt)}
                            className="w-full p-4 text-md text-left bg-white/5 hover:bg-primary/20 hover:border-primary/50 border border-transparent rounded-xl transition-all duration-200"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="h-8 text-center mt-4 text-safe font-bold text-lg">{message}</div>
            </div>
      </div>

      {/* 2. Shop (Below) */}
      <div className="glass-panel p-8 rounded-2xl border-t-4 border-safe/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="uppercase tracking-widest text-sm font-bold text-white">Power-Up Shop</h3>
            <span className="text-xs text-text-secondary">Earn matches above to purchase</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Self-Care Option */}
            <Card 
                onClick={() => buyPowerUp('Community Connection', 1, 15)} 
                className="flex flex-col gap-2 items-center text-center hover:bg-safe/5 border border-safe/30 bg-safe/5"
            >
                <div className="text-3xl mb-1">🫂</div>
                <div className="font-bold text-safe">Community Connection</div>
                <div className="text-[10px] text-gray-300">Co-regulate with a friend.<br/>+15 Battery</div>
                <div className="mt-auto pt-2 bg-black/30 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/10">1 Match</div>
            </Card>

            {/* Standard Battery Item */}
            <Card 
                onClick={() => buyPowerUp('Extra Battery', 2, 25)} 
                className={`flex flex-col gap-2 items-center text-center hover:bg-safe/5 ${gameState.powerUpsOwned.includes('Extra Battery') ? 'opacity-40 pointer-events-none' : ''}`}
            >
                <div className="text-3xl mb-1">⚡</div>
                <div className="font-bold text-white">Deep Rest</div>
                <div className="text-[10px] text-gray-300">Full recharge.<br/>+25 Battery</div>
                <div className="mt-auto pt-2 bg-black/30 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/10">2 Matches</div>
            </Card>
            
            <Card 
                onClick={() => buyPowerUp('Shield', 2)}
                className={`flex flex-col gap-2 items-center text-center hover:bg-safe/5 ${gameState.powerUpsOwned.includes('Shield') ? 'opacity-40 pointer-events-none' : ''}`}
            >
                <div className="text-3xl mb-1">🛡️</div>
                <div className="font-bold text-white">Safety Net</div>
                <div className="text-[10px] text-gray-300">Block 1 Battery Drain<br/>(Passive)</div>
                <div className="mt-auto pt-2 bg-black/30 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/10">2 Matches</div>
            </Card>
            
            <Card 
                onClick={() => buyPowerUp('Insight', 2)}
                className={`flex flex-col gap-2 items-center text-center hover:bg-safe/5 ${gameState.powerUpsOwned.includes('Insight') ? 'opacity-40 pointer-events-none' : ''}`}
            >
                <div className="text-3xl mb-1">👁️</div>
                <div className="font-bold text-primary">Insight</div>
                <div className="text-[10px] text-gray-300">Narrow down answers<br/>(One Use)</div>
                <div className="mt-auto pt-2 bg-black/30 px-3 py-1 rounded-full text-xs font-mono font-bold border border-white/10">2 Matches</div>
            </Card>
          </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onExit} variant="secondary" className="px-12">Return to Map</Button>
      </div>
    </div>
  );
};

export default TheLounge;