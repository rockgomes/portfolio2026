import type { ImageMetadata } from 'astro';
import type { StateMapDef } from './state-map';

// The media a piece of case study proof can hold (used by Proof.astro and ProofSwitch.astro).
export type ProofMedia =
  | { kind: 'image'; src: string | ImageMetadata; alt: string; width: number; height: number }
  | { kind: 'video'; src: string; poster: string; label: string; width: number; height: number }
  | { kind: 'map'; map: StateMapDef };
