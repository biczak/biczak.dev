export const site = {
  name: 'Alex Biczak',
  shortName: 'Alex Biczak',
  tagline: 'I build the interesting bits — frontend at the seam of motion, color, and interaction.',
  bio: [
    'Senior frontend engineer with experience across React, other modern frameworks, and the parts of the platform that make interfaces feel alive — motion, 3D, real-time canvas, accessible color.',
    'I care about the craft. The site you are reading is part of the work sample — every interaction here was designed and built with the same attention I bring to client projects.',
  ],
  email: 'alex@biczak.dev',
  socials: [
    { label: 'GitHub', href: 'https://github.com/alexbiczak' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/alexbiczak' },
  ],
  workHistory: [
    {
      company: 'Placeholder Co.',
      role: 'Senior Frontend Engineer',
      dates: '2024 — Present',
      detail: 'One to two lines describing scope, impact, and tech.',
    },
    {
      company: 'Earlier Co.',
      role: 'Frontend Engineer',
      dates: '2021 — 2024',
      detail: 'One to two lines describing scope, impact, and tech.',
    },
  ],
  tools: [
    {
      slug: 'easing',
      name: 'Easing Curve Lab',
      summary: 'Design and feel custom cubic-bezier easings across five animated targets at once.',
      skills: 'Animation · UX · CSS',
      available: true,
    },
    {
      slug: 'audio',
      name: 'Audio-Reactive Canvas',
      summary: 'Web Audio FFT into a canvas visualization with real-time controls.',
      skills: 'WebAudio · Canvas · Perf',
      available: false,
    },
    {
      slug: 'palette',
      name: 'AI Mood Palette',
      summary: 'Type a mood, stream a 5-color palette with evocative names. Rate-limited demo.',
      skills: 'AI · Color · Streaming',
      available: false,
    },
    {
      slug: 'type',
      name: '3D Type Playground',
      summary: 'Variable font axes bound to mouse and scroll, exportable as a poster.',
      skills: 'WebGL · Typography · Motion',
      available: false,
    },
  ],
  repo: 'https://github.com/alexbiczak/biczak.dev',
} as const;

export type SiteContent = typeof site;
