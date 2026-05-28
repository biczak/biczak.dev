export const colors = {
  ink: '#07091a',
  paper: '#e5e7ff',
  cyan: '#22d3ee',
  violet: '#8b5cf6',
  rose: '#ec4899',
  graphite: '#14171f',
} as const;

export const durations = {
  flash: 80,
  quick: 180,
  base: 320,
  slow: 560,
} as const;

export const easings = {
  entrance: [0.2, 0.7, 0.1, 1] as const,
  spring: { stiffness: 400, damping: 30 } as const,
};

export const gradient = `linear-gradient(95deg, ${colors.cyan} 0%, ${colors.violet} 55%, ${colors.rose} 100%)`;

export type ColorToken = keyof typeof colors;
export type DurationToken = keyof typeof durations;
