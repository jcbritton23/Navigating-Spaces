import React, { useState, useEffect } from 'react';
import { Identity, Axis } from '../types';
import { VIBE_SUGGESTIONS } from '../constants';
import { Button, Card } from './UIComponents';

interface Props {
  onComplete: (identity: Identity) => void;
}

const AXIS_CONFIG = [
  {
    key: 'label' as Axis,
    title: 'IDENTITY',
    subtitle: '(Self-Labeling)',
    left: 'FLUID',
    mid: 'THE STANDARD',
    right: 'SPECIFIC',
    desc: 'Shifting/Resisting boxes vs. Traditional/Expected vs. Unique/Specialized.'
  },
  {
    key: 'action' as Axis,
    title: 'PRACTICE',
    subtitle: '(Sexual Behavior)',
    left: 'EXPLORATORY',
    mid: 'CONSISTENT',
    right: 'TARGETED',
    desc: 'Varied experiences vs. Standard expectations vs. Niche preferences.'
  },
  {
    key: 'pull' as Axis,
    title: 'THE SPARK',
    subtitle: '(Sexual Attraction)',
    left: 'CONTEXTUAL',
    mid: 'PREDICTABLE',
    right: 'INTENSE',
    desc: 'Situation-dependent vs. Common social scripts vs. Specific traits/types.'
  },
  {
    key: 'heart' as Axis,
    title: 'THE VOW',
    subtitle: '(Romantic Attraction)',
    left: 'COMMUNAL',
    mid: 'TRADITIONAL',
    right: 'INDEPENDENT',
    desc: 'Focus on chosen family vs. Nuclear unit vs. Solo/Alternative bonds.'
  }
];

const AVATAR_OPTIONS = [
  '🦊', '🦁', '🦄', '🐲', '🐻', 
  '🤖', '👽', '👾', '👻', '💀', 
  '🤠', '🥷', '🧙', '🧟', '🧜',
  '🧠', '👁️', '🎭', '🎲', '🧩'
];

const SpectrumMixer: React.FC<Props> = ({ onComplete }) => {
  const [values, setValues] = useState({
    label: 0,
    action: 0,
    pull: 0,
    heart: 0
  });
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  // Cycle suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIndex(prev => (prev + 1) % VIBE_SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (axis: Axis, val: string) => {
    setValues(prev => ({ ...prev, [axis]: parseInt(val) }));
  };

  const handleRandomize = () => {
    setValues({
      label: Math.floor(Math.random() * 100) - 50,
      action: Math.floor(Math.random() * 100) - 50,
      pull: Math.floor(Math.random() * 100) - 50,
      heart: Math.floor(Math.random() * 100) - 50,
    });
    setAvatar(AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]);
  };

  const getObservation = () => {
    const magnitudes = Object.values(values).map((v) => Math.abs(v as number));
    const avgMag = magnitudes.reduce((a, b) => a + b, 0) / 4;
    
    if (avgMag < 15) return "Your profile aligns closely with the 'Conventional Middle'.";
    if (avgMag > 35) return "You forge a unique path away from the standard.";
    
    return "Your identity shows a distinct, complex personal style.";
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-[fadeIn_0.5s_ease-out] pb-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          The Spectrum Mixer
        </h2>
        <p className="text-text-secondary">Define your identity relative to the "Conventional Middle" (0).</p>
      </div>

      <Card className="text-center space-y-4">
         <h3 className="uppercase tracking-widest text-xs font-bold text-primary">Choose your Avatar</h3>
         <div className="flex flex-wrap justify-center gap-2">
            {AVATAR_OPTIONS.map((a) => (
                <button
                    key={a}
                    onClick={() => setAvatar(a)}
                    className={`
                        text-3xl w-12 h-12 rounded-full transition-all duration-300
                        flex items-center justify-center
                        ${avatar === a ? 'bg-primary/20 scale-125 shadow-[0_0_15px_rgba(167,139,250,0.5)] border border-primary' : 'hover:bg-white/5 hover:scale-110 grayscale hover:grayscale-0'}
                    `}
                >
                    {a}
                </button>
            ))}
         </div>
      </Card>

      <div className="space-y-6">
        {AXIS_CONFIG.map((config) => (
          <div key={config.key} className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-primary text-xl tracking-wide">{config.title}</span>
                    <span className="text-sm text-text-secondary italic">{config.subtitle}</span>
                  </div>
                  <p className="text-xs text-text-secondary opacity-70 mt-1 max-w-lg">{config.desc}</p>
              </div>
            </div>
            
            <div className="relative py-6 px-2">
              {/* Labels Row */}
              <div className="flex justify-between text-[10px] sm:text-xs font-bold text-white/60 mb-2 uppercase tracking-wider relative">
                <span className="text-left w-1/4">{config.left}</span>
                <span className="text-center w-1/2 absolute left-1/2 -translate-x-1/2 text-white">{config.mid}</span>
                <span className="text-right w-1/4 ml-auto">{config.right}</span>
              </div>

              {/* Slider Track Visuals */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-blue-900/40 via-white/10 to-pink-900/40 rounded-full z-0"></div>
              {/* Center Line */}
              <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-white/30 -translate-x-1/2 z-0"></div>

              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={values[config.key]}
                onChange={(e) => handleChange(config.key, e.target.value)}
                className="relative z-10 w-full h-8 opacity-0 cursor-pointer" 
              />
              
              {/* Custom Thumb Visual (moves with value) */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-primary border-2 border-white rounded-full shadow-[0_0_10px_rgba(167,139,250,0.8)] pointer-events-none transition-all duration-75 z-20 flex items-center justify-center"
                style={{ left: `calc(${values[config.key] + 50}% - 12px)` }}
              >
                  <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
        
      <Button variant="secondary" fullWidth onClick={handleRandomize}>
        Surprise Me
      </Button>

      <div className="space-y-4 text-center pt-4">
        <p className="italic text-safe text-lg">"{getObservation()}"</p>
        
        <div className="glass-panel p-6 rounded-xl border border-primary/30">
          <label className="block text-sm font-bold mb-3 uppercase tracking-widest text-primary">Name Your Vibe</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={VIBE_SUGGESTIONS[suggestionIndex]}
            className="w-full bg-black/40 border-b-2 border-white/20 p-4 text-center text-2xl font-display font-bold focus:outline-none focus:border-primary transition-colors placeholder-white/10"
          />
        </div>

        <Button 
          disabled={!name} 
          onClick={() => onComplete({ ...values, vibeName: name, avatar })}
          className="w-full text-xl py-5 shadow-xl mt-4"
        >
          Begin Journey
        </Button>
      </div>
    </div>
  );
};

export default SpectrumMixer;