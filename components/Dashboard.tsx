import React from 'react';
import { GameState } from '../types';
import { Button, Card } from './UIComponents';

interface Props {
  gameState: GameState;
  onReplay: () => void;
}

const AXIS_LABELS: Record<string, string> = {
  label: 'IDENTITY',
  action: 'ACTION',
  pull: 'ATTRACTION',
  heart: 'CONNECTION'
};

const Dashboard: React.FC<Props> = ({ gameState, onReplay }) => {
  const getInsight = () => {
    const { frictionByAxis } = gameState;
    const highestFriction = (Object.entries(frictionByAxis) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
    
    // Updated logic: Focus on environment, not identity "causing" it
    if (highestFriction && highestFriction[1] > 0) {
        const name = AXIS_LABELS[highestFriction[0]] || highestFriction[0];
        return `The environments you navigated showed the most structural rigidity regarding ${name}, creating friction despite your efforts to navigate them.`;
    }
    return "You navigated these spaces effectively. The lack of major friction suggests either an alignment between your profile and these specific environments, or successful navigation strategies.";
  };

  const copyStats = () => {
    const text = `
💡 Insight: ${getInsight()}
🔥 Hardest Scenario: ${gameState.history.find(h => h.batteryChange < 0)?.scenarioId || 'None'}
🧠 Top Pattern: ${(Object.entries(gameState.driversEncountered) as [string, number][]).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'}
🎭 Vibe: ${gameState.identity.vibeName}
    `;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-fadeIn pb-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-safe to-primary">
            Journey Complete
        </h2>
        <p className="text-xl mt-2 text-white">{gameState.identity.vibeName}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
            {/* Round to nearest whole number */}
            <div className="text-3xl font-mono font-bold text-safe">{Math.round(gameState.battery)}%</div>
            <div className="text-xs uppercase tracking-widest opacity-70">Final Battery</div>
        </Card>
        <Card className="text-center">
            <div className="text-3xl font-mono font-bold text-primary">{gameState.xp}</div>
            <div className="text-xs uppercase tracking-widest opacity-70">Total XP</div>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold mb-4 border-b border-white/10 pb-2">Identity Profile</h3>
        <div className="space-y-4">
             {Object.entries(gameState.identity).map(([k, v]) => {
                 if (k === 'vibeName' || k === 'avatar') return null;
                 const val = v as number;
                 
                 const barWidth = Math.abs(val); // 0-50%
                 const barLeft = val < 0 ? 50 - barWidth : 50;

                 return (
                    <div key={k} className="space-y-1">
                        <div className="flex justify-between text-xs uppercase font-bold text-text-secondary">
                            <span>{AXIS_LABELS[k] || k}</span>
                            <span>{val > 0 ? '+' : ''}{val}</span>
                        </div>
                        <div className="relative h-2 bg-black/30 rounded-full w-full">
                            {/* Center Marker */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2"></div>
                            
                            <div 
                                className={`absolute h-full rounded-full ${val === 0 ? 'bg-white/50 w-1 -translate-x-1/2 left-1/2' : 'bg-gradient-to-r from-primary to-accent'}`}
                                style={{ 
                                    left: `${barLeft}%`, 
                                    width: `${Math.max(1, barWidth)}%` 
                                }}
                            />
                        </div>
                    </div>
                 )
             })}
        </div>
      </Card>

      <Card className="bg-primary/10 border-primary/30">
        <h3 className="font-bold text-primary mb-2">Analysis</h3>
        <p className="italic text-sm leading-relaxed">"{getInsight()}"</p>
      </Card>

      <div className="flex gap-4">
        <Button variant="secondary" fullWidth onClick={copyStats}>Copy Summary</Button>
        <Button variant="primary" fullWidth onClick={onReplay}>Restart Journey</Button>
      </div>
    </div>
  );
};

export default Dashboard;