import React, { useState, useEffect } from 'react';
import './TextMap.css'
const DIRECTION_UP = "DIRECTION_UP"
const DIRECTION_DOWN = "DIRECTION_DOWN"
const DIRECTION_LEFT = "DIRECTION_LEFT"
const DIRECTION_RIGHT = "DIRECTION_RIGHT"
const TILE_BOULDER = {backgroundColor: '#A52A2A', letter: <div style={{backgroundColor: '#A52A2A'}}>B</div>, canWalk: false }
const TILE_SHORT_GRASS = {backgroundColor: '#3CB371', letter: <div style={{backgroundColor: '#3CB371'}}>,</div>, canWalk: true }
const TILE_TALL_GRASS = {backgroundColor: '#3CB371', letter: <div style={{backgroundColor: '#3CB371'}}>w</div>, canWalk: true }
const TILE_DIRT = {backgroundColor: '#FFF8DC', letter: <div style={{backgroundColor: '#FFF8DC'}}>.</div>, canWalk: true }
const TILE_LEDGE = {backgroundColor: '#FFF8DC', letter: <div style={{backgroundColor: '#FFF8DC'}}>_</div>, canWalk: true, isLedge: true, forceDirection: DIRECTION_DOWN }

function TextMap() {

  const [userCoordinates, setUserCoordinates] = useState({ x: 1, y: 1 })

  const [mapTiles, setmapTiles] = useState(
    [
      [TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER],
      [TILE_BOULDER, TILE_SHORT_GRASS, TILE_SHORT_GRASS, TILE_SHORT_GRASS, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_BOULDER],
      [TILE_BOULDER, TILE_SHORT_GRASS, TILE_SHORT_GRASS, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_BOULDER],
      [TILE_BOULDER, TILE_SHORT_GRASS, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_LEDGE, TILE_LEDGE, TILE_BOULDER],
      [TILE_BOULDER, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_BOULDER],
      [TILE_BOULDER, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_DIRT, TILE_TALL_GRASS, TILE_TALL_GRASS, TILE_BOULDER],
      [TILE_BOULDER, TILE_DIRT, TILE_DIRT, TILE_TALL_GRASS, TILE_TALL_GRASS, TILE_TALL_GRASS, TILE_TALL_GRASS, TILE_BOULDER],
      [TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER, TILE_BOULDER],
    ]
  )

  const [mapElements, setMapElements] = useState([])

  useEffect(() => {
    applyForceDirection(mapTiles, userCoordinates); // if on slide tiles, ledge, etc
    renderMap(mapTiles, userCoordinates)
  }, [mapTiles, userCoordinates])

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const applyForceDirection = (mapTiles, userCoordinates) => {
    const tileBeneathPlayer = getTileFromCoordinates({x: userCoordinates.x, y: userCoordinates.y})
    if (tileBeneathPlayer.forceDirection) {
      let targetCoordinates = getCoordinatesInDirection({
        x: userCoordinates.x, 
        y: userCoordinates.y, 
        direction: tileBeneathPlayer.forceDirection
      })
      setTimeout(() => {
        setUserCoordinates(targetCoordinates)
      }, 200);
    }
  }

  const renderMap = (mapTiles, userCoordinates) => {
    let elements = [];
    let x = 0, y = 0;
    mapTiles.forEach(row => {
      let line = [];
      row.forEach(cell => {
        if (y === userCoordinates.y && x === userCoordinates.x) {
          line.push(<div className="tile-wrapper" key={`${x}-${y}`} style={{backgroundColor: cell.backgroundColor}}>@</div>);
        } else {
          line.push(<div className="tile-wrapper" key={`${x}-${y}`}>{cell.letter}</div>);
        }
        y++;
      })
      elements.push(<div key={`${x}-${y}-row`} className="tile-row">{line}</div>)
      x++;
      y = 0;
    })

    setMapElements(<div className="tile-map-wrapper">{elements}</div>)
  }

  const handleKeyDown = (e) => {
    const input = getInputFromKeyPress(e);
    if (36 < e.keyCode && e.keyCode < 41) { // arrow keys
      const direction = input;
      const cif = getCoordinatesInDirection({x: userCoordinates.x, y: userCoordinates.y, direction})
      const tif = getTileFromCoordinates({x: cif.x, y: cif.y});
      const canWalk = getCanWalkFromTile(tif, direction);
      
      if (!canWalk) {
        return;
      }

      if (mapTiles[cif.x][cif.y].canWalk) {
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
      default: return undefined;
    }
  }

  const getCoordinatesInDirection = ({x, y, direction}) => {
    switch (direction) {
      case DIRECTION_UP: return { x: x - 1, y }
      case DIRECTION_DOWN: return { x: x + 1, y }
      case DIRECTION_LEFT: return { x, y: y + 1 }
      case DIRECTION_RIGHT: return { x, y: y - 1 }
      default: return undefined;
    }
  }

  const getCanWalkFromTile = (tile, direction) => {
    if (!tile.canWalk) {
      return false;
    }

    if (tile.isLedge && direction != DIRECTION_DOWN) {
      return false;
    }

    return true;
  }

  const getTileFromCoordinates = ({x, y}) => {
    try {
      let tile = mapTiles[x][y];
      return tile
    } catch (e) {
      alert(e)
    }
  }

  return (
    <div className="TextMap">
      <code>
        {mapElements}
      </code>
    </div>
  );
}

export default TextMap;
