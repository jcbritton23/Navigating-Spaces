import React from 'react';
import { DriverDef, ScenarioData, ScenarioID, CardType } from './types';

// --- Icons ---
export const Icons = {
  Orb: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <circle cx="50" cy="50" r="40" />
    </svg>
  ),
  Office: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-10h2m-2 4h2m-2 4h2M9 11h2m-2 4h2m-2 4h2" />
    </svg>
  ),
  Cafe: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 1v3M10 1v3M14 1v3" />
    </svg>
  ),
  Campus: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l9 5v2H3V7l9-5zM4 9v9h16V9M9 9v9m6-9v9" />
    </svg>
  ),
  Park: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Home: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Lounge: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 12H4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9m0-9l-3 3m3-3l3 3" />
    </svg>
  ),
  Battery: ({ className, fillPercentage }: { className?: string, fillPercentage: number }) => (
    <div className={`relative ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    </div>
  ),
};

// --- Data ---

export const DRIVERS: DriverDef[] = [
  { id: 'Binary Brain', name: 'Binary Brain', definition: "Can't handle both/and thinking", incorrectDefinitions: ["Thinks it's a choice", "Uncomfortable with difference"] },
  { id: 'Choice Trap', name: 'Choice Trap', definition: "Believes orientation is changeable", incorrectDefinitions: ["Views queerness as modern", "Rigid belief in authority"] },
  { id: 'The Rulebook', name: 'The Rulebook', definition: "Extreme discomfort outside tradition", incorrectDefinitions: ["Visceral negative reaction", "Identity threat"] },
  { id: 'Disgust Reflex', name: 'Disgust Reflex', definition: "Visceral negative reaction to difference", incorrectDefinitions: ["Thinks it's a choice", "Can't handle complexity"] },
  { id: 'Hierarchy Guard', name: 'Hierarchy Guard', definition: "Believes traditional families are superior", incorrectDefinitions: ["Identity threat", "Ahistorical thinking"] },
  { id: 'Threat Alert', name: 'Threat Alert', definition: "Feels their own identity is threatened", incorrectDefinitions: ["Moral disgust", "Confusion about fluidity"] },
  { id: 'Time Capsule', name: 'Time Capsule', definition: "Views queerness as modern invention", incorrectDefinitions: ["Believes it is a phase", "Submission to authority"] },
  { id: 'The Authority', name: 'The Authority', definition: "Rigid belief in conventional power", incorrectDefinitions: ["Binary thinking", "Fear of the unknown"] },
];

export const CARD_DESCRIPTIONS: Record<CardType, string> = {
  Humor: "Defuse tension with a joke to change the subject.",
  Facts: "Use logic and data to educate the person.",
  Deflect: "Politely redirect the conversation elsewhere.",
  Vulnerability: "Open up and share your personal truth."
};

export const SCENARIOS: Record<ScenarioID, ScenarioData & { emojis: string }> = {
  office: {
    id: 'office',
    title: 'The Office',
    description: 'Professional/Work Context',
    setupText: "You're at work. During a team meeting, a coworker notices the rainbow flag sticker on your laptop and says: 'Hey, let's keep personal stuff out of the workplace, alright?'",
    privilegedSetupText: "Your manager stops by your desk: 'I really appreciate how professional you look today. No distractions, just business. That's exactly how we get ahead in this industry.'",
    rigidity: 25,
    relevantAxes: ['label'],
    correctDrivers: ['The Rulebook'],
    bestCards: ['Facts'],
    isChallenge: false,
    correctResponse: "You calmly explain that a Pride sticker isn't political—it's part of your identity, same as someone's wedding ring. They pause: 'Huh. Fair point, I guess.'",
    wrongResponse: "They bring it up to HR, who reminds you that company policy prefers 'apolitical' decorations.",
    gradient: 'from-blue-600 to-slate-700',
    emojis: '💼 💻',
    cardDialogues: {
        Humor: "I thought the rainbow added some much-needed brightness to the cubicle beige!",
        Facts: "My laptop stickers don't impact my coding speed or quarterly targets.",
        Deflect: "Oh, anyway, did you see the email about the new client requirements?",
        Vulnerability: "This flag helps me feel safe and visible here. It's important to me."
    },
    privilegedCardDialogues: {
        Humor: "I try! Though my desk organization is still a work in progress.",
        Facts: "I find a neutral environment helps me focus purely on the data.",
        Deflect: "Thanks! I was actually just looking at the Q3 reports...",
        Vulnerability: "I really value being seen as a professional first and foremost."
    }
  },
  cafe: {
    id: 'cafe',
    title: 'The Café',
    description: 'Social/Peer Context',
    setupText: "You're catching up with a friend at a café. They mention your dating history and say: 'Wait, didn't you date someone of the opposite sex before? So... you're not actually gay then, right?'",
    privilegedSetupText: "Your friend nods while you talk about your relationship history: 'It's just so much simpler when you pick a lane, you know? It's great that you're so settled and normal.'",
    rigidity: 40,
    relevantAxes: ['action', 'label'],
    correctDrivers: ['Binary Brain'],
    bestCards: ['Vulnerability'],
    isChallenge: false,
    correctResponse: "You share: 'I'm attracted to people across genders. It's not about picking a side.' They nod slowly: 'Oh... I didn't realize that was a thing. That makes sense though.'",
    wrongResponse: "They insist you must be 'confused' or 'going through a phase.' The conversation gets awkward.",
    gradient: 'from-orange-700 to-amber-900',
    emojis: '☕ 🥐',
    cardDialogues: {
        Humor: "I'm multidimensional! Like a really complicated coffee order.",
        Facts: "Attraction isn't rigid. Past partners don't dictate my future ones.",
        Deflect: "This latte is too delicious to talk about my dating history.",
        Vulnerability: "It hurts when you say that. I'm still the same person, regardless of who I date."
    },
    privilegedCardDialogues: {
        Humor: "Life is certainly simpler without the drama, right?",
        Facts: "I've always found comfort in traditional relationship structures.",
        Deflect: "Totally. Hey, are you going to finish that croissant?",
        Vulnerability: "It feels good to have a path that everyone understands and supports."
    }
  },
  campus: {
    id: 'campus',
    title: 'The Campus',
    description: 'Institutional Context',
    setupText: "You're filling out a form at the registrar's office. It has fields for 'Mother's Name' and 'Father's Name'—no other options. When you ask about alternatives, the staff member says: 'Just leave it blank if it doesn't apply to you.'",
    privilegedSetupText: "The registrar smiles as you hand in your forms: 'Mother and Father sections filled out... perfect. Standard forms are so much faster to process. Thank you for making my job easy.'",
    rigidity: 15,
    relevantAxes: ['label'],
    correctDrivers: ['Hierarchy Guard'],
    bestCards: ['Deflect'],
    isChallenge: false,
    correctResponse: "You politely ask if they could add an 'Other Guardian' field. The staff member pauses, then says: 'You know what? That's a good point. Let me make a note to update this form.'",
    wrongResponse: "The staff member shrugs: 'It's been this way forever. We can't change forms for every situation.'",
    gradient: 'from-indigo-800 to-purple-900',
    emojis: '🏫 📝',
    cardDialogues: {
        Humor: "I guess I'll just doodle a smiley face in the extra box!",
        Facts: "Family structures are diverse. This form excludes a significant student population.",
        Deflect: "I'll figure it out later. Can we move on to course selection?",
        Vulnerability: "Forms like this make me feel like my family doesn't exist here."
    },
    privilegedCardDialogues: {
        Humor: "I aim to please! No red tape for me today.",
        Facts: "Standardization definitely improves processing efficiency.",
        Deflect: "Glad to help. Is the course catalog available yet?",
        Vulnerability: "I appreciate how smooth this process is. It's a relief."
    }
  },
  park: {
    id: 'park',
    title: 'The Park',
    description: 'Public Space',
    setupText: "You're walking through the park with a same-sex partner, holding hands. A stranger passes by and mutters loudly: 'That's not something kids should have to see.'",
    privilegedSetupText: "A stranger walks by, sees you holding hands, and smiles warmly: 'It's such a relief to see a nice, wholesome couple these days. Some of the things you see out here... worry me.'",
    rigidity: 35,
    relevantAxes: ['action'],
    correctDrivers: ['Threat Alert'],
    bestCards: ['Humor'],
    isChallenge: false,
    correctResponse: "You smile and say: 'Kids see people holding hands all the time. It's just love.' The stranger pauses, looks uncomfortable, and walks away quickly.",
    wrongResponse: "The stranger posts about it on a neighborhood forum, calling it 'inappropriate public behavior.'",
    gradient: 'from-emerald-800 to-teal-900',
    emojis: '🌳 🤝',
    cardDialogues: {
        Humor: "Don't worry, we're rated G for General Audiences!",
        Facts: "Public affection is legal and common. We aren't breaking any rules.",
        Deflect: "Watch your step, there's a puddle right there.",
        Vulnerability: "We're just two people in love. We aren't trying to make a scene."
    },
    privilegedCardDialogues: {
        Humor: "We do our best to keep the neighborhood standards up!",
        Facts: "Public safety and decorum are important to us too.",
        Deflect: "Good afternoon! Lovely weather for a walk.",
        Vulnerability: "It feels nice to be recognized as part of the community."
    }
  },
  family: {
    id: 'family',
    title: 'Family Dinner',
    description: 'Challenge Scenario',
    setupText: "You're at a family dinner. Aunt: 'Honey, this is just a phase. You'll grow out of it.' Uncle: 'I don't understand why everyone needs to put a label on everything these days.'",
    privilegedSetupText: "At dinner, your Aunt beams: 'I'm just so glad you made the right choice to settle down.' Uncle nods: 'Exactly. Life is just better when you follow the path and don't complicate things.'",
    rigidity: 50,
    relevantAxes: ['label', 'action'],
    correctDrivers: ['Choice Trap', 'Binary Brain'],
    bestCards: ['Humor', 'Vulnerability'],
    isChallenge: true,
    correctResponse: "You laugh gently: 'I've been in this \"phase\" for ten years.' You add: 'Labels help me understand myself.' Both relatives go quiet, then your aunt says: 'I suppose... we just want you to be happy.'",
    wrongResponse: "Both relatives become defensive. The conversation escalates. You excuse yourself and leave dinner early.",
    gradient: 'from-red-800 to-orange-900',
    emojis: '🏠 🍽️',
    cardDialogues: {
        Humor: "If this is a phase, it's lasting longer than my goth era!",
        Facts: "Identity is a core trait, not a temporary state I can switch off.",
        Deflect: "These potatoes are amazing. Aunt Linda, is this your recipe?",
        Vulnerability: "This isn't a phase. It's who I am, and I want you to know the real me."
    },
    privilegedCardDialogues: {
        Humor: "I figured it was time to grow up eventually!",
        Facts: "Stability has statistically better outcomes for long-term health.",
        Deflect: "The potatoes are delicious. Can I have the recipe?",
        Vulnerability: "I'm really happy with my life path. It feels right."
    }
  }
};

export const VIBE_SUGGESTIONS = [
  "The Explorer", "Still Figuring It Out", "Unapologetically Me", "The Shapeshifter", "Just Vibing", "The Daydreamer", "The Architect"
];