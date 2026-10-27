// The hero story's conversation (HeroStory.astro). Copy confirmed by Rock (October 26, 2026), taken from the Dynamic Lists case study.
// While the story plays, each message sits next to the cursor of the person who says it (Hero.astro); at the end they
// are the resolved comment thread. `keep` stays open in that thread. `above` puts the message above the cursor,
// for a cursor that clicks something that opens below it (Rock opens the + Condition menu).
export type StoryMessage = { who: string; initial: string; color: 'pm' | 'rock' | 'dev'; text: string; keep?: boolean; above?: boolean };

export const messages: StoryMessage[] = [
  { who: 'PM', initial: 'P', color: 'pm', text: 'Users duplicate a list just to filter it in different ways. Then the copies stop matching.', keep: true },
  { who: 'Rock', initial: 'R', color: 'rock', text: "Let's keep one list and save the filter as a view on top of it. Like this.", above: true },
  { who: 'Dev', initial: 'D', color: 'dev', text: 'Does a view copy the companies, or only store the filter?' },
  { who: 'Rock', initial: 'R', color: 'rock', text: 'Only the filter. The list stays the source of truth, so a view never drifts.' },
];
