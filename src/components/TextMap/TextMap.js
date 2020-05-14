import React, { useState, useEffect } from 'react';
import './TextMap.css'
import { Map } from '../../service/map-import';
import { Dialog } from '../Dialog/Dialog';


const VIEWPORT_SCROLL_THRESHOLD = 3;
const VIEWPORT_HEIGHT = 8;
const VIEWPORT_WIDTH = 8;

export const DIRECTION_UP = "DIRECTION_UP"
export const DIRECTION_DOWN = "DIRECTION_DOWN"
export const DIRECTION_LEFT = "DIRECTION_LEFT"
export const DIRECTION_RIGHT = "DIRECTION_RIGHT"

const UNICODE_UP_ARROW = "▲"
const UNICODE_DOWN_ARROW = "▼"
const UNICODE_LEFT_ARROW = "◀"
const UNICODE_RIGHT_ARROW = "▶"

const INPUT_TYPE_DIRECTION = "INPUT_TYPE_DIRECTION"
const INPUT_TYPE_ACTION = "INPUT_TYPE_ACTION"
const INPUT_DIRECTION_UP = { key: "INPUT_DIRECTION_UP", type: INPUT_TYPE_DIRECTION, direction: DIRECTION_UP }
const INPUT_DIRECTION_DOWN = { key: "INPUT_DIRECTION_DOWN", type: INPUT_TYPE_DIRECTION, direction: DIRECTION_DOWN }
const INPUT_DIRECTION_LEFT = { key: "INPUT_DIRECTION_LEFT", type: INPUT_TYPE_DIRECTION, direction: DIRECTION_LEFT }
const INPUT_DIRECTION_RIGHT = { key: "INPUT_DIRECTION_RIGHT", type: INPUT_TYPE_DIRECTION, direction: DIRECTION_RIGHT }
const INPUT_ACTION_PRIMARY = { key: "INPUT_ACTION_PRIMARY", type: INPUT_TYPE_ACTION }


