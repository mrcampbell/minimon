import React from 'react';
import { DIRECTION_DOWN, UNICODE_DOWN_ARROW, INPUT_TYPE_DIRECTION } from '../constants';
import { MapService } from '../service/map-import';

const StoreContext = React.createContext({});
const StoreConsumer = StoreContext.Consumer;

const mapService = new MapService();


const initialState = {
  mapID: 'A',
  userCoordinates: { x: 1, y: 1 },
  dialogueQueue: [],
  dialogueIsHidden: true,
  mapTiles: [],
  itemTiles: [],
  portalTiles: [],
  currentUserDirection: DIRECTION_DOWN,
  mapTopLeftCoordinates: { x: 0, y: 0 },
  playerSprite: UNICODE_DOWN_ARROW,
  justTeleported: false,
};

function makeStore({ actions }) {
  // Make a context for the store
  const context = React.createContext();

  // Make a provider that takes an initialValue
  const Provider = ({ children }) => {
    // Make a new state instance
    const [state, setState] = React.useState(initialState);

    // Bind the actions with the old state and args
    const boundActions = {};
    Object.keys(actions).forEach(key => {
      boundActions[key] = (...args) =>
        setState(old => actions[key](old, ...args))
    });

    // Memoize the context value to update when the state does
    const contextValue = React.useMemo(() => [state, boundActions], [state]);

    // Provide the store to children
    return <context.Provider value={contextValue}>{children}</context.Provider>;
  };

  // A hook to help consume the store
  const useStore = () => React.useContext(context);

  return [Provider, useStore];
}

const [StoreProvider, useStore] = makeStore({
  actions: {
    setUserCoordinates: (state, coordinates) => ({
      ...state,
      userCoordinates: { x: coordinates.x, y: coordinates.y }
    }),
    appendToDialogQueue: (state, messages) => ({
      ...state,
      dialogueQueue: state.dialogueQueue.concat(messages),
      dialogueIsHidden: state.dialogueQueue.length === 0 && messages.length === 0,
    }),
    advanceDialogue: (state) => {
      let dialogue = state.dialogueQueue.slice(); // todo: ?
      dialogue.shift();
      return {
        ...state,
        dialogueQueue: dialogue.slice(),
        dialogueIsHidden: dialogue.length === 0,
      }
    },
    setMapID: (state, mapID) => {
      console.log('setting map')
      let map = mapService.getMap(mapID);
      let mapTiles = map.getMapCells()

      console.log(mapTiles)
      return {
        ...state,
        mapID,
        mapTiles: mapTiles,
        itemTiles: map.getItemCells(),
        portalTiles: map.portals.slice(),
        mapTopLeftCoordinates: { x: 0, y: 0 }// todo: tie to map values
      }
    },
    setMapTiles: (state, mapTiles) => ({
      ...state,
      mapTiles,
    }),
    setItemTiles: (state, itemTiles) => ({
      ...state,
      itemTiles,
    }),
    setPortalTiles: (state, portalTiles) => ({
      ...state,
      portalTiles,
    }),
    setCurrentUserDirection: (state, currentUserDirection) => ({
      ...state,
      currentUserDirection,
    }),
    setMapTopLeftCoordinates: (state, mapTopLeftCoordinates) => ({
      ...state,
      mapTopLeftCoordinates,
    }),
    setPlayerSprite: (state, playerSprite) => ({
      ...state,
      playerSprite,
    }),
    setJustTeleported: (state, justTeleported) => ({
      ...state,
      justTeleported,
    }),
    handleInput: (state, input) => {
      if (input.type === INPUT_TYPE_DIRECTION) { // arrow keys
        if (!state.dialogueIsHidden) {
          return; // movement locked when dialog is open
        }
        let currentUserDirection = input.direction;

        // this.setCurrentUserDirection(state, input.direction)
        const cif = MapService.getCoordinatesInDirection({ x: state.userCoordinates.x, y: state.userCoordinates.y, direction: input.direction })

        console.log("cif", cif)
        console.log({ x: state.userCoordinates.x, y: state.userCoordinates.y, direction: input.direction })
        console.log({ tiles: state.mapTiles, x: cif.x, y: cif.y })
        const tif = MapService.getTileFromCoordinates({ tiles: state.mapTiles, x: cif.x, y: cif.y });
        console.log("tif", tif)
        const canWalk = MapService.getCanWalkFromTile({ tileInFront: tif, coordinatesInFront: cif, direction: input.direction, itemTiles: state.itemTiles });

        console.log(canWalk)
        if (!canWalk) {
          return state;
        }

        //   if (justTeleported) {
        //     setJustTeleported(false)
        //   }
        //   if (mapTiles[cif.x][cif.y].canWalk) {
        //     setUserCoordinates(cif)
        //   }

        // } else if (input.type === INPUT_TYPE_ACTION) {
        //   if (input === INPUT_ACTION_PRIMARY) {
        //     if (dialogueQueue.length > 0) {
        //       advanceDialogue()
        //     } else {
        //       const cif = getCoordinatesInDirection({ x: userCoordinates.x, y: userCoordinates.y, direction: currentUserDirection })
        //       performAction({ userCoordinates, coordinatesInFront: cif, action: input })
        //     }
        //   }
        state = { ...state, currentUserDirection };
        return state;
      } 
      return state
    },
  }
});

export const withStore = (Component) => {
  return function (props) {
    return <StoreConsumer>
      {context =>
        <Component
          {...context}
          {...props}
        />}
    </StoreConsumer>;
  }
};

export {
  StoreProvider,
  useStore,
}
