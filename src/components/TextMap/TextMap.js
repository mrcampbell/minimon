import React, { useState, useEffect } from 'react';

const DIRECTION_UP = "DIRECTION_UP"
const DIRECTION_DOWN = "DIRECTION_DOWN"
const DIRECTION_LEFT = "DIRECTION_LEFT"
const DIRECTION_RIGHT = "DIRECTION_RIGHT"
const TILE_BOULDER = {backgroundColor: '#A52A2A', letter: <span style={{backgroundColor: '#A52A2A'}}>B</span>, canWalk: false }
const TILE_SHORT_GRASS = {backgroundColor: '#3CB371', letter: <span style={{backgroundColor: '#3CB371'}}>,</span>, canWalk: true }
const TILE_TALL_GRASS = {backgroundColor: '#3CB371', letter: <span style={{backgroundColor: '#3CB371'}}>w</span>, canWalk: true }
const TILE_DIRT = {backgroundColor: '#FFF8DC', letter: <span style={{backgroundColor: '#FFF8DC'}}>.</span>, canWalk: true }

function TextMap() {

  const [userCoordinates, setUserCoordinates] = useState({ x: 1, y: 1 })

  const [mapLetters, setMapLetters] = useState(
    [
      [TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER],
      [TILE_BOULDER, TILE_SHORT_GRASS, TILE_SHORT_GRASS, TILE_SHORT_GRASS, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_BOULDER],
      [TILE_BOULDER, TILE_SHORT_GRASS, TILE_SHORT_GRASS, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_BOULDER],
      [TILE_BOULDER, TILE_SHORT_GRASS, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_BOULDER],
      [TILE_BOULDER, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_TALL_GRASS, TILE_TALL_GRASS, TILE_BOULDER],
      [TILE_BOULDER, TILE_DIRT, TILE_DIRT, TILE_TALL_GRASS, TILE_TALL_GRASS, TILE_TALL_GRASS, TILE_TALL_GRASS, TILE_BOULDER],
      [TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER],
    ]
  )

  const [mapText, setMapText] = useState([])

  useEffect(() => {
    let elements = [];
    let x = 0, y = 0;
    mapLetters.forEach(row => {
      row.forEach(cell => {
        if (y == userCoordinates.y && x == userCoordinates.x) {
          elements.push(<span style={{backgroundColor: cell.backgroundColor}}>@</span>);
        } else {
          elements.push(cell.letter);
        }
        y++;
      })
      x++;
      y = 0;
      elements.push(<br />)
    })

    setMapText(elements)
  }, [mapLetters, userCoordinates])

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  let direction;

  const handleKeyDown = (e) => {
    const input = getInputFromKeyPress(e);
    if (36 < e.keyCode && e.keyCode < 41) { // arrow keys
      const direction = input;
      const cif = getCoordinatesInFront(userCoordinates.x, userCoordinates.y, direction)
      if (mapLetters[cif.x][cif.y].canWalk) {
        setUserCoordinates(cif)
      }
    }
  }

  const getInputFromKeyPress = (e) => {
    switch (e.keyCode) {
      case 38: return DIRECTION_UP;
      case 40: return DIRECTION_DOWN;
      case 39: return DIRECTION_LEFT;
      case 37: return DIRECTION_RIGHT;
    }
  }

  const getCoordinatesInFront = (x, y, direction) => {
    switch (direction) {
      case DIRECTION_UP: return { x: x - 1, y }
      case DIRECTION_DOWN: return { x: x + 1, y }
      case DIRECTION_LEFT: return { x, y: y + 1 }
      case DIRECTION_RIGHT: return { x, y: y - 1 }
    }
  }

  return (
    <div className="TextMap">
      <code>
        {mapText}
      </code>
    </div>
  );
}

export default TextMap;
