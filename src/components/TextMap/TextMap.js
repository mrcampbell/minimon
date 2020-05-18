import React, { useState, useEffect } from 'react';
import './TextMap.css'
import { Dialog } from '../Dialog/Dialog';
import { useStore, withStore } from '../../store/store';
import { DIRECTION_UP, DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, UNICODE_UP_ARROW, UNICODE_DOWN_ARROW, UNICODE_LEFT_ARROW, UNICODE_RIGHT_ARROW, INPUT_DIRECTION_DOWN, INPUT_DIRECTION_RIGHT, INPUT_ACTION_PRIMARY, INPUT_DIRECTION_UP, INPUT_DIRECTION_LEFT } from '../../constants';
import { MapService } from '../../service/map-import';

const VIEWPORT_SCROLL_THRESHOLD = 3;
const VIEWPORT_HEIGHT = 8;
const VIEWPORT_WIDTH = 8;


function TextMap() {
  console.log('render')
  const [
    {userCoordinates, dialogueQueue, dialogueIsHidden, mapID, mapTiles, itemTiles, portalTiles, currentUserDirection, mapTopLeftCoordinates, playerSprite, justTeleported}, 
    {setUserCoordinates,appendToDialogQueue, advanceDialogue, setMapID, setMapTiles, setItemTiles, setPortalTiles, setCurrentUserDirection, setMapTopLeftCoordinates, setPlayerSprite, setJustTeleported, handleInput}
  ] = useStore();

  const storeRef = React.useRef(useStore());

  useEffect(() => {
    setMapID('A');
  }, []);


  const [mapElements, setMapElements] = useState([])

  useEffect(() => {
    // applyForceDirection({ mapTiles, userCoordinates }); // if on slide tiles, ledge, etc
    renderMap(mapTiles, itemTiles, userCoordinates);
    scrollMap(mapTopLeftCoordinates, userCoordinates);
    applyPortal(userCoordinates);
  }, [mapTiles, userCoordinates, itemTiles, portalTiles])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  useEffect(() => {
    let sprite = getPlayerIconFromDirection(currentUserDirection)
    setPlayerSprite(sprite)
    console.log('yo', currentUserDirection, sprite)
  }, [currentUserDirection])

  const applyPortal = (userCoordinates) => {
      portalTiles.forEach(p => {
        if (
          p.coordinates.x === userCoordinates.x 
          && p.coordinates.y === userCoordinates.y
          && !justTeleported // if you just arrived, don't teleport back
          ) {
          setMapID(p.destination.map_id)
          setUserCoordinates(p.destination.coordinates)
          setJustTeleported(true)
        }
      })
  }

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
    const tileBeneathPlayer = MapService.getTileFromCoordinates({ tiles: mapTiles, x: userCoordinates.x, y: userCoordinates.y })
    if (tileBeneathPlayer.forceDirection) {
      let targetCoordinates = MapService.getCoordinatesInDirection({
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
      let xIdx = mapTopLeftCoordinates.x;
      xIdx <= mapTopLeftCoordinates.x + VIEWPORT_HEIGHT &&
      xIdx < mapTiles.length;
      xIdx++
    ) {
      let line = []
      for (
        let yIdx = mapTopLeftCoordinates.y;
        yIdx <= mapTopLeftCoordinates.y + VIEWPORT_WIDTH &&
        yIdx <= mapTiles[0].length;
        yIdx++
      ) {
        let item = MapService.getTileFromCoordinates({ tiles: itemTiles, x: xIdx, y: yIdx })
        let cell = MapService.getTileFromCoordinates({ tiles: mapTiles, x: xIdx, y: yIdx })

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


  const scrollMap = (mapTopLeftCoordinates, userCoordinates) => {
    let tmpTopLeftX = mapTopLeftCoordinates.x, tmpTopLeftY = mapTopLeftCoordinates.y;

    // console.log({user: userCoordinates.y, topLeft: mapTopLeftCoordinates.y, diff: (userCoordinates.y - mapTopLeftCoordinates.y)})
    if (userCoordinates.x - mapTopLeftCoordinates.x > VIEWPORT_SCROLL_THRESHOLD) {
      tmpTopLeftX++
    }
    if (userCoordinates.x - mapTopLeftCoordinates.x < VIEWPORT_SCROLL_THRESHOLD) {
      tmpTopLeftX--
    }
    if (userCoordinates.y - mapTopLeftCoordinates.y > VIEWPORT_SCROLL_THRESHOLD) {
      tmpTopLeftY++
    }
    if (userCoordinates.y - mapTopLeftCoordinates.y < VIEWPORT_SCROLL_THRESHOLD) {
      tmpTopLeftY--
    }

    if (tmpTopLeftX < 0) {
      tmpTopLeftX = 0;
    }
    if (tmpTopLeftY < 0) {
      tmpTopLeftY = 0;
    }
    setMapTopLeftCoordinates({ x: tmpTopLeftX, y: tmpTopLeftY })
  }

  const performAction = ({ userCoordinates, coordinatesInFront, action }) => {
    // check if item:
    let item = MapService.getTileFromCoordinates({ tiles: itemTiles, x: coordinatesInFront.x, y: coordinatesInFront.y })
    if (item && !item.pickedUp) {
      pickupItem({ itemTiles, coordinatesInFront })
      return;
    }

    let tile = MapService.getTileFromCoordinates({ tiles: mapTiles, x: coordinatesInFront.x, y: coordinatesInFront.y })
    if (tile.isReadable && tile.message && tile.message.length > 0) {
      appendToDialogQueue(tile.message.slice())
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
          appendToDialogQueue(`You found a(n) ${cell.itemType}!`)
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



  const handleKeyDown = (e) => {
    const input = getInputFromKeyPress(e);

    if (!input) { // unrecognized input
      return;
    }

    handleInput(input)
  }

  return (
    <div className="TextGameWrapper">
      <div className="TextMap">
        <code>
          {mapElements}
        </code>
      </div>
      <div className="dialog-wrapper">
        <Dialog message={dialogueQueue[0]}/>
      </div>
    </div>
  );
}

export default withStore(TextMap);
