export interface MascotConfig {
  name: string;
  src: string;
  alt: string;
  role: string;
  recommendedUse: string[];
  aspectRatio: string;
}

export const mascots: Record<'ashley' | 'chris' | 'both', MascotConfig> = {
  ashley: {
    name: 'Ashley',
    src: '/mascots/ashley.png',
    alt: 'Ashley, VOXmatiON AI assistant mascot',
    role: 'AI Assistant & Customer Support Expert',
    recommendedUse: ['hero', 'how-it-works', 'features', 'side-accent'],
    aspectRatio: '10 / 13',
  },
  chris: {
    name: 'Chris',
    src: '/mascots/chris.png',
    alt: 'Chris, VOXmatiON AI automation mascot',
    role: 'AI Automation & Lead Qualification Expert',
    recommendedUse: ['how-it-works', 'benefits', 'side-accent'],
    aspectRatio: '10 / 13',
  },
  both: {
    name: 'Ashley & Chris Team',
    src: '/mascots/ashley-chris.png',
    alt: 'Ashley and Chris, VOXmatiON mascot team',
    role: 'Complete AI Solutions Team',
    recommendedUse: ['hero', 'cta-section', 'team-section'],
    aspectRatio: '16 / 9',
  },
};

export const getMascotConfig = (type: 'ashley' | 'chris' | 'both'): MascotConfig => {
  return mascots[type];
};
