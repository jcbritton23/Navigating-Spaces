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
      batteryBase: number;
      batteryBonus: number;
      xpBase: number;
      xpBonus: number;
      totalBattery: number;
      totalXp: number;
      shielded: boolean;
  } | null>(null);
  
  const drainInterval = useRef<number>();
  
  // Power-up States
  const hasShield = gameState.powerUpsOwned.includes('Shield') && !gameState.powerUpsUsed.includes('Shield');
  const hasInsight = gameState.powerUpsOwned.includes('Insight') && !gameState.powerUpsUsed.includes('Insight');

  // "Conventional Experience" Logic
  // If the deviation on relevant axes is low (< 20 on -50 to 50 scale), the player is "Privileged" in this context
  const deviation = Math.max(...scenario.relevantAxes.map(axis => Math.abs(gameState.identity[axis])));
  const isPrivileged = deviation < 20 && !!scenario.privilegedSetupText;

  useEffect(() => {
    // Friction Calculation
    const frictionScore = (deviation * scenario.rigidity) / 100;
    
    // If privileged, friction is near zero regardless of scenario rigidity
    const isHighTension = !isPrivileged && frictionScore > 20;
    const drainAmount = isPrivileged ? 0 : (isHighTension ? 0.6 : 0.2); 
    
    if (step === 'INTRO' || step === 'SELECT_CARD' || step === 'IDENTIFY_DRIVER') {
        drainInterval.current = window.setInterval(() => {
            if (drainAmount > 0) {
                onDrain(drainAmount);
            }
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

    // Calculate detailed stats
    let batteryBase = 0;
    let batteryBonus = 0;
    let xpBase = 0;
    let xpBonus = 0;
    let shielded = false;

    if (allCorrect) {
        batteryBase = scenario.isChallenge ? 25 : 15;
        xpBase = scenario.isChallenge ? 20 : 10;
        
        if (bestCardUsed) {
            batteryBonus = 5;
            xpBonus = 5;
        }
    } else {
        batteryBase = scenario.isChallenge ? -20 : -10;
        xpBase = 5;

        // Shield Logic
        if (hasShield) {
            batteryBase = 0; // Negate the loss
            shielded = true;
        }
    }
    
    // Privilege Logic: The interaction is more forgiving.
    // Reducing penalty significantly to reflect "Privilege Buffer".
    if (isPrivileged && batteryBase < 0) {
        batteryBase = -2; // Very minimal loss compared to -10 or -20
    }

    const totalBattery = batteryBase + batteryBonus;
    const totalXp = xpBase + xpBonus;

    setDriversCorrect(allCorrect);
    setOutcomeStats({
        batteryBase,
        batteryBonus,
        xpBase,
        xpBonus,
        totalBattery,
        totalXp,
        shielded
    });
    setStep('OUTCOME');

    onResolve(totalBattery, totalXp, allCorrect);
  };
  
  // Insight Logic
  const displayedDrivers = hasInsight 
    ? DRIVERS.filter(d => scenario.correctDrivers.includes(d.id) || Math.random() > 0.6) 
    : DRIVERS;

  const correctDriverDefs = DRIVERS.filter(d => scenario.correctDrivers.includes(d.id));

  // Current battery projection for outcome warning
  const projectedBattery = Math.max(0, gameState.battery + (outcomeStats?.totalBattery || 0));
  
  // Determine dialogue text based on privilege state
  const dialogueText = selectedCard 
    ? (isPrivileged && scenario.privilegedCardDialogues 
        ? scenario.privilegedCardDialogues[selectedCard] 
        : scenario.cardDialogues[selectedCard])
    : '';

  // Render Power-Up Badges
  const PowerUpBadges = () => (
      <div className="absolute top-0 right-0 p-4 flex gap-2 z-20 pointer-events-none">
          {/* Only show Privilege Buffer on Outcome screen to explain result */}
          {isPrivileged && step === 'OUTCOME' && (
              <div className="bg-success text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.6)] flex items-center gap-2 border-2 border-white animate-pulse-slow">
                  <span>🟢</span> Privilege Buffer Active
              </div>
          )}
          {hasShield && (
              <div className="bg-safe text-background px-3 py-1.5 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(79,255,176,0.6)] animate-pulse flex items-center gap-2 border-2 border-white">
                  <span>🛡️</span> Shield Active
              </div>
          )}
          {hasInsight && (
              <div className="bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(167,139,250,0.6)] animate-pulse flex items-center gap-2 border-2 border-white">
                  <span>👁️</span> Insight Active
              </div>
          )}
      </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full w-full relative">
        <PowerUpBadges />
        
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
                    <h3 className="text-3xl font-bold text-center mb-4">Select your Strategy</h3>
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
                                <div className="text-8xl mb-4 drop-shadow-lg transform transition-transform group-hover:scale-110">
                                    {card === 'Humor' && '🃏'}
                                    {card === 'Facts' && '📊'}
                                    {card === 'Deflect' && '🛡️'}
                                    {card === 'Vulnerability' && '💜'}
                                </div>
                                <div className="font-bold font-display text-2xl uppercase tracking-wider">{card}</div>
                                <div className="text-xs font-bold opacity-90 mt-2 px-2 py-1 bg-black/20 rounded-full">{CARD_DESCRIPTIONS[card]}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 'IDENTIFY_DRIVER' && (
                <div className="space-y-4 animate-fadeIn h-full flex flex-col">
                    
                    {/* Dialogue Bubble */}
                    <div className="bg-white/10 p-6 rounded-2xl border-l-4 border-white mb-2 relative animate-slideInRight">
                         <div className={`absolute -top-3 left-4 ${selectedCard ? CARD_STYLES[selectedCard].split(' ')[0] : 'bg-primary'} text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow-lg`}>
                            You used {selectedCard}
                         </div>
                         <p className="text-xl italic font-serif text-white/90">
                            "{dialogueText}"
                         </p>
                    </div>

                    <div className="text-center mb-2">
                        <h3 className="text-2xl font-bold text-white">Identify the Belief Pattern</h3>
                        <p className="text-sm text-gray-300">
                            {isPrivileged 
                             ? "Even though the interaction was positive, what belief system explains their approval?" 
                             : `Select ${scenario.isChallenge ? '2 patterns' : '1 pattern'} that explain their behavior.`}
                        </p>
                        {hasInsight && <p className="text-primary font-bold text-sm animate-pulse">👁️ Insight has narrowed down the options!</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 flex-grow content-center">
                        {displayedDrivers.map(driver => (
                            <button
                                key={driver.id}
                                onClick={() => handleDriverToggle(driver.id)}
                                className={`
                                    p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between
                                    ${selectedDrivers.includes(driver.id) 
                                        ? 'bg-primary border-white text-white shadow-[0_0_15px_rgba(167,139,250,0.6)] scale-105 z-10' 
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'}
                                `}
                            >
                                <span className="font-bold">{driver.name}</span>
                                {selectedDrivers.includes(driver.id) && <span className="text-xl">✓</span>}
                            </button>
                        ))}
                    </div>
                    
                    <Button 
                        fullWidth 
                        disabled={selectedDrivers.length !== (scenario.isChallenge ? 2 : 1)}
                        onClick={finalizeTurn}
                        className="py-4 text-lg"
                    >
                        Confirm Analysis
                    </Button>
                </div>
            )}

            {step === 'OUTCOME' && outcomeStats && (
                 <div className="space-y-6 animate-fadeIn my-auto">
                    <div className={`text-center p-6 rounded-3xl border border-white/20 backdrop-blur-xl ${driversCorrect ? 'bg-success/10' : 'bg-primary/10'}`}>
                        <h3 className={`text-4xl font-bold mb-2 ${driversCorrect ? 'text-success' : 'text-white'}`}>
                            {driversCorrect ? "✨ Analysis Correct! ✨" : "💡 Learning Moment"}
                        </h3>

                        {/* Breakdown Stats */}
                        <div className="flex justify-center gap-4 my-6">
                            <Card className="bg-black/40 min-w-[140px] border-white/10 p-4">
                                <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Battery Impact</div>
                                <div className={`text-4xl font-mono font-bold mb-2 ${outcomeStats.totalBattery >= 0 ? 'text-safe' : 'text-danger'}`}>
                                    {outcomeStats.totalBattery >= 0 ? '+' : ''}{Math.round(outcomeStats.totalBattery)}
                                </div>
                                <div className="text-[11px] text-gray-300 space-y-1 text-left border-t border-white/10 pt-2">
                                    {driversCorrect ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Correct Pattern:</span>
                                                <span className="text-safe">+{outcomeStats.batteryBase}</span>
                                            </div>
                                            {outcomeStats.batteryBonus > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Perfect Strategy:</span>
                                                    <span className="text-safe">+{outcomeStats.batteryBonus}</span>
                                                </div>
                                            )}
                                            {isPrivileged && (
                                                <div className="flex justify-between text-success font-bold">
                                                    <span>Privilege Buffer:</span>
                                                    <span>Active</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {outcomeStats.shielded ? (
                                                <div className="flex justify-between text-safe font-bold">
                                                    <span>Shield Active:</span>
                                                    <span>0 Drain</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span>Wrong Pattern:</span>
                                                        <span className="text-danger">{outcomeStats.batteryBase}</span>
                                                    </div>
                                                    {isPrivileged && (
                                                        <div className="flex justify-between text-success font-bold">
                                                            <span>Privilege Buffer:</span>
                                                            <span>Drain Reduced</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Card>
                            
                            <Card className="bg-black/40 min-w-[140px] border-white/10 p-4">
                                <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">XP Gained</div>
                                <div className="text-4xl font-mono font-bold mb-2 text-primary">+{outcomeStats.totalXp}</div>
                                <div className="text-[11px] text-gray-300 space-y-1 text-left border-t border-white/10 pt-2">
                                    <div className="flex justify-between">
                                        <span>Scenario Complete:</span>
                                        <span className="text-primary">+5</span>
                                    </div>
                                    {driversCorrect && (
                                        <div className="flex justify-between">
                                            <span>Correct Pattern:</span>
                                            <span className="text-primary">+{outcomeStats.xpBase - 5}</span>
                                        </div>
                                    )}
                                    {outcomeStats.xpBonus > 0 && (
                                        <div className="flex justify-between">
                                            <span>Perfect Strategy:</span>
                                            <span className="text-primary">+{outcomeStats.xpBonus}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        <div className="bg-black/30 p-6 rounded-2xl text-left border border-white/10 mb-6">
                            <p className="text-xl italic leading-relaxed text-white">
                                "{driversCorrect ? scenario.correctResponse : scenario.wrongResponse}"
                            </p>
                        </div>

                        {!driversCorrect && (
                             <div className="bg-white/5 p-4 rounded-xl text-left border-l-4 border-primary">
                                 <p className="text-xs uppercase tracking-widest text-text-secondary mb-2">The pattern at play was:</p>
                                 {correctDriverDefs.map(d => (
                                     <div key={d.id} className="mb-2">
                                         <strong className="text-primary text-lg">{d.name}</strong>
                                         <p className="text-sm text-gray-300">{d.definition}</p>
                                     </div>
                                 ))}
                             </div>
                        )}

                        {/* Low Battery Warning */}
                        {projectedBattery < 30 && gameState.loungeVisits < 2 && (
                            <div className="mt-6 bg-accent/20 border border-accent rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
                                <div className="text-left">
                                    <h4 className="font-bold text-accent text-sm uppercase tracking-widest">Battery Critical</h4>
                                    <p className="text-xs text-white">You're running low. Visit the Lounge to recharge.</p>
                                </div>
                                <div className="text-2xl">⚡</div>
                            </div>
                        )}
                    </div>
                 </div>
            )}
        </div>

        {step === 'IDENTIFY_DRIVER' && (
            <div className="hidden lg:flex w-64 flex-col bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 overflow-hidden animate-slideInRight z-10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3 pb-2 border-b border-white/10">Reference Guide</h4>
                <div className="overflow-y-auto pr-2 space-y-3 scrollbar-hide flex-grow">
                    {DRIVERS.map(d => (
                        <div key={d.id} className="text-xs group hover:bg-white/5 p-2 rounded transition-colors">
                            <span className="font-bold text-primary block mb-0.5 group-hover:text-white">{d.name}</span>
                            <span className="text-gray-400 leading-tight block group-hover:text-gray-200">{d.definition}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default ScenarioView;