function TextMap() {

  const map = new Map();

  const [userCoordinates, setUserCoordinates] = useState({ x: 1, y: 1 })
  const [currentUserDirection, setCurrentUserDirection] = useState(DIRECTION_DOWN)
  const [topLeftCoordinates, setTopLeftCoordinates] = useState({ x: 0, y: 0 })
  const [playerSprite, setPlayerSprite] = useState(UNICODE_DOWN_ARROW)
  const [dialogQueue, setDialogQueue] = useState(["hey", "you!"]);
  const [dialogIsHidden, setDialogIsHidden] = useState(false);

  let cells = map.getMapCells()
  const [mapTiles, setMapTiles] = useState(cells)

  const [itemTiles, setItemTiles] = useState(map.getItemCells())

  const [mapElements, setMapElements] = useState([])

  useEffect(() => {
    applyForceDirection({ mapTiles, userCoordinates }); // if on slide tiles, ledge, etc
    renderMap(mapTiles, itemTiles, userCoordinates);
    scrollMap(topLeftCoordinates, userCoordinates);

  }, [mapTiles, userCoordinates, itemTiles])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  useEffect(() => {
    setPlayerSprite(getPlayerIconFromDirection(currentUserDirection))
  }, [currentUserDirection])

  const getPlayerIconFromDirection = (direction) => {
    switch (direction) {
      case DIRECTION_UP: return UNICODE_UP_ARROW;
      case DIRECTION_DOWN: return UNICODE_DOWN_ARROW;
      case DIRECTION_LEFT: return UNICODE_RIGHT_ARROW;
      case DIRECTION_RIGHT: return UNICODE_LEFT_ARROW;
      default: {
        console.log("unknown player direction")
        return UNICODE_DOWN_ARROW;
      }
    }
  }

  const applyForceDirection = ({ mapTiles, userCoordinates }) => {
    const tileBeneathPlayer = getTileFromCoordinates({ tiles: mapTiles, x: userCoordinates.x, y: userCoordinates.y })
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

  const renderMap = (mapTiles, itemTiles, userCoordinates) => {
    let elements = [];
    for (
      let xIdx = topLeftCoordinates.x;
      xIdx <= topLeftCoordinates.x + VIEWPORT_HEIGHT &&
      xIdx < mapTiles.length;
      xIdx++
    ) {
      let line = []
      for (
        let yIdx = topLeftCoordinates.y;
        yIdx <= topLeftCoordinates.y + VIEWPORT_WIDTH &&
        yIdx <= mapTiles[0].length;
        yIdx++
      ) {
        let item = getTileFromCoordinates({ tiles: itemTiles, x: xIdx, y: yIdx })
        let cell = getTileFromCoordinates({ tiles: mapTiles, x: xIdx, y: yIdx })

        if (!cell) {
          continue;
        }

        if (yIdx === userCoordinates.y && xIdx === userCoordinates.x) {
          line.push(<div className="tile-wrapper" key={`${xIdx}-${yIdx}`} style={{ backgroundColor: cell.backgroundColor }}>
            {playerSprite}
          </div>);
        } else if (item && !item.isHidden && !item.pickedUp) {
          line.push(<div className="tile-wrapper" key={`${xIdx}-${yIdx}`} style={{ backgroundColor: cell.backgroundColor }}>o</div>);
        } else {
          line.push(<div className="tile-wrapper" key={`${xIdx}-${yIdx}`}>{cell.element}</div>);
        }
      }
      elements.push(<div key={`${xIdx}-row`} className="tile-row">{line}</div>)
    }
    setMapElements(<div className="tile-map-wrapper">{elements}</div>)
  }

  const handleKeyDown = (e) => {
    const input = getInputFromKeyPress(e);

    if (!input) { // unrecognized input
      return;
    }

    if (input.type === INPUT_TYPE_DIRECTION) { // arrow keys
      if (!dialogIsHidden) {
        return; // movement locked when dialog is open
      }

      // const isContinuingInSameDirection = currentUserDirection === input.direction;

      setCurrentUserDirection(input.direction)
      // setPlayerSprite(getPlayerIconFromDirection(input.direction))

      const cif = getCoordinatesInDirection({ x: userCoordinates.x, y: userCoordinates.y, direction: input.direction })
      const tif = getTileFromCoordinates({ tiles: mapTiles, x: cif.x, y: cif.y });
      const canWalk = getCanWalkFromTile({ tileInFront: tif, coordinatesInFront: cif, direction: input.direction });

      if (!canWalk) {
        return
      }

      if (mapTiles[cif.x][cif.y].canWalk) {
        setUserCoordinates(cif)
      }

    } else if (input.type === INPUT_TYPE_ACTION) {
      if (input === INPUT_ACTION_PRIMARY) {
        if (dialogQueue.length > 0) {
          dialogQueue.shift()
          setDialogQueue(dialogQueue.slice())
        } if (dialogQueue.length === 0) {
          setDialogIsHidden(true)
        }
      }

      const cif = getCoordinatesInDirection({ x: userCoordinates.x, y: userCoordinates.y, direction: currentUserDirection })
      performAction({ userCoordinates, coordinatesInFront: cif, action: input })
    }
  }

  const scrollMap = (topLeftCoordinates, userCoordinates) => {
    let tmpTopLeftX = topLeftCoordinates.x, tmpTopLeftY = topLeftCoordinates.y;

    // console.log({user: userCoordinates.y, topLeft: topLeftCoordinates.y, diff: (userCoordinates.y - topLeftCoordinates.y)})
    if (userCoordinates.x - topLeftCoordinates.x > VIEWPORT_SCROLL_THRESHOLD) {
      tmpTopLeftX++
    }
    if (userCoordinates.x - topLeftCoordinates.x < VIEWPORT_SCROLL_THRESHOLD) {
      tmpTopLeftX--
    }
    if (userCoordinates.y - topLeftCoordinates.y > VIEWPORT_SCROLL_THRESHOLD) {
      tmpTopLeftY++
    }
    if (userCoordinates.y - topLeftCoordinates.y < VIEWPORT_SCROLL_THRESHOLD) {
      tmpTopLeftY--
    }

    if (tmpTopLeftX < 0) {
      tmpTopLeftX = 0;
    }
    if (tmpTopLeftY < 0) {
      tmpTopLeftY = 0;
    }
    setTopLeftCoordinates({ x: tmpTopLeftX, y: tmpTopLeftY })
  }

  const performAction = ({ userCoordinates, coordinatesInFront, action }) => {
    // check if item:
    let item = getTileFromCoordinates({ tiles: itemTiles, x: coordinatesInFront.x, y: coordinatesInFront.y })
    if (item && !item.pickedUp) {
      pickupItem({ itemTiles, coordinatesInFront })
    }
  }

  const pickupItem = ({ itemTiles, coordinatesInFront }) => {
    let newItems = [];
    let x = 0, y = 0;
    itemTiles.forEach(row => {
      let newRow = [];
      row.forEach(cell => {
        if (x === coordinatesInFront.x && y === coordinatesInFront.y) {
          cell.pickedUp = true;
          setDialogIsHidden(false)
          dialogQueue.push(`You found a(n) ${cell.itemType}!`)
        }
        newRow.push(cell)
        y++;
      })
      y = 0;
      x++;
      newItems.push(newRow)
    })
    setItemTiles(newItems)
  }

  const getInputFromKeyPress = (e) => {
    switch (e.keyCode) {
      case 38: return INPUT_DIRECTION_UP;
      case 40: return INPUT_DIRECTION_DOWN;
      case 39: return INPUT_DIRECTION_LEFT;
      case 37: return INPUT_DIRECTION_RIGHT;
      case 13: return INPUT_ACTION_PRIMARY;
      default: return undefined;
    }
  }

  const getCoordinatesInDirection = ({ x, y, direction }) => {
    switch (direction) {
      case DIRECTION_UP: return { x: x - 1, y }
      case DIRECTION_DOWN: return { x: x + 1, y }
      case DIRECTION_LEFT: return { x, y: y + 1 }
      case DIRECTION_RIGHT: return { x, y: y - 1 }

      default: console.error('nope', direction);
    }
  }

  const getCanWalkFromTile = ({ tileInFront, coordinatesInFront, direction }) => {
    if (!tileInFront.canWalk) {
      return false;
    }

    let item = getTileFromCoordinates({ tiles: itemTiles, x: coordinatesInFront.x, y: coordinatesInFront.y })

    if (item && !item.isHidden && !item.pickedUp) {
      return false
    }

    if (tileInFront.isLedge && direction != DIRECTION_DOWN) {
      return false;
    }

    return true;
  }

  const getTileFromCoordinates = ({ tiles, x, y, }) => {
    try {
      let tile = tiles[x][y];
      return tile
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="TextGameWrapper">
      <div className="TextMap">
        <code>
          {mapElements}
        </code>
      </div>
      <div className="dialog-wrapper">
        <Dialog message={dialogQueue[0]}/>
      </div>
    </div>
  );
}

export default TextMap;
