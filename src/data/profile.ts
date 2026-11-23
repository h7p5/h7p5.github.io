/**
 * ALL the portfolio content lives here.
 * Anything still in [square brackets] is waiting for your real information.
 * Empty lists hide their block; an empty `email` hides the email buttons.
 */

export type Fact = { label: string; value: string }
export type EducationItem = { period: string; title: string; place: string; detail?: string }
export type Language = { name: string; level: string; /** 0–5 dots */ score: number }
export type ProjectStatus = 'live' | 'building' | 'planned'
export type ProjectArt = 'chess' | 'reps' | 'robot' | 'uploader'
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
  label: 'Developer · Algeria',
  /** Leave empty to hide every email button. */
  email: '',
  github: { handle: 'h7p5', href: 'https://github.com/h7p5' },
  /** Shown in Contact next to GitHub. Empty list hides the row. */
  socials: [{ label: 'Instagram', href: 'https://www.instagram.com/h_7p5/' }] as Link[],

  about: ["Hey, I'm Achraf. Here are a few things I made."],

  facts: [
    { label: 'From', value: 'Algeria' },
    { label: 'Field', value: 'Computer Science' },
    { label: 'Daily setup', value: 'Arch Linux' },
  ] as Fact[],

  /** Empty list hides the Education section. */
  education: [] as EducationItem[],

  skills: [
    'JavaScript',
    'Python',
    'C++ (Arduino)',
    'HTML & CSS',
    'Game-tree search (minimax, alpha-beta)',
    'Electronics',
    'Linux (Arch)',
    'Git & GitHub',
    'AI-assisted development',
  ],

  /** Empty list hides the Languages column and the hero stat. */
  languages: [] as Language[],

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
      title: 'Fire-fighting robot',
      status: 'building',
      summary: 'An Arduino robot that finds a flame by itself, drives to it and puts it out with water.',
      details: [
        'A 5-channel infrared sensor tells the robot where the flame is, left to right.',
        'The firmware is a state machine: search, approach, spray, check, back off.',
        'Safety limits: the pump never runs more than 4 s, and the robot raises an alarm after 4 failed attempts.',
        'Firmware passes all 7 scenarios in a PC simulation. The hardware build is in progress.',
      ],
      tags: ['C++', 'Arduino', 'Robotics', 'Electronics'],
      links: [{ label: 'Source code', href: 'https://github.com/h7p5/fire-fighting-robot' }],
      art: 'robot',
    },
    {
      title: 'Instagram uploader',
      status: 'live',
      summary: 'A desktop app to post Stories, Reels and Posts to Instagram from Windows or Linux.',
      details: [
        'Uploads several files at once, with an optional cover image and caption.',
        'The password is never stored; only the login session is saved.',
        'Written in Python with Tkinter.',
      ],
      tags: ['Python', 'Tkinter', 'Desktop app'],
      links: [{ label: 'Source code', href: 'https://github.com/h7p5/insta-uploader' }],
      art: 'uploader',
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

  /** Empty list hides the "Beyond code" section. */
  interests: [] as Interest[],
}
