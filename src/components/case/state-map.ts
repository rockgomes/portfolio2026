// A state map (StateMap.astro): boxes for the states and lines for the moves between them, drawn on a fixed 798 x 398
// canvas (the Figma maps at 1x). Positions come from the Figma frames; lines use absolute M, H, V and Q commands only,
// so the arrow at the end can be worked out from the last command.
export interface MapNode {
  id: string;
  label: string;
  x: number; y: number; w: number; h: number;
  start?: boolean; // the flow-start chip (Figma 551:1391)
  end?: boolean; // the flow can stop here
  tabs?: string[]; // a profile: its tabs, stepped through when the flow arrives
  tabEnd?: number; // the tab the flow leaves from (default: the last one)
}
export interface MapEdge {
  from: string;
  to: string;
  d: string;
  chip?: { text: string; x: number; y: number }; // the interaction chip (Figma 551:1406), centred on x, y
}
export interface StateMapDef {
  id: string;
  label: string; // the name of the map, for screen readers
  description: string; // the whole map in words
  nodes: MapNode[];
  edges: MapEdge[];
  runs: string[][]; // what plays on its own, one run after the other: each run is a path of state ids from the start
}
export const MAP_W = 798;
export const MAP_H = 398;

/** The chevron at the end of a line, pointing the way the last H or V command goes. */
export function arrowHead(d: string, size = 6) {
  let x = 0, y = 0, dir: 'l' | 'r' | 'u' | 'd' = 'r';
  for (const [, cmd, args] of d.matchAll(/([MHVQ])([^MHVQ]*)/g)) {
    const n = args.trim().split(/[\s,]+/).map(Number);
    if (cmd === 'M') [x, y] = n;
    else if (cmd === 'H') { dir = n[0] >= x ? 'r' : 'l'; x = n[0]; }
    else if (cmd === 'V') { dir = n[0] >= y ? 'd' : 'u'; y = n[0]; }
    else if (cmd === 'Q') [x, y] = [n[2], n[3]];
  }
  const s = size;
  return {
    r: `M${x - s},${y - s} L${x},${y} L${x - s},${y + s}`,
    l: `M${x + s},${y - s} L${x},${y} L${x + s},${y + s}`,
    d: `M${x - s},${y - s} L${x},${y} L${x + s},${y - s}`,
    u: `M${x - s},${y + s} L${x},${y} L${x + s},${y + s}`,
  }[dir];
}
