/**
 * ALL the portfolio content lives here.
 * Anything still in [square brackets] is waiting for your real information.
 * Empty lists hide their block; an empty `email` hides the email buttons.
 */

export type Fact = { label: string; value: string }
export type EducationItem = { period: string; title: string; place: string; detail?: string }
export type Language = { name: string; level: string; /** 0–5 dots */ score: number }
export type ProjectStatus = 'live' | 'building' | 'planned'
export type ProjectArt = 'chess' | 'reps'
export type Project = {
  title: string
  status: ProjectStatus
  summary: string
  details: string[]
  tags: string[]
  links: Link[]
  art: ProjectArt
}
export type Interest = { title: string; text: string; icon: 'chess' | 'circuit' }
export type Link = { label: string; href: string }

export const profile = {
  name: 'Achraf',
  /** Shown above your name in the hero. */
  label: 'Computer Science student · Algeria',
  /** Typed out letter by letter in the hero. */
  tagline:
    'I build things I care about: a chess engine you can play in the browser, and next, a camera rep counter.',
  /** Leave empty to hide every email button. */
  email: '',
  github: { handle: 'h7p5', href: 'https://github.com/h7p5' },

  about: [
    "I'm Achraf, a university student from Algeria who learns best by building. My first public project is a chess engine that searches positions with minimax and alpha-beta pruning, and anyone can play it in the browser.",
    'Away from the screen I play chess. It taught me that steady practice beats talent. Next, I want to bring code into the physical world with Arduino.',
  ],

  facts: [
    { label: 'From', value: 'Algeria' },
    { label: 'Speaks', value: 'Arabic, English, French' },
    { label: 'Field', value: 'Computer Science' },
    { label: 'Daily setup', value: 'Arch Linux' },
  ] as Fact[],

  education: [
    {
      period: '[2025 – now]',
      title: '[Degree / programme]',
      place: '[University, City]',
      detail: '[Average / ranking]',
    },
    {
      period: '[2025]',
      title: 'Baccalauréat — [stream]',
      place: '[High school, City]',
      detail: '[Grade, mention]',
    },
  ] as EducationItem[],

  skills: [
    'JavaScript',
    'HTML & CSS',
    'Game-tree search (minimax, alpha-beta)',
    'Linux (Arch)',
    'Git & GitHub',
    'AI-assisted development',
  ],

  languages: [
    { name: 'Arabic', level: 'Native', score: 5 },
    { name: 'English', level: 'Very good', score: 4 },
    { name: 'French', level: 'Beginner', score: 1 },
  ] as Language[],

  projects: [
    {
      title: 'Chess engine',
      status: 'live',
      summary: 'A chess engine you can play against, right in the browser.',
      details: [
        'Searches the game tree with minimax and prunes hopeless branches with alpha-beta.',
        'Written in JavaScript, HTML and CSS.',
        'Deployed on GitHub Pages, so anyone can play it.',
      ],
      tags: ['JavaScript', 'Algorithms', 'Game AI'],
      links: [
        { label: 'Play it', href: 'https://h7p5.github.io/chess-engine/' },
        { label: 'Source code', href: 'https://github.com/h7p5/chess-engine' },
      ],
      art: 'chess',
    },
    {
      title: 'Camera rep counter',
      status: 'planned',
      summary: 'Counts exercise reps from a webcam, so training logs itself.',
      details: [
        'Follows body pose through the camera.',
        'Detects each full repetition: push-ups, pull-ups, dips.',
      ],
      tags: ['Computer vision', 'Fitness'],
      links: [],
      art: 'reps',
    },
  ] as Project[],

  interests: [
    { title: 'Chess', text: 'Playing it is what made me want to build an engine that plays it.', icon: 'chess' },
    { title: 'Arduino', text: 'Next step: electronics and code that act in the real world.', icon: 'circuit' },
  ] as Interest[],
}
