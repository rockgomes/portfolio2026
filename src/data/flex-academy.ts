// Flex Academy case study content that the old Webflow embeds held in JavaScript (public/embeds/flex-academy-embeds.js,
// fa-method and fa-ins), copied word for word. The hex values describe the Flex design system as content; they are not
// this site's styles.

export type StepView = { lead: string; items: string[]; gate: string };
export type Step = { name: string; short: string; solo: StepView; team: StepView; why: string };

export const steps: Step[] = [
  {
    name: 'Frame', short: 'Two jobs, four principles',
    solo: { lead: 'Two jobs-to-be-done, one per reader, and four principles that became the review criteria.', items: ['Read the brief for the real problem: trust, not layout', 'Wrote what each reader needs to believe', 'Set the rules: sourced facts only, AA by default'], gate: 'Gate: every later choice is checked against the principles.' },
    team: { lead: 'A one-hour kickoff with PM, engineering and research. We agree the jobs, the success metrics and what we will not do.', items: ['PM owns the metrics and the guardrails', 'Engineering flags constraints early: CMS, forms, analytics', 'Principles written down and shared, so critique has a reference'], gate: 'Gate: signed-off brief on one page.' },
    why: 'The brief is about trust. Framing it that way changed every later choice.',
  },
  {
    name: 'Research', short: 'Fact bank, 45 references',
    solo: { lead: 'Audited both parent brands for facts and voice. Collected 45 references, each with the one principle to take from it.', items: ['theflex.global and base360.ai: every public fact', 'Mobbin for booking and webinar flows', 'Awwwards and Codrops for motion and craft'], gate: 'Gate: a fact bank. If a claim is not in it, it is not on the page.' },
    team: { lead: 'Same desk research, plus five short interviews per audience before high fidelity.', items: ['Research partner runs the interviews, I join as note-taker', 'Synthesis in one shared board, not in slides', 'We look for the words people use, then write the copy with them'], gate: 'Gate: top three objections per audience, in their words.' },
    why: 'Without a fact bank, "proof" turns into marketing copy.',
  },
  {
    name: 'Structure', short: 'Ten sections, every state',
    solo: { lead: 'Low-fidelity wireframes for the full page and both booking flows, with every state.', items: ['Each section has one job', 'Error, empty and loading states drawn, not assumed', 'Mobile and desktop at the same time'], gate: 'Gate: the structure passes the three brief tests on paper.' },
    team: { lead: 'Wireframes reviewed with PM and engineering before any visual work.', items: ['Engineering checks the forms and the data each step needs', 'Content gaps found here, not in hi-fi', 'Copy owner named for every section'], gate: 'Gate: structure frozen, so visuals do not reopen it.' },
    why: 'Structure decided in grey is cheaper to change than structure decided in colour.',
  },
  {
    name: 'Diverge', short: 'Directions with the same content',
    solo: { lead: 'Explored several art directions with identical content, so only the idea changed.', items: ['Lights On, Your Next Unit, The Calendar and others', 'Each one judged against the tests and the principles', 'Strengths written down even for directions I killed'], gate: 'Gate: one direction, plus the best ideas stolen from the others.' },
    team: { lead: 'Two or three designers explore in parallel for a fixed time, then we hold one critique.', items: ['Critique against the principles, not taste', 'Silent review first, then discussion', 'The lead decides and writes down why'], gate: 'Gate: decision log entry with what we chose and what we dropped.' },
    why: 'Same content in every direction means we judge the idea, not the polish.',
  },
  {
    name: 'Converge', short: 'One page, two paths',
    solo: { lead: 'Built the chosen direction at full fidelity, on desktop and mobile, with both flows and the motion prototype.', items: ['Calendar hero with the path switch', 'The hard truth as proof without promises', 'Both booking flows with no dead ends'], gate: 'Gate: both readers can act from any point of the scroll.' },
    team: { lead: 'Weekly design review with the whole team. Usability test the prototype with five people per audience.', items: ['Fix the top issues, park the rest in the backlog', 'Stakeholders see work in progress, not a reveal', 'Accessibility review before sign-off, not after'], gate: 'Gate: usability findings addressed, stakeholders signed off.' },
    why: 'Full fidelity on both screens, because mobile changed the design the most.',
  },
  {
    name: 'System', short: 'Tokens, components, docs',
    solo: { lead: 'Every value on a token, every component with properties and a description, a Tokens page that documents itself.', items: ['3 collections, 2 modes, 36 text styles', 'Coverage measured with a script, not by eye', 'Contrast fixed in the token, not per layer'], gate: 'Gate: 100% coverage on the final page.' },
    team: { lead: 'The tokens become a contract with engineering, with a simple way to change it.', items: ['Changes go through a request and a review, then a version note', 'Same names in Figma and in CSS', 'Design system office hours once a week'], gate: 'Gate: the token file and the CSS never disagree.' },
    why: 'A system you cannot measure is a system you hope for.',
  },
  {
    name: 'Build and verify', short: 'Prototype with tests',
    solo: { lead: 'A coded prototype with CI: HTML validation, axe in light and dark, overflow checks, end-to-end flows, preview link per change.', items: ['Production habits on a prototype', 'Every change through a pull request', 'Dark mode tested by the machine'], gate: 'Gate: CI green, preview approved.' },
    team: { lead: 'Engineering builds. I pair on the first components and review every preview link.', items: ['Definition of done includes accessibility and both themes', 'Analytics events agreed before launch', 'A launch checklist the whole team owns'], gate: 'Gate: metrics live on day one, with the guardrails.' },
    why: 'A test suite that runs on every push is the only promise that holds.',
  },
];

