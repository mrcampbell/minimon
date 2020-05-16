import React from 'react';

const StoreContext = React.createContext({});
const StoreConsumer = StoreContext.Consumer;


const initialState = {
  count: 0,
  userCoordinates: { x: 1, y: 1 },
  dialogueQueue: [],
  dialogueIsHidden: true,
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
    add: (state, num) => ({
      ...state,
      count: state.count + num
    }),
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
      let dialogue = state.dialogueQueue.slice();
      dialogue.shift();
      return {
      ...state,
      dialogueQueue: dialogue.slice(),
      dialogueIsHidden: dialogue.length === 0,
    }}
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
