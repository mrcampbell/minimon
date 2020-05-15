import React from 'react'

import { DIRECTION_DOWN } from '../components/TextMap/TextMap'

const BOULDER = "b";
const SHORT_GRASS = "sg";
const TALL_GRASS = "tg";
const DIRT = "d";
const LEDGE = "l";
const VERTICAL_FENCE = "vf"
const HORIZONTAL_FENCE = "hf"
const LADDER = "la";

export class MapService {

  // these are used globally
  initializeCellTypes() {
    this.cell_types = {
      [LADDER]: {
        backgroundColor: "#FFF8DC",
        element: <div style={{ backgroundColor: '#FFF8DC' }}>H</div>,
        canWalk: true,
      },
      [BOULDER]: {
        backgroundColor: "#A52A2A",
        element: <div style={{ backgroundColor: '#A52A2A' }}>B</div>,
        canWalk: false,
      },
      [SHORT_GRASS]: {
        backgroundColor: "#3CB371",
        element: <div style={{ backgroundColor: '#3CB371' }}>,</div>,
        canWalk: true,
      },
      [DIRT]: {
        backgroundColor: "#FFF8DC",
        element: <div style={{ backgroundColor: '#FFF8DC' }}>.</div>,
        canWalk: true,
      },
      [LEDGE]: {
        backgroundColor: '#FFF8DC',
        element: <div style={{ backgroundColor: '#FFF8DC' }}>_</div>,
        canWalk: true,
        isLedge: true,
        forceDirection: DIRECTION_DOWN,
      },
      [TALL_GRASS]: {
        backgroundColor: '#3CB371',
        element: <div style={{ backgroundColor: '#3CB371' }}>w</div>,
        canWalk: true,
        encounterChance: 15, // out of a hundred that you'll encounter a wild pokemon
      },
      [VERTICAL_FENCE]: {
        backgroundColor: '#FFF',
        element: <div style={{ backgroundColor: '#FFF' }}>|</div>,
        canWalk: false,
      },
      [HORIZONTAL_FENCE]: {
        backgroundColor: '#FFF',
        element: <div style={{ backgroundColor: '#FFF' }}>-</div>,
        canWalk: false,
      }
    }
  }

  initalizeMapA() {
    this.maps['A'] = {
      items: [
        { itemType: 'potion', coordinates: { x: 4, y: 4 }, pickedUp: false, isHidden: false },
      ],
      portals: [
        {
          coordinates: { x: 5, y: 5 },
          destination: {
            map_id: 'B',
            coordinates: { x: 2, y: 1 }
          },
        }
      ],
      cells: [
        [BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, VERTICAL_FENCE, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, VERTICAL_FENCE, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, VERTICAL_FENCE, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, LADDER, VERTICAL_FENCE, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, HORIZONTAL_FENCE, HORIZONTAL_FENCE, HORIZONTAL_FENCE, HORIZONTAL_FENCE, HORIZONTAL_FENCE, VERTICAL_FENCE, LEDGE, LEDGE, LEDGE, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, TALL_GRASS, TALL_GRASS, BOULDER],
        [BOULDER, DIRT, DIRT, DIRT, DIRT, DIRT, TALL_GRASS, TALL_GRASS, TALL_GRASS, TALL_GRASS, BOULDER],
        [BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER],
      ],
      encounter_types: {
        1: {
          breed_id: 25,
          breed_name: "Pikachu",
          level_range: {
            min: 10,
            max: 13,
          },
          occurance_weight: 10,
        },
        2: {
          breed_id: 1,
          breed_name: "Bulbasaur",
          level_range: {
            min: 9,
            max: 14,
          },
          occurance_weight: 50,
        }
      }
    }
  }

  initalizeMapB() {
    this.maps['B'] = {
      items: [
        { itemType: 'potion', coordinates: { x: 2, y: 2 }, pickedUp: false, isHidden: false },
      ],
      portals: [
        {
          coordinates: { x: 2, y: 1 },
          destination: {
            map_id: 'A',
            coordinates: { x: 5, y: 5 }
          },
        }
      ],
      cells: [
        [BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER],
        [BOULDER, DIRT, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, LADDER, DIRT, DIRT, DIRT, BOULDER],
        [BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER],
      ],
      encounter_types: {},
    }
  }

  constructor() {
    this.maps = [];
    this.initializeCellTypes();
    this.initalizeMapA();
    this.initalizeMapB();
  }
  getMap(id) {
    const data = this.maps[id];
    if (data !== undefined) {
      return new Map(this.cell_types, data.cells, data.items, data.encounter_types, data.portals)
    }
  }
}

export class Map {
  constructor(cell_types, cells, items, encounter_types, portals) {
    this.cell_types = cell_types;
    this.cells = cells;
    this.items = items;
    this.encounter_types = encounter_types;
    this.portals = portals;

    this.encounters = []; // set in compileEncounters

    this.compileEncounters()
  }

  // TODO: Improve
  compileEncounters() {
    let totalOccuranceWeight = 0;
    // get sum of occurance weights
    for (const [key, value] of Object.entries(this.encounter_types)) {
      totalOccuranceWeight += value.occurance_weight;
    }
    let occuranceChanceIdx = 0;
    let encounterRatio = 100 / totalOccuranceWeight;

    for (const [key, value] of Object.entries(this.encounter_types)) {
      this.encounters.push({
        occurance_value: Math.ceil(encounterRatio * value.occurance_weight + occuranceChanceIdx),
        breed_id: value.breed_id,
        breed_name: value.breed_name,
        level_range: value.level_range,
      })

      occuranceChanceIdx += encounterRatio;
    }
  }

  getEncounter(encounterVariable) {

  }

  getMapCells() {
    let result = [];
    this.cells.forEach(row => {
      let line = [];
      row.forEach(cell => {
        line.push(this.cell_types[cell])
      })
      result.push(line)
    })
    return result;
  }

  getItemCells() {
    let result = [];
    const x = this.cells.length;
    const y = this.cells[0].length;
    console.log(x, y)

    for (let xIdx = 0; xIdx < x; xIdx++) {
      let line = [];
      for (let yIdx = 0; yIdx < y; yIdx++) {
        line.push(undefined)
      }
      result.push(line);
    }

    this.items.forEach(i => {
      result[i.coordinates.x][i.coordinates.y] = i;
    })

    return result;
  }

  validate() {
    // todo: ensure no two items with same coord
    // todo: ensure each horizontal rows same length
    // todo: ensure each virtical rows same length
  }
}