/** One prop of an inspected layer: c = colour token, t = text style, s = space or radius token, x = effect. */
export type PinProp = ['c' | 't' | 's' | 'x', string, string?];
/** A layer of the Figma hero. x, y, w, h are pixels on the 1440x905 hero picture. */
export type Pin = { name: string; kind: string; x: number; y: number; w: number; h: number; props: PinProp[] };

// The four layers sketch C 377:10168 pins, out of the eight in the old embed
export const pins: Pin[] = [
  { name: 'Button', kind: 'Instance · Button, Kind=Launch', x: 80, y: 567, w: 284, h: 58, props: [['c', 'launch/accent'], ['c', 'text/on-accent', 'label'], ['t', 'Button/16', 'Geist SemiBold 16'], ['s', 'radius/16'], ['s', 'space/28', 'padding']] },
  { name: 'Path switch', kind: 'Instance · Path switch', x: 952, y: 32, w: 264, h: 44, props: [['c', 'bg/surface'], ['c', 'launch/tint', 'thumb'], ['c', 'border/default', 'stroke'], ['s', 'radius/12'], ['s', 'space/4', 'padding']] },
  { name: 'Scale bar', kind: 'Frame · Systems', x: 1013, y: 340, w: 226, h: 44, props: [['c', 'scale/tint'], ['c', 'scale/text', 'label']] },
  { name: 'Event card', kind: 'Instance · Event card, Path=Launch', x: 604, y: 568, w: 336, h: 197, props: [['c', 'bg/surface'], ['c', 'launch/accent', 'date bar'], ['x', 'shadow/key'], ['s', 'space/24', 'padding left'], ['s', 'space/12', 'gap']] },
];

export const tokenValues: Record<string, [light: string, dark: string]> = {
  'bg/page': ['#F4F6F1', '#0D1412'], 'bg/surface': ['#FFFFFF', '#141D1A'], 'bg/subtle': ['#F1F3EE', '#1E2A27'],
  'text/primary': ['#111917', '#EEF3EF'], 'text/muted': ['#4A504E', '#A9B3AE'], 'text/subtle': ['#646A67', '#8A948F'], 'text/on-accent': ['#FFFFFF', '#FFFFFF'],
  'border/default': ['#E2E5E0', '#26312E'],
  'launch/accent': ['#284E4C', '#2F6360'], 'launch/tint': ['#DDE9E2', '#1F3A36'], 'launch/text': ['#284E4C', '#9CC7B5'],
  'scale/tint': ['#E6EAFF', '#222B57'], 'scale/text': ['#3350DB', '#A9B8FF'],
  'shadow/key': ['ink 14%', 'black 50%'],
};

export const spaceValues: Record<string, string> = {
  'space/4': '4', 'space/12': '12', 'space/16': '16', 'space/24': '24', 'space/28': '28', 'radius/12': '12', 'radius/16': '16', 'radius/24': '24',
};
