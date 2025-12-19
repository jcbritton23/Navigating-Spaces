import React from 'react';
import { GameState, ScenarioID } from '../types';
import { Icons, SCENARIOS } from '../constants';

interface Props {
  gameState: GameState;
  onSelectLocation: (id: ScenarioID) => void;
  onVisitLounge: () => void;
}

const WorldMap: React.FC<Props> = ({ gameState, onSelectLocation, onVisitLounge }) => {
  const isComplete = (id: ScenarioID) => gameState.scenariosCompleted.includes(id);
  
  const standardScenarios: ScenarioID[] = ['office', 'cafe', 'campus', 'park'];
  const completedStandards = standardScenarios.filter(id => gameState.scenariosCompleted.includes(id)).length;
  const isFamilyLocked = completedStandards < 4;

  const LocationButton = ({ id, left, top, icon: Icon }: { id: ScenarioID, left: string, top: string, icon: any }) => {
    const data = SCENARIOS[id];
    const completed = isComplete(id);
    const locked = id === 'family' && isFamilyLocked;
    
    return (
      <button
        disabled={completed || locked}
        onClick={() => onSelectLocation(id)}
        className={`
          absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center
          transition-all duration-300 transform shadow-xl border-4 z-10
          ${completed 
            ? 'bg-gray-700 border-gray-500 opacity-60 cursor-not-allowed grayscale' 
            : locked
                ? 'bg-gray-800 border-gray-600 opacity-80 cursor-not-allowed'
                : `bg-gradient-to-br ${data.gradient} border-white/30 cursor-pointer hover:scale-110 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] animate-[float_4s_ease-in-out_infinite]`
          }
        `}
        style={{ left, top, transform: 'translate(-50%, -50%)' }}
      >
        {locked ? (
           <span className="text-4xl mb-1">🔒</span>
        ) : (
           <Icon className="w-12 h-12 mb-1" />
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-center leading-tight px-1 drop-shadow-md">
            {data.title}
        </span>
        {data.isChallenge && !completed && !locked && (
            <span className="absolute -top-3 -right-3 bg-danger text-xs font-bold px-3 py-1 rounded-full animate-bounce shadow-md border border-white">BOSS</span>
        )}
        {completed && <span className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full text-2xl font-bold text-success">✓</span>}
      </button>
    );
  };

  return (
    <div className="flex-grow min-h-[500px] h-full relative rounded-3xl overflow-hidden glass-panel border border-white/10 bg-[#2d2d44] shadow-2xl">
        
        {/* Lighter Background for visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a40] to-[#1f1f2e] pointer-events-none"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>

        <div className="absolute top-0 left-0 w-full p-6 z-10">
            <h2 className="text-4xl font-display font-bold text-white drop-shadow-lg">City Map</h2>
            <p className="text-sm text-gray-300 uppercase tracking-widest mt-1">Select a location to navigate</p>
        </div>

        <div className="relative w-full h-full">
            {/* Center: Lounge */}
            <button
                onClick={onVisitLounge}
                disabled={gameState.loungeVisits >= 2}
                className={`
                    absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                    w-36 h-36 rounded-full bg-safe/20 backdrop-blur-md border-2 border-safe
                    flex flex-col items-center justify-center text-safe shadow-[0_0_40px_rgba(79,255,176,0.2)]
                    hover:bg-safe/30 hover:scale-105 transition-all z-20 group
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale
                `}
            >
                <div className="group-hover:animate-pulse">
                    <Icons.Lounge className="w-14 h-14 mb-2" />
                </div>
                <span className="font-bold tracking-widest text-sm">LOUNGE</span>
                <span className="text-[10px] opacity-90 mt-1 bg-black/30 px-2 py-0.5 rounded-full">{gameState.loungeVisits}/2 Visits</span>
            </button>

            {/* Radial Layout to avoid overlap */}
            {/* Top Left */}
            <LocationButton id="office" left="20%" top="25%" icon={Icons.Office} />
            
            {/* Top Right */}
            <LocationButton id="cafe" left="80%" top="25%" icon={Icons.Cafe} />
            
            {/* Bottom Left */}
            <LocationButton id="campus" left="20%" top="75%" icon={Icons.Campus} />
            
            {/* Bottom Right - Boss */}
            <LocationButton id="family" left="80%" top="75%" icon={Icons.Home} />

            {/* Bottom Center */}
            <LocationButton id="park" left="50%" top="85%" icon={Icons.Park} />
        </div>
    </div>
  );
};

export default WorldMap;