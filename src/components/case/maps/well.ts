// The three Well maps, from the Figma sketch (frame 582:1292, maps 586:1336, 586:1368 and 586:1397), at 1x.
import type { StateMapDef } from '../state-map';

export const orderStages: StateMapDef = {
  id: 'well-orders',
  label: 'Order stages',
  description: 'A flow: Requested, Labelling and checking, FlowRX, Ready to dispatch, Dispatched, Delivered. Issue found sends an order from FlowRX to Exceptions, and resolved brings it back. An issue after Delivered leads to Claim failed.',
  nodes: [
    { id: 'requested', label: 'Requested', x: 64, y: 186, w: 99, h: 29, start: true },
    { id: 'labelling', label: 'Labelling and checking', x: 219, y: 180, w: 168, h: 40 },
    { id: 'flowrx', label: 'FlowRX', x: 443, y: 180, w: 77, h: 40 },
    { id: 'exceptions', label: 'Exceptions', x: 433, y: 54, w: 97, h: 40 },
    { id: 'ready', label: 'Ready to dispatch', x: 596, y: 180, w: 137, h: 40 },
    { id: 'dispatched', label: 'Dispatched', x: 219, y: 304, w: 98, h: 40 },
    { id: 'delivered', label: 'Delivered', x: 374, y: 304, w: 87, h: 40, end: true },
    { id: 'claim', label: 'Claim failed', x: 558, y: 304, w: 101, h: 40, end: true },
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
  ],
  runs: [
    ['requested', 'labelling', 'flowrx', 'ready', 'dispatched', 'delivered'],
    ['requested', 'labelling', 'flowrx', 'exceptions', 'flowrx', 'ready', 'dispatched', 'delivered', 'claim'],
  ],
};

export const patientStates: StateMapDef = {
  id: 'well-patients',
  label: 'Patient states',
  description: 'A flow: a new patient is Active. From Active: move to hospital, move to care home, no longer in home, or mark as deceased. Patient returns goes from Hospitalised back to Active.',
  nodes: [
    { id: 'added', label: 'Patient added', x: 60, y: 216, w: 118, h: 29, start: true },
    { id: 'active', label: 'Active', x: 234, y: 210, w: 68, h: 40 },
    { id: 'hospital', label: 'Hospitalised', x: 596, y: 110, w: 106, h: 40 },
    { id: 'moved', label: 'Moved care homes', x: 596, y: 180, w: 142, h: 40, end: true },
    { id: 'gone', label: 'No longer in home', x: 596, y: 250, w: 139, h: 40, end: true },
    { id: 'deceased', label: 'Deceased', x: 596, y: 320, w: 88, h: 40, end: true },
  ],
  edges: [
    { from: 'added', to: 'active', d: 'M184,230 H230' },
    { from: 'active', to: 'hospital', d: 'M306,230 H338 Q350,230 350,218 V142 Q350,130 362,130 H592', chip: { text: 'move to hospital', x: 481, y: 130 } },
    { from: 'active', to: 'moved', d: 'M306,230 H338 Q350,230 350,218 V212 Q350,200 362,200 H592', chip: { text: 'move to care home', x: 481, y: 200 } },
    { from: 'active', to: 'gone', d: 'M306,230 H338 Q350,230 350,242 V258 Q350,270 362,270 H592', chip: { text: 'no longer in home', x: 481, y: 270 } },
    { from: 'active', to: 'deceased', d: 'M306,230 H338 Q350,230 350,242 V328 Q350,340 362,340 H592', chip: { text: 'mark as deceased', x: 481, y: 340 } },
    { from: 'hospital', to: 'active', d: 'M649,106 V60 Q649,48 637,48 H280 Q268,48 268,60 V206', chip: { text: 'patient returns', x: 459, y: 48 } },
  ],
  runs: [
    ['added', 'active', 'hospital', 'active', 'moved'],
    ['added', 'active', 'gone'],
    ['added', 'active', 'hospital', 'active', 'deceased'],
  ],
};

export const careHomeProfile: StateMapDef = {
  id: 'well-profile',
  label: 'Care home profile',
  description: 'A flow: the care homes list opens a care home profile with the tabs Cycle, Items, Patients, Activity, Contacts, GP surgeries and Units. Drill into unit leads from Units to a unit profile with the same tabs except Units.',
  nodes: [
    { id: 'list', label: 'Care homes list', x: 20, y: 100, w: 127, h: 29, start: true },
    { id: 'home', label: 'Care home profile', x: 203, y: 84, w: 526, h: 61, tabs: ['Cycle', 'Items', 'Patients', 'Activity', 'Contacts', 'GP surgeries', 'Units'] },
    { id: 'unit', label: 'Unit profile', x: 323, y: 254, w: 454, h: 61, tabs: ['Cycle', 'Items', 'Patients', 'Activity', 'Contacts', 'GP surgery'], end: true },
  ],
  edges: [
    { from: 'list', to: 'home', d: 'M153,114 H199' },
    { from: 'home', to: 'unit', d: 'M700,149 V188 Q700,200 688,200 H562 Q550,200 550,212 V250', chip: { text: 'drill into unit', x: 625, y: 200 } },
  ],
  runs: [['list', 'home', 'unit']],
};
