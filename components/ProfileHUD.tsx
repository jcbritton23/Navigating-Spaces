import React from 'react';
import { Identity, Axis } from '../types';
import { BatteryDisplay } from './UIComponents';

interface Props {
  identity: Identity;
  battery: number;
  xp?: number;
  activePowerUps?: string[];
  className?: string;
}

const AXIS_LABELS: Record<Axis, string> = {
  label: 'IDENTITY',
  action: 'PRACTICE',
  pull: 'SPARK',
  heart: 'VOW'
};

const ProfileHUD: React.FC<Props> = ({ identity, battery, xp = 0, activePowerUps, className = '' }) => {
  return (
    <div className={`glass-panel p-6 rounded-3xl flex flex-col items-center text-center justify-start space-y-6 bg-gradient-to-b from-white/10 to-transparent border border-white/10 ${className}`}>
        
        {/* Avatar Display */}
        <div className="relative mt-2">
           <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent p-1 shadow-[0_0_25px_rgba(167,139,250,0.6)] animate-pulse-slow">
               <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden text-6xl">
                   {identity.avatar}
               </div>
           </div>
           {/* XP Badge */}
           <div className="absolute -bottom-2 -right-2 bg-primary text-background text-xs font-bold px-2 py-1 rounded-full border-2 border-background shadow-lg">
             {xp} XP
           </div>
        </div>
        
        <div>
            <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-2">Identity Vibe</h3>
            <div className="text-2xl font-display font-bold text-white break-words leading-tight">
                {identity.vibeName || "The Explorer"}
            </div>
        </div>

        <div className="w-full h-px bg-white/10"></div>

        <div className="w-full">
            <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-3">Social Battery</h3>
            <div className="flex justify-center mb-2">
                <BatteryDisplay value={battery} />
            </div>
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div 
                   className={`h-full transition-all duration-500 ${battery < 30 ? 'bg-danger' : 'bg-safe'}`}
                   style={{ width: `${battery}%` }}
                />
            </div>
        </div>

        {/* Inventory Section */}
        {activePowerUps && activePowerUps.length > 0 && (
            <div className="w-full animate-fadeIn">
                <div className="w-full h-px bg-white/10 mb-4"></div>
                <h3 className="text-xs uppercase tracking-widest text-safe mb-3">Active Items</h3>
                <div className="flex flex-col gap-2">
                    {activePowerUps.map(p => (
                        <div key={p} className="bg-safe/10 border border-safe/30 text-safe text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-3 shadow-[0_0_10px_rgba(79,255,176,0.1)]">
                            <span className="text-lg">{p === 'Shield' ? '🛡️' : '👁️'}</span>
                            <span>{p}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="w-full h-px bg-white/10"></div>
        
        {/* Neutral Axis Visualization */}
        <div className="w-full space-y-3">
            {(['label', 'action', 'pull', 'heart'] as Axis[]).map(axis => {
                const val = identity[axis]; // -50 to 50
                // Convert to 0-100 for bar positioning
                const width = Math.max(2, Math.abs(val)); 
                const left = val < 0 ? 50 - width : 50;
                
                return (
                    <div key={axis} className="w-full">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-text-secondary mb-1">
                            <span>{AXIS_LABELS[axis]}</span>
                        </div>
                        <div className="relative h-1.5 bg-black/40 rounded-full w-full">
                             {/* Center Marker */}
                             <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30 -translate-x-1/2"></div>
                             
                             <div 
                                className="absolute h-full rounded-full bg-white/70"
                                style={{ 
                                    left: `${left}%`, 
                                    width: `${width}%` 
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default ProfileHUD;