import React from 'react'

import { DIRECTION_DOWN } from '../components/TextMap/TextMap'

const BOULDER = "b";
const SHORT_GRASS = "sg";
const TALL_GRASS = "tg";
const DIRT = "d";
const LEDGE = "l";



export class Map {
  constructor() {
    this.cell_types = {
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
        canWalk: true
      }
    }

    this.items = [
      { itemType: 'potion', coordinates: { x: 4, y: 4 }, pickedUp: false, isHidden: false },
    ]

    this.cells = [
      [BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, DIRT, DIRT, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, LEDGE, LEDGE, LEDGE, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, LEDGE, LEDGE, LEDGE, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, LEDGE, LEDGE, LEDGE, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, LEDGE, LEDGE, LEDGE, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, LEDGE, LEDGE, LEDGE, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, LEDGE, LEDGE, LEDGE, BOULDER],
      [BOULDER, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, SHORT_GRASS, DIRT, DIRT, LEDGE, LEDGE, LEDGE, BOULDER],
      [BOULDER, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, BOULDER],
      [BOULDER, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, DIRT, TALL_GRASS, TALL_GRASS, BOULDER],
      [BOULDER, DIRT, DIRT, DIRT, DIRT, DIRT, TALL_GRASS, TALL_GRASS, TALL_GRASS, TALL_GRASS, BOULDER],
      [BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER, BOULDER],
    ];
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