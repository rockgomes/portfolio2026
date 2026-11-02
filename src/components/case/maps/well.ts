// The Well order stages map, from the Figma sketch (frame 582:1292, maps 586:1336 and 586:1368), at 1x.
import type { StateMapDef } from '../state-map';

export const orderStages: StateMapDef = {
  id: 'well-orders',
  label: 'Order stages',
  description: 'A flow: Requested, Labelling and checking, FlowRX, Ready to dispatch, Dispatched, Delivered. Issue found sends an order from FlowRX to Exceptions, and resolved brings it back. An issue after Delivered leads to Claim failed. A cancel request can move an order from any stage to Cancelled.',
  nodes: [
    { id: 'requested', label: 'Requested', x: 64, y: 186, w: 99, h: 29 },
    { id: 'labelling', label: 'Labelling and checking', x: 219, y: 180, w: 168, h: 40 },
    { id: 'flowrx', label: 'FlowRX', x: 443, y: 180, w: 77, h: 40 },
    { id: 'exceptions', label: 'Exceptions', x: 433, y: 54, w: 97, h: 40 },
    { id: 'ready', label: 'Ready to dispatch', x: 596, y: 180, w: 137, h: 40 },
    { id: 'dispatched', label: 'Dispatched', x: 219, y: 304, w: 98, h: 40 },
    { id: 'delivered', label: 'Delivered', x: 374, y: 304, w: 87, h: 40 },
    { id: 'claim', label: 'Claim failed', x: 558, y: 304, w: 101, h: 40 },
    { id: 'cancelled', label: 'Cancelled', x: 563, y: 436, w: 92, h: 40 },
  ],
  edges: [
    { from: 'requested', to: 'labelling', d: 'M169,200 H215' },
    { from: 'labelling', to: 'flowrx', d: 'M391,200 H439' },
    { from: 'flowrx', to: 'exceptions', d: 'M467,176 V98', chip: { text: 'issue found', x: 426, y: 137 } },
    { from: 'exceptions', to: 'flowrx', d: 'M495,98 V176', chip: { text: 'resolved', x: 531, y: 137 } },
    { from: 'flowrx', to: 'ready', d: 'M524,200 H592' },
    { from: 'ready', to: 'dispatched', d: 'M665,224 V250 Q665,262 653,262 H281 Q269,262 269,274 V300' },
    { from: 'dispatched', to: 'delivered', d: 'M322,324 H370' },
    { from: 'delivered', to: 'claim', d: 'M466,324 H554', chip: { text: 'issue', x: 510, y: 324 } },
    { from: '*', to: 'cancelled', d: 'M609,366 V432', chip: { text: 'cancel request', x: 609, y: 399 } },
  ],
  height: 490,
  anyStage: { x: 44, y: 34, w: 710, h: 332 },
  tour: [
    ['requested', 'labelling', 'flowrx', 'exceptions', 'flowrx', 'ready', 'dispatched', 'delivered', 'claim'],
    ['requested', 'labelling', 'flowrx', 'cancelled'],
  ],
};
