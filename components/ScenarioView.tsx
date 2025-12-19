
import React, { useState, useEffect, useRef } from 'react';
import { GameState, ScenarioData, DriverType, CardType } from '../types';
import { Button, Card, BatteryDisplay } from './UIComponents';
import { DRIVERS, CARD_DESCRIPTIONS } from '../constants';

interface Props {
  scenario: ScenarioData & { emojis?: string };
  gameState: GameState;
  onResolve: (batteryChange: number, xpGain: number, driversCorrect: boolean) => void;
  onDrain: (amount: number) => void;
}

type Step = 'INTRO' | 'SELECT_CARD' | 'IDENTIFY_DRIVER' | 'OUTCOME';

const CARD_STYLES: Record<CardType, string> = {
    Humor: "bg-amber-500 hover:bg-amber-400 text-white border-amber-300 ring-amber-500/50",
    Facts: "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-300 ring-cyan-500/50",
    Deflect: "bg-slate-600 hover:bg-slate-500 text-white border-slate-400 ring-slate-500/50",
    Vulnerability: "bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-fuchsia-300 ring-fuchsia-500/50"
};

const ScenarioView: React.FC<Props> = ({ scenario, gameState, onResolve, onDrain }) => {
  const [step, setStep] = useState<Step>('INTRO');
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [selectedDrivers, setSelectedDrivers] = useState<DriverType[]>([]);
  const [driversCorrect, setDriversCorrect] = useState<boolean | null>(null);
  const [outcomeStats, setOutcomeStats] = useState<{
      energyBase: number;
      energyBonus: number;
      xpBase: number;
      xpPattern: number;
      xpStrategy: number;
      totalEnergy: number;
      totalXp: number;
      shielded: boolean;
      privileged: boolean;
  } | null>(null);
  
  // Fix: Provided initial value to useRef to satisfy "Expected 1 arguments" error
  const drainInterval = useRef<number | undefined>(undefined);
  
  // Privilege Check: Deviation < 20 means your identity aligns with the "Conventional Standard" in this space.
  // Fix: Added 0 as first argument to Math.max to ensure at least one argument is passed even if axes are empty
  const deviation = Math.max(0, ...scenario.relevantAxes.map(axis => Math.abs(gameState.identity[axis])));
  const isPrivileged = deviation < 20 && !!scenario.privilegedSetupText;

  // Power-up States
  const hasShield = gameState.powerUpsOwned.includes('Shield') && !gameState.powerUpsUsed.includes('Shield');
  const hasInsight = gameState.powerUpsOwned.includes('Insight') && !gameState.powerUpsUsed.includes('Insight');

  useEffect(() => {
    // Friction drain happens in real-time during the interaction
    const frictionScore = (deviation * scenario.rigidity) / 100;
    const isHighTension = !isPrivileged && frictionScore > 20;
    const drainAmount = isPrivileged ? 0.05 : (isHighTension ? 0.6 : 0.2); 
    
    if (step !== 'OUTCOME') {
        drainInterval.current = window.setInterval(() => {
            onDrain(drainAmount);
        }, 1000);
    }
    return () => clearInterval(drainInterval.current);
  }, [step, scenario, deviation, isPrivileged, onDrain]);

  const handleDriverToggle = (driverId: DriverType) => {
    if (selectedDrivers.includes(driverId)) {
      setSelectedDrivers(prev => prev.filter(d => d !== driverId));
    } else {
      const maxSelect = scenario.isChallenge ? 2 : 1;
      if (selectedDrivers.length < maxSelect) {
        setSelectedDrivers(prev => [...prev, driverId]);
      }
    }
  };

  const finalizeTurn = () => {
    const required = scenario.correctDrivers;
    const allCorrect = required.every(d => selectedDrivers.includes(d)) && selectedDrivers.length === required.length;
    const bestCardUsed = selectedCard && scenario.bestCards ? scenario.bestCards.includes(selectedCard) : false;

    let energyBase = 0;
    let energyBonus = 0;
    let xpBase = 5; // Guaranteed for completion
    let xpPattern = 0;
    let xpStrategy = 0;
    let shielded = false;

    if (allCorrect) {
        energyBase = scenario.isChallenge ? 25 : 15;
        xpPattern = scenario.isChallenge ? 15 : 10;
        if (bestCardUsed) {
            energyBonus = 5;
            xpStrategy = 5;
        }
    } else {
        // Penalty for wrong choice
        const baseLoss = scenario.isChallenge ? -20 : -10;
        
        // Privilege Buffer: Reduce penalty by 80%
        energyBase = isPrivileged ? Math.round(baseLoss * 0.2) : baseLoss;
        
        // Shield logic: 0 drain if shielded
        if (hasShield) {
            energyBase = 0;
            shielded = true;
        }
    }

    const totalEnergy = energyBase + energyBonus;
    const totalXp = xpBase + xpPattern + xpStrategy;

    setDriversCorrect(allCorrect);
    setOutcomeStats({
        energyBase,
        energyBonus,
        xpBase,
        xpPattern,
        xpStrategy,
        totalEnergy,
        totalXp,
        shielded,
        privileged: isPrivileged
    });
    setStep('OUTCOME');
    onResolve(totalEnergy, totalXp, allCorrect);
  };

  const dialogueText = selectedCard 
    ? (isPrivileged && scenario.privilegedCardDialogues 
        ? scenario.privilegedCardDialogues[selectedCard] 
        : scenario.cardDialogues[selectedCard])
    : '';

  const correctDriverDefs = DRIVERS.filter(d => scenario.correctDrivers.includes(d.id));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full w-full relative">
        <div className="flex-grow flex flex-col relative z-10">
            
            {step === 'INTRO' && (
                <div className="space-y-8 animate-fadeIn text-center my-auto">
                    <div className="text-8xl animate-bounce mb-6 drop-shadow-2xl">{scenario.emojis || '👀'}</div>
                    <div className={`p-10 rounded-3xl bg-gradient-to-br ${scenario.gradient} shadow-2xl border border-white/20`}>
                        <h3 className="text-4xl font-display font-bold mb-6 text-white drop-shadow-md">{scenario.title}</h3>
                        <p className="text-2xl leading-relaxed text-white font-medium">
                            "{isPrivileged ? scenario.privilegedSetupText : scenario.setupText}"
                        </p>
                    </div>
                    <Button className="text-xl py-6 shadow-xl hover:scale-105" fullWidth onClick={() => setStep('SELECT_CARD')}>Choose Response</Button>
                </div>
            )}

            {step === 'SELECT_CARD' && (
                <div className="space-y-6 animate-fadeIn h-full flex flex-col justify-center">
                    <h3 className="text-3xl font-bold text-center mb-4">Choose Strategy</h3>
                    <div className="grid grid-cols-2 gap-6 h-full">
                        {(['Humor', 'Facts', 'Deflect', 'Vulnerability'] as CardType[]).map(card => (
                            <button 
                                key={card} 
                                onClick={() => { setSelectedCard(card); setStep('IDENTIFY_DRIVER'); }}
                                className={`
                                    ${CARD_STYLES[card]}
                                    relative rounded-2xl p-4 flex flex-col justify-center items-center 
                                    transition-all hover:-translate-y-2 hover:shadow-2xl border-b-8 active:border-b-0 active:translate-y-1
                                `}
                            >
                                <div className="text-7xl mb-4 drop-shadow-lg">{card === 'Humor' ? '🃏' : card === 'Facts' ? '📊' : card === 'Deflect' ? '🛡️' : '💜'}</div>
                                <div className="font-bold font-display text-2xl uppercase tracking-wider">{card}</div>
                                <div className="text-xs font-bold opacity-90 mt-2 px-3 py-1 bg-black/20 rounded-full">{CARD_DESCRIPTIONS[card]}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 'IDENTIFY_DRIVER' && (
                <div className="space-y-4 animate-fadeIn h-full flex flex-col">
                    <div className="bg-white/10 p-6 rounded-2xl border-l-4 border-white mb-2 relative animate-slideInRight">
                         <div className={`absolute -top-3 left-4 ${selectedCard ? CARD_STYLES[selectedCard].split(' ')[0] : 'bg-primary'} text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg`}>
                            You used: {selectedCard}
                         </div>
                         <p className="text-xl italic font-serif text-white/90">"{dialogueText}"</p>
                    </div>

                    <div className="text-center mb-2">
                        <h3 className="text-2xl font-bold text-white">Why did they act that way?</h3>
                        <p className="text-sm text-gray-300">Identify the social pattern at play.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 flex-grow content-center">
                        {DRIVERS.map(driver => (
                            <button
                                key={driver.id}
                                onClick={() => handleDriverToggle(driver.id)}
                                className={`p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between ${selectedDrivers.includes(driver.id) ? 'bg-primary border-white text-white shadow-lg scale-105 z-10' : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'}`}
                            >
                                <span className="font-bold text-sm">{driver.name}</span>
                                {selectedDrivers.includes(driver.id) && <span className="text-xl">✓</span>}
                            </button>
                        ))}
                    </div>
                    <Button disabled={selectedDrivers.length !== (scenario.isChallenge ? 2 : 1)} onClick={finalizeTurn} className="py-4 text-lg" fullWidth>Analyze Situation</Button>
                </div>
            )}

            {step === 'OUTCOME' && outcomeStats && (
                 <div className="space-y-6 animate-fadeIn my-auto">
                    <div className={`text-center p-6 rounded-3xl border border-white/20 backdrop-blur-xl ${driversCorrect ? 'bg-success/10' : 'bg-primary/10'}`}>
                        <h3 className={`text-4xl font-bold mb-4 ${driversCorrect ? 'text-success' : 'text-white'}`}>
                            {driversCorrect ? "✨ Success! ✨" : "💡 Learning Moment"}
                        </h3>

                        <div className="flex flex-col md:flex-row justify-center gap-6 my-8">
                            {/* Energy Breakdown */}
                            <Card className="bg-black/40 md:w-1/2 border-white/10 p-6 flex flex-col">
                                <div className="text-xs uppercase tracking-widest text-text-secondary mb-3">Social Energy</div>
                                <div className={`text-5xl font-mono font-bold mb-4 ${outcomeStats.totalEnergy >= 0 ? 'text-safe' : 'text-danger'}`}>
                                    {outcomeStats.totalEnergy >= 0 ? '+' : ''}{outcomeStats.totalEnergy}%
                                </div>
                                <div className="text-sm text-gray-300 space-y-2 text-left border-t border-white/10 pt-4 mt-auto">
                                    {driversCorrect ? (
                                        <>
                                            <div className="flex justify-between"><span>Pattern Correct:</span><span className="text-safe">+{outcomeStats.energyBase}%</span></div>
                                            {outcomeStats.energyBonus > 0 && <div className="flex justify-between"><span>Optimal Card:</span><span className="text-safe">+{outcomeStats.energyBonus}%</span></div>}
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between"><span>Wrong Choice:</span><span className="text-danger">{outcomeStats.energyBase}%</span></div>
                                            {outcomeStats.privileged && <div className="flex justify-between text-success font-bold italic"><span>Privilege Buffer:</span><span>Drain Reduced!</span></div>}
                                            {outcomeStats.shielded && <div className="flex justify-between text-safe font-bold italic"><span>Safety Net:</span><span>Blocked Drain!</span></div>}
                                        </>
                                    )}
                                </div>
                            </Card>
                            
                            {/* XP Breakdown */}
                            <Card className="bg-black/40 md:w-1/2 border-white/10 p-6 flex flex-col">
                                <div className="text-xs uppercase tracking-widest text-text-secondary mb-3">XP Earned</div>
                                <div className="text-5xl font-mono font-bold mb-4 text-primary">+{outcomeStats.totalXp}</div>
                                <div className="text-sm text-gray-300 space-y-2 text-left border-t border-white/10 pt-4 mt-auto">
                                    <div className="flex justify-between"><span>Scenario Done:</span><span className="text-primary">+{outcomeStats.xpBase}</span></div>
                                    {outcomeStats.xpPattern > 0 && <div className="flex justify-between"><span>Correct Pattern:</span><span className="text-primary">+{outcomeStats.xpPattern}</span></div>}
                                    {outcomeStats.xpStrategy > 0 && <div className="flex justify-between"><span>Optimal Strategy:</span><span className="text-primary">+{outcomeStats.xpStrategy}</span></div>}
                                </div>
                            </Card>
                        </div>

                        <div className="bg-black/30 p-6 rounded-2xl text-left border border-white/10 mb-6">
                            <p className="text-lg italic leading-relaxed text-white">"{driversCorrect ? scenario.correctResponse : scenario.wrongResponse}"</p>
                        </div>

                        {!driversCorrect && (
                             <div className="bg-white/5 p-5 rounded-xl text-left border-l-4 border-primary">
                                 <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-2">The pattern was:</p>
                                 {correctDriverDefs.map(d => (
                                     <div key={d.id} className="mb-3 last:mb-0">
                                         <strong className="text-primary text-lg">{d.name}</strong>
                                         <p className="text-sm text-gray-300 leading-snug">{d.definition}</p>
                                     </div>
                                 ))}
                             </div>
                        )}
                    </div>
                 </div>
            )}
        </div>

        {step === 'IDENTIFY_DRIVER' && (
            <div className="hidden lg:flex w-72 flex-col bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/10 overflow-hidden z-10">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-4 pb-2 border-b border-white/10">Reference Guide</h4>
                <div className="overflow-y-auto pr-2 space-y-4 scrollbar-hide flex-grow">
                    {DRIVERS.map(d => (
                        <div key={d.id} className="text-[10px] group">
                            <span className="font-bold text-primary block mb-1">{d.name}</span>
                            <span className="text-gray-400 leading-relaxed block">{d.definition}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default ScenarioView;
